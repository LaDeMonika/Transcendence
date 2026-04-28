/**************************************************/
// CSV Import routes
/**************************************************/

import router from '@adonisjs/core/services/router'
import CsvQuizController from '#controllers/csv_quiz_controller'
import fs from 'node:fs'
import path from 'node:path'
import app from '@adonisjs/core/services/app'
import { readFile } from 'node:fs/promises'

router.post('/api/quizzes/import-csv', [CsvQuizController, 'importCsv'])
router.post('/api/quizzes/import-json', [CsvQuizController, 'importJson'])
router.get('/uploadcsv', async ({ response }) => {
  const filePath = path.join(process.cwd(), 'public', 'uploadcsv.html')
  const html = fs.readFileSync(filePath, 'utf8')

  response.header('Content-Type', 'text/html; charset=utf-8')
  return html
})

// EXPORT
router.get('/quiz-export', async ({ response }) => {
  const html = await readFile(app.makePath('public', 'quiz_export.html'), 'utf-8')
  response.type('html')
  return response.send(html)
})
