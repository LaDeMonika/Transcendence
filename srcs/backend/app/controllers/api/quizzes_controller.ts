import Quiz from '#models/Quiz'
import type { HttpContext } from '@adonisjs/core/http'

export default class QuizzesController {

  // GET /api/quiz/:id
  // does not show correct answers to prevent cheating, use /api/admin/quiz/:id for that
  public async show({ params }: HttpContext) {
    const quiz = await Quiz.query()
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

    return quiz
  }

  // GET /api/admin/quiz/:id
  public async showAdmin({ params }: HttpContext) {
    const quiz = await Quiz.query()
      .where('id', params.id)
      .preload('questions')
      .firstOrFail()

    return quiz
  }

  // GET /api/start-quiz/:id
}
