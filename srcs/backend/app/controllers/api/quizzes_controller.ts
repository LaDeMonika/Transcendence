import Quiz from '#models/Quiz'
import type { HttpContext } from '@adonisjs/core/http'

export default class QuizzesController {

  // GET /api/quiz/:id
  public async show({ params }: HttpContext) {
    const quiz = await Quiz.query()
      .where('id', params.id)
      .preload('questions')
      .firstOrFail()

    return quiz
  }
}
