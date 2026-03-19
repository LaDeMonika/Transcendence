import { quizRooms } from '#services/quizroom'
import type User from '#models/user'
import Question from '#models/Question'
import QuizPlayer from '#models/quizsession/quiz_player'
import Session from '#models/quizsession/quizsession'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

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
      await QuizPlayer.create({
        sessionId,
        userId: user.id,
        score: 0,
      })
    }

    quizRooms.join(String(sessionId), ws)
    ws.send(JSON.stringify({ type: 'quiz:join:ok', sessionId }))
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

  if (payload.type === 'quiz:answerSubmit') {
    const sessionId = Number(payload.sessionId)
    const questionId = Number(payload.questionId)
    const answer = String(payload.answer ?? '').trim()

    if (!sessionId || !questionId || !answer) {
      ws.send(JSON.stringify({ type: 'error', error: 'Missing sessionId, questionId or answer' }))
      return true
    }

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
      await db.table('quiz_answers').insert({
        session_id: sessionId,
        question_id: questionId,
        user_id: user.id,
        selected_option: answer,
        is_correct: isCorrect,
        answered_at: now.toSQL(),
        created_at: now.toSQL(),
        updated_at: now.toSQL(),
      })

      if (isCorrect) {
        await db
          .from('quiz_players')
          .where('session_id', sessionId)
          .where('user_id', user.id)
          .increment('score', 1)
      }

      ws.send(JSON.stringify({ type: 'quiz:answer:ack' }))
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

