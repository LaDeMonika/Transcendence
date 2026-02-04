import type { HttpContext } from '@adonisjs/core/http'
import { parse } from 'csv-parse/sync'
import fs from 'node:fs'
import Database from '@adonisjs/lucid/services/db'
import Question from '#models/Question'
import Quiz from '#models/Quiz'

type CsvRow = {
    question: string
    answerA: string
    answerB: string
    answerC: string
    answerD: string
    correctAnswer: 'A' | 'B' | 'C' | 'D'
}


export default class CsvQuizController {
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

        const csvText = fs.readFileSync(file.tmpPath!, 'utf-8')

        let records:CsvRow[]
        try {
            records = parse(csvText, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                delimiter: ';',
            }) as CsvRow[]
        } catch (error) {
            return response.badRequest({ error: 'Invalid CSV format' })
        }

        const questions = records.map((row, index) => {
            const rowNum = index + 2 // considering header is row 1 (for error messages)
            const correct = String(row.correctAnswer).toUpperCase()

            // Validate correctAnswer
            if (!['A', 'B', 'C', 'D'].includes(correct)) {
                throw new Error(`Invalid correctAnswer value at row ${rowNum}`)
            }
            // Validate question text
            if (!row.question) {
                throw new Error(`Missing question text at row ${rowNum}`)
            }

            return {
                quizId: 0, // placeholder, will be set after quiz creation
                question: row.question,
                answerA: row.answerA,
                answerB: row.answerB,
                answerC: row.answerC,
                answerD: row.answerD,
                correctAnswer: correct,
            }
        })

        const trx = await Database.transaction()
        try {
            const quiz = await Quiz.create(
                { title: `Imported Quiz ${new Date().toISOString()}` },
                { client: trx }
            )
            // Set the quizId for each question
            questions.forEach((q) => {
                q.quizId = quiz.id
            })
        } catch (error) {
            await trx.rollback()
            return response.badRequest({ message: 'Failed to create quiz' })
        }

        try {
            await Question.createMany(questions, { client: trx })
            await trx.commit()

            return response.ok({ message: 'CSV imported successfully', importedCount: questions.length })
        } catch (error) {
            await trx.rollback()
            return response.badRequest({ message: (error as Error).message })
        }
    }
}