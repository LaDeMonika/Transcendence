import type { HttpContext } from '@adonisjs/core/http'
import Quiz from '#models/Quiz'
import User from '#models/user'
import Session from '#models/quizsession/quizsession'
import Question from '#models/Question'

export default class PublicApiController {
  /**
   * @listQuizzes
   * @tag public-api
   * @description List available quizzes for public API clients
   * @responseBody 200 - [{"id":1,"title":"General Knowledge"}]
   */
  async listQuizzes() {
    return Quiz.query().select('id', 'title')
  }

  /**
   * @showQuiz
   * @tag public-api
   * @description Return a public quiz view without correct answers
   * @paramPath id - Quiz id - @type(number)
   */
  async showQuiz({ params }: HttpContext) {
    return Quiz.query()
      .where('id', params.id)
      .preload('questions', (query) => {
        query.select([
          'id',
          'quiz_id',
          'question',
          'answer_a',
          'answer_b',
          'answer_c',
          'answer_d',
          'created_at',
          'updated_at',
        ])
      })
      .firstOrFail()
  }

  /**
   * @showUser
   * @tag public-api
   * @description Return a public user view
   * @paramPath id - User id - @type(number)
   */
  async showUser({ params }: HttpContext) {
    const user = await User.findOrFail(params.id)

    return {
      id: user.id,
      userName: user.userName,
      avatarUrl: user.avatarUrl,
    }
  }

  /**
   * @createQuizSession
   * @tag public-api
   * @description Create a quiz session via the public API
   * @requestBody {"quizId":1,"hostId":1,"conversationId":null}
   */
  async createQuizSession({ request, response }: HttpContext) {
    const { quizId, hostId, conversationId } = request.only(['quizId', 'hostId', 'conversationId'])

    if (!quizId || !hostId) {
      return response.badRequest({ error: 'quizId and hostId are required' })
    }

    const quizSession = await Session.create({
      quizId,
      hostId,
      conversationId: conversationId ?? null,
      state: 'lobby',
    })

    const firstQuestion = await Question.query().where('quiz_id', quizId).orderBy('id').first()
    if (firstQuestion) {
      quizSession.currentQuestionId = firstQuestion.id
      await quizSession.save()
    }

    return response.created(quizSession)
  }

  /**
   * @updateUser
   * @tag public-api
   * @description Update a username through the public API
   * @paramPath id - User id - @type(number)
   * @requestBody {"userName":"NewName"}
   */
  async updateUser({ params, request, response }: HttpContext) {
    const { userName } = request.only(['userName'])

    if (!userName) {
      return response.badRequest({ error: 'userName is required' })
    }

    const existingUser = await User.query()
      .where('userName', userName)
      .whereNot('id', params.id)
      .first()

    if (existingUser) {
      return response.badRequest({ error: 'Username is already taken' })
    }

    const user = await User.findOrFail(params.id)
    user.userName = userName
    await user.save()

    return { id: user.id, userName: user.userName }
  }

  /**
   * @deleteQuizSession
   * @tag public-api
   * @description Delete a quiz session through the public API
   * @paramPath id - Quiz session id - @type(number)
   */
  async deleteQuizSession({ params, response }: HttpContext) {
    const session = await Session.findOrFail(params.id)
    await session.delete()

    return response.ok({ message: 'Quiz session deleted successfully' })
  }
}
