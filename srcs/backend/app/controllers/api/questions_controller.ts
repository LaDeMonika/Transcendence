import Question from '#models/Question'
import type { HttpContext } from '@adonisjs/core/http'

export default class QuestionsController {

  // GET /api/random-question
  public async random() {
    const question = await Question.query()
      .orderByRaw('RANDOM()')
      .firstOrFail()

    return question
  }

  // GET /api/:quizId/:questionId/next-question
  public async next({ params }: HttpContext) {
    const { quizId, questionId } = params

    const nextQuestion = await Question.query()
      .where('quiz_id', quizId)
      .where('id', '>', questionId)
      .orderBy('id')
      .first()

    return nextQuestion || null
  }

  // POST /api/submit-answer
  public async submit({ request }: HttpContext) {
    const { questionId, answer } = request.only(['questionId', 'answer'])

    const question = await Question.findOrFail(questionId)

    return {
      correct: question.correctAnswer === answer,
    }
  }
}
