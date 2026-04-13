import Quiz from '#models/Quiz'
import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'

export default class QuizzesController {
  // Escapes a value so it can be safely written into a CSV cell.
  private buildCsvValue(value: string | number) {
    const stringValue = String(value ?? '')
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  // Builds the full quiz export payload with per-question answer statistics.
  private async buildQuizExport(quizId: number) {
    const quiz = await Quiz.query()
      .where('id', quizId)
      .preload('questions')
      .firstOrFail()

    type QuestionAnswerStatsRow = {
      question_id: number | string
      totalAnswers: number | string
      correctAnswers: number | string
    }

    type QuestionAnswerStats = {
      totalAnswers: number
      correctAnswers: number
    }

    const answerStats = (await db
      .from('quiz_answers')
      .join('questions', 'questions.id', 'quiz_answers.question_id')
      .where('questions.quiz_id', quizId)
      .groupBy('quiz_answers.question_id')
      .select(
        'quiz_answers.question_id',
        db.rawQuery('count(*) as "totalAnswers"'),
        db.rawQuery(
          'sum(case when quiz_answers.is_correct then 1 else 0 end) as "correctAnswers"'
        )
      )) as QuestionAnswerStatsRow[]

    const statsByQuestionId = new Map<number, QuestionAnswerStats>(
      answerStats.map((row) => [
        Number(row.question_id),
        {
          totalAnswers: Number(row.totalAnswers ?? 0),
          correctAnswers: Number(row.correctAnswers ?? 0),
        },
      ])
    )

    const questions = quiz.questions
      .sort((a, b) => a.id - b.id)
      .map((question) => {
        const stats = statsByQuestionId.get(question.id) ?? { totalAnswers: 0, correctAnswers: 0 }
        const incorrectAnswers = stats.totalAnswers - stats.correctAnswers

        return {
          id: question.id,
          question: question.question,
          answers: {
            A: question.answerA,
            B: question.answerB,
            C: question.answerC,
            D: question.answerD,
          },
          correctAnswer: question.correctAnswer,
          stats: {
            totalAnswers: stats.totalAnswers,
            correctAnswers: stats.correctAnswers,
            incorrectAnswers,
            correctRate: stats.totalAnswers > 0 ? stats.correctAnswers / stats.totalAnswers : 0,
          },
        }
      })

    return {
      id: quiz.id,
      title: quiz.title,
      exportedAt: new Date().toISOString(),
      questionCount: questions.length,
      questions,
    }
  }

  // Converts a quiz export payload into CSV format for file download.
  private buildQuizExportCsv(quizExport: Awaited<ReturnType<QuizzesController['buildQuizExport']>>) {
    const header = [
      'quiz_id',
      'quiz_title',
      'question_id',
      'question',
      'answer_a',
      'answer_b',
      'answer_c',
      'answer_d',
      'correct_answer',
      'total_answers',
      'correct_answers',
      'incorrect_answers',
      'correct_rate',
    ]

    const rows = quizExport.questions.map((question) =>
      [
        quizExport.id,
        quizExport.title,
        question.id,
        question.question,
        question.answers.A,
        question.answers.B,
        question.answers.C,
        question.answers.D,
        question.correctAnswer,
        question.stats.totalAnswers,
        question.stats.correctAnswers,
        question.stats.incorrectAnswers,
        question.stats.correctRate.toFixed(4),
      ]
        .map((value) => this.buildCsvValue(value))
        .join(',')
    )

    return [header.map((value) => this.buildCsvValue(value)).join(','), ...rows].join('\n')
  }

  // GET /api/quiz/:id
  // does not show correct answers to prevent cheating, use /api/admin/quiz/:id for that
  // Returns a public quiz view with questions but without correct answers.
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
  // Returns the full quiz including correct answers for admin use.
  public async showAdmin({ params }: HttpContext) {
    const quiz = await Quiz.query()
      .where('id', params.id)
      .preload('questions')
      .firstOrFail()

    return quiz
  }

  // GET /api/quizzes
  // Lists available quizzes with the minimal data needed for selection.
  public async index() {
    const quizzes = await Quiz.query().select('id', 'title')
    return quizzes
  }

  // GET /api/admin/quiz/:id/export?format=json|csv
  // Exports quiz data including question stats in JSON or CSV format.
  // Sends the quiz export in the requested format or rejects unsupported formats.
  public async export({ params, request, response }: HttpContext) {
    // Normalize the requested export format and default to JSON.
    const format = String(request.input('format', 'json')).toLowerCase()

    // Build the export payload once so both JSON and CSV use the same source data.
    const quizExport = await this.buildQuizExport(Number(params.id))

    if (format === 'csv') {
      // Convert the export payload into CSV rows for download.
      const csv = this.buildQuizExportCsv(quizExport)

      // Sanitize the quiz title so it can be safely used in the filename.
      const safeTitle = quizExport.title.replace(/[^a-z0-9_-]+/gi, '_')

      // Mark the response as a UTF-8 CSV attachment.
      response.header('Content-Type', 'text/csv; charset=utf-8')
      response.header(
        'Content-Disposition',
        `attachment; filename="quiz_${quizExport.id}_${safeTitle}_export.csv"`
      )

      // Return the generated CSV file contents.
      return response.send(csv)
    }

    if (format !== 'json') {
      // Reject unknown formats to keep the API contract explicit.
      return response.badRequest({ error: 'Invalid format. Use json or csv.' })
    }

    // Return the structured export payload as JSON.
    return response.ok(quizExport)
  }
}
