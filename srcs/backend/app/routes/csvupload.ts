/**************************************************/
// CSV Import routes
/**************************************************/

import router from '@adonisjs/core/services/router'
import CsvQuizController from '#controllers/csv_quiz_controller'
import fs from 'node:fs'
import path from 'node:path'

router.post('/api/quizzes/import-csv', [CsvQuizController, 'importCsv'])
router.get('/uploadcsv', async ({ response }) => {
  const filePath = path.join(process.cwd(), 'public', 'uploadcsv.html')
  const html = fs.readFileSync(filePath, 'utf8')

  response.header('Content-Type', 'text/html; charset=utf-8')
  return html
})
