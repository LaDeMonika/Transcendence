import Question from '#models/Question'
import QuizPlayer from '#models/quizsession/quiz_player'
import QuizSpectator from '#models/quizsession/quiz_spectator'
import Session from '#models/quizsession/quizsession'
import { quizRooms } from '#services/quizroom'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

// These durations are server-owned so every client stays in sync with the same round timing.
const QUESTION_DURATION_SECONDS = 20
const REVEAL_DURATION_SECONDS = 5

type TimerHandles = {
  questionTimeout?: ReturnType<typeof setTimeout>
  revealTimeout?: ReturnType<typeof setTimeout>
}

class QuizEngine {
  private timers = new Map<number, TimerHandles>()

  private clearTimers(sessionId: number) {
    // Only one question timer and one reveal timer may exist per session.
    const existing = this.timers.get(sessionId)
    if (existing?.questionTimeout) clearTimeout(existing.questionTimeout)
    if (existing?.revealTimeout) clearTimeout(existing.revealTimeout)
    this.timers.delete(sessionId)
  }

  private setQuestionTimeout(sessionId: number, timeout: ReturnType<typeof setTimeout>) {
    const existing = this.timers.get(sessionId) ?? {}
    existing.questionTimeout = timeout
    this.timers.set(sessionId, existing)
  }

  private setRevealTimeout(sessionId: number, timeout: ReturnType<typeof setTimeout>) {
    const existing = this.timers.get(sessionId) ?? {}
    existing.revealTimeout = timeout
    this.timers.set(sessionId, existing)
  }

  private getOrderedQuestions(quizId: number) {
    // The engine advances by question order, so every transition reads the same canonical sequence.
    return Question.query().where('quizId', quizId).orderBy('id', 'asc')
  }

  private sanitizeQuestion(question: Question) {
    // Never broadcast correctAnswer during the live question phase or clients can cheat.
    return {
      id: question.id,
      quizId: question.quizId,
      question: question.question,
      answerA: question.answerA,
      answerB: question.answerB,
      answerC: question.answerC,
      answerD: question.answerD,
    }
  }

  async getStandings(sessionId: number) {
    // Leaderboards are always sorted by score descending and then by creation order for stable output.
    const standings = await QuizPlayer.query()
      .where('sessionId', sessionId)
      .preload('user')
      .orderBy('score', 'desc')
      .orderBy('id', 'asc')

    return standings.map((player, index) => ({
      rank: index + 1,
      userId: player.userId,
      username: player.user.userName,
      score: player.score,
    }))
  }

  private async getAudienceCounts(sessionId: number) {
    const [playerResult, spectatorResult] = await Promise.all([
      QuizPlayer.query().where('sessionId', sessionId).count('* as total').first(),
      QuizSpectator.query().where('sessionId', sessionId).count('* as total').first(),
    ])

    return {
      playerCount: Number(playerResult?.$extras.total ?? 0),
      spectatorCount: Number(spectatorResult?.$extras.total ?? 0),
    }
  }

  async buildStatePayload(session: Session, userId?: number, role: 'player' | 'spectator' = 'player') {
    // Rejoining clients need the current question and their answered state to rebuild the live UI.
    const currentQuestion = session.currentQuestionId ? await Question.find(session.currentQuestionId) : null
    let alreadyAnswered = false
    if (role === 'player' && userId && session.currentQuestionId) {
      const answer = await db.from('quiz_answers')
        .where('session_id', session.id)
        .where('question_id', session.currentQuestionId)
        .where('user_id', userId)
        .first()

      alreadyAnswered = Boolean(answer)
    }

    return {
      type: 'quiz:state',
      sessionId: session.id,
      state: session.state,
      role,
      questionId: session.currentQuestionId ?? null,
      question: currentQuestion ? this.sanitizeQuestion(currentQuestion) : null,
      startedAt: session.startedAt?.toISO() ?? null,
      questionStartedAt: session.questionStartedAt?.toISO() ?? null,
      questionEndsAt: session.questionEndsAt?.toISO() ?? null,
      revealEndsAt: session.revealEndsAt?.toISO() ?? null,
      finishedAt: session.finishedAt?.toISO() ?? null,
      alreadyAnswered,
      ...(await this.getAudienceCounts(session.id)),
      standings: session.state === 'reveal' || session.state === 'finished'
        ? await this.getStandings(session.id)
        : undefined,
    }
  }

  async syncSocket(ws: any, session: Session, userId?: number, role: 'player' | 'spectator' = 'player') {
    // Send the current server state immediately after join so reconnects do not drift from the round timer.
    ws.send(JSON.stringify(await this.buildStatePayload(session, userId, role)))
  }

  async startSession(session: Session) {
    // Starting a session resets any stale timers before the first live round begins.
    this.clearTimers(session.id)

    const firstQuestion = await this.getOrderedQuestions(session.quizId).first()
    if (!firstQuestion) {
      // An empty quiz cannot enter the live loop, so mark it finished immediately.
      session.state = 'finished'
      session.startedAt = DateTime.now()
      session.finishedAt = DateTime.now()
      await session.save()

      quizRooms.broadcastToSession(String(session.id), {
        type: 'quiz:finished',
        sessionId: session.id,
        standings: await this.getStandings(session.id),
      })
      return session
    }

    session.startedAt = DateTime.now()
    await session.save()

    // This tells connected players the lobby is over before the first question payload arrives.
    quizRooms.broadcastToSession(String(session.id), {
      type: 'quiz:started',
      sessionId: session.id,
      startedAt: session.startedAt.toISO(),
    })

    return this.startQuestion(session.id, firstQuestion.id)
  }

  async startQuestion(sessionId: number, questionId: number) {
    const session = await Session.findOrFail(sessionId)
    const question = await Question.findOrFail(questionId)

    // A new round replaces any previous outstanding timers for this session.
    this.clearTimers(sessionId)

    const now = DateTime.now()
    const endsAt = now.plus({ seconds: QUESTION_DURATION_SECONDS })

    // The session timestamps are the source of truth for countdowns and answer validation.
    session.state = 'question'
    session.currentQuestionId = question.id
    session.questionStartedAt = now
    session.questionEndsAt = endsAt
    session.revealEndsAt = null
    session.finishedAt = null
    await session.save()

    quizRooms.broadcastToSession(String(session.id), {
      type: 'quiz:question:start',
      sessionId: session.id,
      question: this.sanitizeQuestion(question),
      startedAt: now.toISO(),
      endsAt: endsAt.toISO(),
      durationSeconds: QUESTION_DURATION_SECONDS,
    })

    // The server, not the frontend, decides when the answer window closes.
    const timeout = setTimeout(() => {
      void this.closeQuestion(sessionId)
    }, QUESTION_DURATION_SECONDS * 1000)
    this.setQuestionTimeout(sessionId, timeout)

    return session
  }

  async closeQuestion(sessionId: number) {
    const session = await Session.findOrFail(sessionId)
    if (session.state !== 'question') return session

    // Closing the round freezes answer acceptance and starts the reveal phase countdown.
    const revealEndsAt = DateTime.now().plus({ seconds: REVEAL_DURATION_SECONDS })
    session.state = 'reveal'
    session.questionEndsAt = DateTime.now()
    session.revealEndsAt = revealEndsAt
    await session.save()

    quizRooms.broadcastToSession(String(session.id), {
      type: 'quiz:question:closed',
      sessionId: session.id,
      questionId: session.currentQuestionId,
    })

    const question = await Question.find(session.currentQuestionId)
    // Reveal includes the correct answer and current standings so clients can show the round result screen.
    quizRooms.broadcastToSession(String(session.id), {
      type: 'quiz:question:reveal',
      sessionId: session.id,
      questionId: session.currentQuestionId,
      correctAnswer: question?.correctAnswer ?? null,
      standings: await this.getStandings(session.id),
      revealEndsAt: revealEndsAt.toISO(),
    })

    // After reveal time expires, the engine either advances or finishes automatically.
    const timeout = setTimeout(() => {
      void this.advanceSession(sessionId)
    }, REVEAL_DURATION_SECONDS * 1000)
    this.setRevealTimeout(sessionId, timeout)

    return session
  }

  async advanceSession(sessionId: number) {
    const session = await Session.findOrFail(sessionId)
    const questions = await this.getOrderedQuestions(session.quizId)
    const currentIndex = questions.findIndex((question) => question.id === session.currentQuestionId)
    const nextQuestion = currentIndex >= 0 ? questions[currentIndex + 1] : questions[0]

    // Leaderboard is emitted between rounds so clients can show ranking changes before the next question starts.
    quizRooms.broadcastToSession(String(session.id), {
      type: 'quiz:leaderboard',
      sessionId: session.id,
      standings: await this.getStandings(session.id),
    })

    if (!nextQuestion) {
      this.clearTimers(sessionId)
      // When no question remains, clear timing fields so reconnecting clients see a clean finished state.
      session.state = 'finished'
      session.finishedAt = DateTime.now()
      session.questionStartedAt = null
      session.questionEndsAt = null
      session.revealEndsAt = null
      await session.save()

      quizRooms.broadcastToSession(String(session.id), {
        type: 'quiz:finished',
        sessionId: session.id,
        standings: await this.getStandings(session.id),
      })
      return session
    }

    // If there is another question, the engine loops back into the next timed round automatically.
    return this.startQuestion(session.id, nextQuestion.id)
  }
}

export const quizEngine = new QuizEngine()
