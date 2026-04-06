import Question from '#models/Question'
import type { HttpContext } from '@adonisjs/core/http'

export default class QuestionsController {
  // Helper method to sanitize question data by excluding the correct answer
  private sanitizeQuestion(question: Question) {
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

  // GET /api/random-question
  public async random() {
    const question = await Question.query()
      .orderByRaw('RANDOM()')
      .firstOrFail()

    return this.sanitizeQuestion(question)
  }

  // GET /api/:quizId/:questionId/next-question
  public async next({ params }: HttpContext) {
    const { quizId, questionId } = params

    const nextQuestion = await Question.query()
      .where('quiz_id', quizId)
      .where('id', '>', questionId)
      .orderBy('id')
      .first()

    return nextQuestion ? this.sanitizeQuestion(nextQuestion) : null
  }

  //GET /api/question/:id
  public async show({ params }: HttpContext) {
    const { id } = params
    const question = await Question.findOrFail(id)
    return this.sanitizeQuestion(question)
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
