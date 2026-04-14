import type { HttpContext } from '@adonisjs/core/http'
import { parse } from 'csv-parse/sync'
import fs from 'node:fs'
import Database from '@adonisjs/lucid/services/db'
import Question from '#models/Question'
import Quiz from '#models/Quiz'

type QuizImportRow = {
  question: string
  answerA: string
  answerB: string
  answerC: string
  answerD: string
  correctAnswer: string
}

type QuizImportPayload = {
  title: string
  questions: QuizImportRow[]
}

type QuizExportPayload = {
  title?: string
  questions?: Array<{
    question?: string
    correctAnswer?: string
    answers?: {
      A?: string
      B?: string
      C?: string
      D?: string
    }
  }>
}

export default class CsvQuizController {
  private isQuizExportPayload(payload: unknown): payload is QuizExportPayload {
    if (!payload || typeof payload !== 'object' || !Array.isArray((payload as QuizExportPayload).questions)) {
      return false
    }

    return (payload as QuizExportPayload).questions!.every(
      (question) => question && typeof question === 'object' && 'answers' in question
    )
  }

  private normalizeQuestions(rows: QuizImportRow[]) {
    if (!rows.length) {
      throw new Error('Quiz must include at least one question row')
    }

    return rows.map((row, index) => {
      const rowNum = index + 1
      const correctAnswer = String(row.correctAnswer ?? '')
        .toUpperCase()
        .trim() as 'A' | 'B' | 'C' | 'D'

      if (!row.question?.trim()) {
        throw new Error(`Missing question text at row ${rowNum}`)
      }

      if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
        throw new Error(`Invalid correctAnswer value at row ${rowNum}: ${correctAnswer}`)
      }

      return {
        quizId: 0,
        question: row.question.trim(),
        answerA: row.answerA?.trim() || '',
        answerB: row.answerB?.trim() || '',
        answerC: row.answerC?.trim() || '',
        answerD: row.answerD?.trim() || '',
        correctAnswer,
      }
    })
  }

  private parseCsvQuiz(csvText: string): QuizImportPayload {
    const rawRows = parse(csvText, {
      skip_empty_lines: true,
      trim: true,
      delimiter: ';',
      to_line: 1,
    }) as string[][]

    if (rawRows.length < 1) {
      throw new Error('CSV must include a title row and at least the header row')
    }

    const [titleKey, titleValue] = rawRows[0] ?? []
    const title = String(titleValue ?? '').trim()

    if (String(titleKey).toLowerCase() !== 'title' || !title) {
      throw new Error('First CSV row must be "title;Your Quiz Title"')
    }

    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: ';',
      from_line: 2,
      relax_quotes: true,
    }) as QuizImportRow[]

    return {
      title,
      questions: records.map((row) => ({
        question: row.question?.trim() || '',
        answerA: row.answerA?.trim() || '',
        answerB: row.answerB?.trim() || '',
        answerC: row.answerC?.trim() || '',
        answerD: row.answerD?.trim() || '',
        correctAnswer: row.correctAnswer?.trim() || '',
      })),
    }
  }

  private parseJsonQuiz(jsonText: string): QuizImportPayload {
    const payload = JSON.parse(jsonText) as QuizImportPayload | QuizExportPayload

    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid JSON format')
    }

    if (this.isQuizExportPayload(payload)) {
      const exportQuestions = payload.questions ?? []

      return {
        title: String(payload.title ?? '').trim(),
        questions: exportQuestions.map((question) => ({
          question: String(question.question ?? '').trim(),
          answerA: String(question.answers?.A ?? '').trim(),
          answerB: String(question.answers?.B ?? '').trim(),
          answerC: String(question.answers?.C ?? '').trim(),
          answerD: String(question.answers?.D ?? '').trim(),
          correctAnswer: String(question.correctAnswer ?? '').trim(),
        })),
      }
    }

    return {
      title: String(payload.title ?? '').trim(),
      questions: Array.isArray((payload as QuizImportPayload).questions)
        ? (payload as QuizImportPayload).questions
        : [],
    }
  }

  private async createQuizFromPayload(payload: QuizImportPayload) {
    const title = String(payload.title ?? '').trim()

    if (!title) {
      throw new Error('Quiz title is required')
    }

    const questions = this.normalizeQuestions(payload.questions)
    const trx = await Database.transaction()

    try {
      const quiz = await Quiz.create({ title }, { client: trx })

      questions.forEach((question) => {
        question.quizId = quiz.id
      })

      await Question.createMany(questions, { client: trx })
      await trx.commit()

      return { title, importedCount: questions.length }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  public async importCsv({ request, response }: HttpContext) {
    const file = request.file('csv', {
      extnames: ['csv'],
      size: '5mb',
    })

    if (!file) {
      return response.badRequest({ error: 'No file uploaded' })
    }

    if (!file.isValid) {
      return response.badRequest({ message: file.errors })
    }

    try {
      const csvText = fs.readFileSync(file.tmpPath!, 'utf-8')
      const payload = this.parseCsvQuiz(csvText)
      const result = await this.createQuizFromPayload(payload)

      return response.ok({ message: 'CSV imported successfully', ...result })
    } catch (error) {
      return response.badRequest({ error: (error as Error).message || 'Invalid CSV format' })
    }
  }

  public async importJson({ request, response }: HttpContext) {
    const file = request.file('json', {
      extnames: ['json'],
      size: '5mb',
    })

    if (!file) {
      return response.badRequest({ error: 'No file uploaded' })
    }

    if (!file.isValid) {
      return response.badRequest({ message: file.errors })
    }

    try {
      const jsonText = fs.readFileSync(file.tmpPath!, 'utf-8')
      const payload = this.parseJsonQuiz(jsonText)
      const result = await this.createQuizFromPayload(payload)

      return response.ok({ message: 'JSON imported successfully', ...result })
    } catch (error) {
      return response.badRequest({ error: (error as Error).message || 'Invalid JSON format' })
    }
  }
}
