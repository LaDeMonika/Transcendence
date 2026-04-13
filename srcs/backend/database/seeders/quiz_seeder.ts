import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { parse } from 'csv-parse/sync'
import fs from 'node:fs'
import path from 'node:path'
import db from '@adonisjs/lucid/services/db'
import Quiz from '#models/Quiz'
import Question from '#models/Question'

type CsvRow = {
  question: string
  answerA: string
  answerB: string
  answerC: string
  answerD: string
  correctAnswer: string
}

type SeedQuestion = {
  question: string
  answerA: string
  answerB: string
  answerC: string
  answerD: string
  correctAnswer: 'A' | 'B' | 'C' | 'D'
}

export default class extends BaseSeeder {
  private quizCsvFiles = ['quiz.csv', 'quiz2.csv', 'quiz3.csv']

  private loadQuizFromCsv(fileName: string) {
    const filePath = path.join(process.cwd(), 'public', fileName)
    const csvText = fs.readFileSync(filePath, 'utf-8')

    const titleRow = parse(csvText, {
      skip_empty_lines: true,
      trim: true,
      delimiter: ';',
      to_line: 1,
    }) as string[][]

    const [titleKey, titleValue] = titleRow[0] ?? []
    const title = String(titleValue ?? '').trim()

    if (String(titleKey).toLowerCase() !== 'title' || !title) {
      throw new Error(`Invalid title row in ${fileName}`)
    }

    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: ';',
      from_line: 2,
      relax_quotes: true,
    }) as CsvRow[]

    const questions = records.map((row, index) => {
      const rowNum = index + 3
      const correctAnswer = String(row.correctAnswer ?? '')
        .toUpperCase()
        .trim() as SeedQuestion['correctAnswer']

      if (!row.question?.trim()) {
        throw new Error(`Missing question text in ${fileName} at row ${rowNum}`)
      }

      if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
        throw new Error(`Invalid correctAnswer in ${fileName} at row ${rowNum}`)
      }

      return {
        question: row.question.trim(),
        answerA: row.answerA?.trim() ?? '',
        answerB: row.answerB?.trim() ?? '',
        answerC: row.answerC?.trim() ?? '',
        answerD: row.answerD?.trim() ?? '',
        correctAnswer,
      }
    })

    if (!questions.length) {
      throw new Error(`No questions found in ${fileName}`)
    }

    return { title, questions }
  }

  async run() {
    for (const fileName of this.quizCsvFiles) {
      const { title, questions } = this.loadQuizFromCsv(fileName)
      const trx = await db.transaction()

      try {
        let quiz = await Quiz.query({ client: trx }).where('title', title).first()

        if (!quiz) {
          quiz = await Quiz.create({ title }, { client: trx })
        }

        await Question.query({ client: trx }).where('quiz_id', quiz.id).delete()
        await Question.createMany(
          questions.map((question) => ({
            quizId: quiz.id,
            ...question,
          })),
          { client: trx }
        )

        await trx.commit()
      } catch (error) {
        await trx.rollback()
        throw error
      }
    }
  }
}
