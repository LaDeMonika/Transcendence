import { quizRooms } from '#services/quizroom'
import type User from '#models/user'
import Question from '#models/Question'
import QuizPlayer from '#models/quizsession/quiz_player'
import QuizSpectator from '#models/quizsession/quiz_spectator'
import Session from '#models/quizsession/quizsession'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { quizEngine } from '#services/quiz_engine'

export async function handleWsQuizMessage(ws: any, user: User, payload: any) {
  if (payload.type === 'quiz:join') {
    const sessionId = Number(payload.sessionId)
    if (!sessionId) {
      ws.send(JSON.stringify({ type: 'error', error: 'Missing sessionId' }))
      return true
    }
    const quizSession = await Session.query().where('id', sessionId).first()
    if (!quizSession) {
      ws.send(JSON.stringify({ type: 'error', error: 'Invalid sessionId' }))
      return true
    }

    const quizPlayerExists = await QuizPlayer.query().where('sessionId', sessionId).where('userId', user.id).first()
    if (!quizPlayerExists) {
      const spectator = await QuizSpectator.query().where('sessionId', sessionId).where('userId', user.id).first()
      if (spectator) {
        await spectator.delete()
      }

      await QuizPlayer.create({
        sessionId,
        userId: user.id,
        score: 0,
      })

      quizRooms.broadcastToSession(String(sessionId), {
        type: 'quiz:player:joined',
        sessionId,
        userId: user.id,
        username: user.userName,
      })
    }

    // Joining the socket room enables all future quiz broadcasts for this session.
    quizRooms.join(String(sessionId), ws)
    ws.send(JSON.stringify({ type: 'quiz:join:ok', sessionId, role: 'player' }))
    // Send the current quiz state right away so late joiners and reconnects can render the active round.
    await quizEngine.syncSocket(ws, quizSession, user.id, 'player')
    return true
  }

  if (payload.type === 'quiz:spectate') {
    const sessionId = Number(payload.sessionId)
    if (!sessionId) {
      ws.send(JSON.stringify({ type: 'error', error: 'Missing sessionId' }))
      return true
    }

    const quizSession = await Session.query().where('id', sessionId).first()
    if (!quizSession) {
      ws.send(JSON.stringify({ type: 'error', error: 'Invalid sessionId' }))
      return true
    }

    const quizPlayer = await QuizPlayer.query().where('sessionId', sessionId).where('userId', user.id).first()
    if (quizPlayer) {
      ws.send(JSON.stringify({ type: 'error', error: 'Players cannot join the same session as spectators' }))
      return true
    }

    const spectatorExists = await QuizSpectator.query().where('sessionId', sessionId).where('userId', user.id).first()
    if (!spectatorExists) {
      await QuizSpectator.create({
        sessionId,
        userId: user.id,
      })

      quizRooms.broadcastToSession(String(sessionId), {
        type: 'quiz:spectator:joined',
        sessionId,
        userId: user.id,
        username: user.userName,
      })
    }

    quizRooms.join(String(sessionId), ws)
    ws.send(JSON.stringify({ type: 'quiz:spectate:ok', sessionId, role: 'spectator' }))
    await quizEngine.syncSocket(ws, quizSession, user.id, 'spectator')
    return true
  }

  if (payload.type === 'quiz:leave') {
    const sessionId = Number(payload.sessionId)
    if (!sessionId) {
      ws.send(JSON.stringify({ type: 'error', error: 'Missing sessionId' }))
      return true
    }
    quizRooms.leave(String(sessionId), ws)
    ws.send(JSON.stringify({ type: 'quiz:leave:ok', sessionId }))
    return true
  }

  if (payload.type === 'quiz:start') {
    const sessionId = Number(payload.sessionId)
    if (!sessionId) {
      ws.send(JSON.stringify({ type: 'error', error: 'Missing sessionId' }))
      return true
    }

    const quizSession = await Session.find(sessionId)
    if (!quizSession) {
      ws.send(JSON.stringify({ type: 'error', error: 'Invalid sessionId' }))
      return true
    }

    if (quizSession.hostId !== user.id) {
      ws.send(JSON.stringify({ type: 'error', error: 'Only the host can start the quiz' }))
      return true
    }

    if (quizSession.state !== 'lobby') {
      ws.send(JSON.stringify({ type: 'error', error: 'Quiz has already started' }))
      return true
    }

    // Starting flows through the shared engine so REST and WS start actions behave identically.
    await quizEngine.startSession(quizSession)
    return true
  }

  if (payload.type === 'quiz:answerSubmit') {
    const sessionId = Number(payload.sessionId)
    const questionId = Number(payload.questionId)
    const answer = String(payload.answer ?? '').trim()

    if (!sessionId || !questionId || !answer) {
      ws.send(JSON.stringify({ type: 'error', error: 'Missing sessionId, questionId or answer' }))
      return true
    }

    // check validity of sessionId and questionId
    const quizSession = await Session.query().where('id', sessionId).first()
    if (!quizSession) {
      ws.send(JSON.stringify({ type: 'error', error: 'Invalid sessionId' }))
      return true
    }
    //check if user is part of the quiz session and the session is accepting answers for the question
    if (!quizRooms.isInSession(String(sessionId), ws)) {
      ws.send(JSON.stringify({ type: 'error', error: 'User is not part of the quiz session' }))
      return true
    }
    const player = await QuizPlayer.query().where('sessionId', sessionId).where('userId', user.id).first()
    if (!player) {
      ws.send(JSON.stringify({ type: 'error', error: 'Spectators cannot submit answers' }))
      return true
    }
    // Answers are only valid while the session is in the active question phase.
    if (quizSession.state !== 'question') {
      ws.send(JSON.stringify({ type: 'error', error: 'Question is not currently accepting answers' }))
      return true
    }
    // This prevents clients from answering a stale or future question id.
    if (quizSession.currentQuestionId !== questionId) {
      ws.send(JSON.stringify({ type: 'error', error: 'questionId does not match current question for session' }))
      return true
    }
    // The timer is enforced on the server so late answers cannot sneak in after the UI countdown hits zero.
    if (quizSession.questionEndsAt && DateTime.now() > quizSession.questionEndsAt) {
      ws.send(JSON.stringify({ type: 'error', error: 'Question timer has already expired' }))
      return true
    }

    // check if the user has already answered this question
    try {
      const existingAnswer = await db.from('quiz_answers')
        .where('session_id', sessionId)
        .where('question_id', questionId)
        .where('user_id', user.id)
        .first()

      if (existingAnswer) {
        ws.send(JSON.stringify({ type: 'quiz:answer:ack', alreadyAnswered: true }))
        return true
      }

      const correctanswer = await Question.query().where('id', questionId).select('correct_answer').first()
      const isCorrect = correctanswer?.correctAnswer === answer

      const now = DateTime.now()
      // Kahoot-style scoring rewards correct answers that arrive earlier in the question window.
      const totalMillis = quizSession.questionStartedAt && quizSession.questionEndsAt
        ? Math.max(quizSession.questionEndsAt.diff(quizSession.questionStartedAt).milliseconds, 1)
        : 1
      const remainingMillis = quizSession.questionEndsAt
        ? Math.max(quizSession.questionEndsAt.diff(now).milliseconds, 0)
        : 0
      const speedRatio = remainingMillis / totalMillis
      const points = isCorrect ? Math.round(500 + 500 * speedRatio) : 0

      await db.table('quiz_answers').insert({
        session_id: sessionId,
        question_id: questionId,
        user_id: user.id,
        selected_option: answer,
        is_correct: isCorrect,
        points,
        answered_at: now.toSQL(),
        created_at: now.toSQL(),
        updated_at: now.toSQL(),
      })

      // Player score stores accumulated points, not just correct-answer count.
      if (points > 0) {
        await db
          .from('quiz_players')
          .where('session_id', sessionId)
          .where('user_id', user.id)
          .increment('score', points)
      }

      // The ack returns scoring metadata so the client can confirm the submission result immediately.
      ws.send(JSON.stringify({ type: 'quiz:answer:ack', points, isCorrect }))
      return true
    } catch (error: any) {
      // Unique violation from concurrent duplicate submits.
      if (error?.code === '23505') {
        ws.send(JSON.stringify({ type: 'quiz:answer:ack', alreadyAnswered: true }))
        return true
      }

      console.error('[quiz:answerSubmit] Failed to submit answer', {
        sessionId,
        questionId,
        userId: user.id,
        answer,
        errorCode: error?.code,
        errorMessage: error?.message,
        errorDetail: error?.detail,
        errorConstraint: error?.constraint,
        errorStack: error?.stack,
      })

      ws.send(JSON.stringify({ type: 'error', error: 'Failed to submit answer' }))
      return true
    }
  }

  return false
}

