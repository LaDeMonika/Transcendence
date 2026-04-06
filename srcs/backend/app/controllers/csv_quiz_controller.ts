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
        // Validate and process the uploaded CSV file
        // Expecting a file input named 'csv'
        // the csv must start with a title row:
        // "title;My Quiz Title"
        // followed by the header row:
        // "question;answerA;answerB;answerC;answerD;correctAnswer"
        // where correctAnswer is one of A/B/C/D
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

        let title = ''
        let records: CsvRow[]

        try {
            const rawRows = parse(csvText, {
                skip_empty_lines: true,
                trim: true,
                delimiter: ';',
                to_line: 1,
            }) as string[][]

            if (rawRows.length < 1) {
                return response.badRequest({ error: 'CSV must include a title row and at least the header row' })
            }

            const [titleKey, titleValue] = rawRows[0] ?? []
            if (String(titleKey).toLowerCase() !== 'title' || !String(titleValue || '').trim()) {
                return response.badRequest({ error: 'First CSV row must be "title;Your Quiz Title"' })
            }

            title = String(titleValue).trim()

            records = parse(csvText, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                delimiter: ';',
                from_line: 2,
                relax_quotes: true,
            }) as CsvRow[]

            // Trim all column values
            records = records.map(row => ({
                question: row.question?.trim() || '',
                answerA: row.answerA?.trim() || '',
                answerB: row.answerB?.trim() || '',
                answerC: row.answerC?.trim() || '',
                answerD: row.answerD?.trim() || '',
                correctAnswer: row.correctAnswer?.trim() as any,
            }))
        } catch (error) {
            return response.badRequest({ error: 'Invalid CSV format' })
        }

        if (!records.length) {
            return response.badRequest({ error: 'CSV must include at least one question row' })
        }

        const questions = records.map((row, index) => {
            const rowNum = index + 3 // title row + header row
            const correct = String(row.correctAnswer).toUpperCase().trim() 

            // Validate correctAnswer
            if (!['A', 'B', 'C', 'D'].includes(correct)) {
                console.error(`\nInvalid correctAnswer value at row ${rowNum}: ${row.correctAnswer} (normalized to: ${correct})`)
                throw new Error(`Invalid correctAnswer value at row ${rowNum}: ${correct}`)
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
                { title },
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

            return response.ok({ message: 'CSV imported successfully', importedCount: questions.length, title })
        } catch (error) {
            await trx.rollback()
            return response.badRequest({ message: (error as Error).message })
        }
    }
}
