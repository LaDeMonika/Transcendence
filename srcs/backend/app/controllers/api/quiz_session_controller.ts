import Session from '#models/quizsession/quizsession'
import QuizPlayer from '#models/quizsession/quiz_player'
import type { HttpContext } from '@adonisjs/core/http'
import type User from '#models/user'
import Question from '#models/Question'
import { quizEngine } from '#services/quiz_engine'

export default class QuizSessionController {
  public async create({ request, response, auth }: HttpContext) {
    const { quizId, hostId, conversationId } = request.only(['quizId', 'hostId', 'conversationId'])
    if (!quizId) {
      return response.badRequest({ error: 'quizId is required' })
    }

    let resolvedHostId = hostId
    if (!resolvedHostId) {
      try{
        //TODO figure out why it fails to authenticate in this route when auth is optional, works fine in other routes with same auth.optional() setup
        const user = await auth.authenticate() as User
        resolvedHostId = user.id
      } catch {
        return response.badRequest({ error: 'hostId is required when unauthenticated' })
      }
    }

    const quizSession = await Session.create({
      quizId,
      hostId: resolvedHostId,
      conversationId: conversationId ?? null,
      state: 'lobby',
    })

    const firstQuestion = await Question.query().where('quiz_id', quizId).orderBy('id').first()
    if (firstQuestion) {
      quizSession.currentQuestionId = firstQuestion.id
      await quizSession.save()
    }

    return quizSession
  }

  public async show({ params }: HttpContext) {
    const { id } = params
    const quizSession = await Session.query().where('id', id).preload('players').firstOrFail()
    return quizSession
  }

    public async join({ params, auth }: HttpContext) {
    const { id } = params
    const user = await auth.authenticate() as User
    const quizSession = await Session.findOrFail(id)

    let quizPlayer = await QuizPlayer.query()
        .where('sessionId', quizSession.id)
        .where('userId', user.id)
        .first()

    if (!quizPlayer) {
        quizPlayer = await QuizPlayer.create({
        sessionId: quizSession.id,
        userId: user.id,
        score: 0,
        })
    }

    return quizPlayer
    }

  public async start({ params, auth }: HttpContext) {
    const { id } = params
    const quizSession = await Session.findOrFail(id)

    const user = await auth.authenticate() as User
    if (quizSession.hostId !== user.id) {
      return { error: 'Only the host can start the quiz' }
    }

    // Reuse the websocket engine here so there is only one implementation of the live quiz state machine.
    return quizEngine.startSession(quizSession)
  }

  public async state({ params, auth }: HttpContext) {
    const { id } = params
    const quizSession = await Session.findOrFail(id)

    let userId: number | undefined
    try {
      const user = await auth.authenticate() as User
      userId = user.id
    } catch {
      // TODO: error handling?
    }

    return quizEngine.buildStatePayload(quizSession, userId)
  }

  public async standings({ params }: HttpContext) {
    const { id } = params

    const quizSession = await Session.query().where('id', id).firstOrFail()

    const standings = await QuizPlayer.query().where('sessionId', id).preload('user').orderBy('score', 'desc')

    return {
      sessionId: quizSession.id,
      standings: standings.map((player, index) => ({
        rank: index + 1,
        userId: player.userId,
        username: player.user.userName,
        score: player.score,
      })),
    }
  }
}
