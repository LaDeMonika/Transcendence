/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import '../app/routes/swagger.js'
import '../app/routes/auth.js'
import '../app/routes/testuser.js'
import CsvQuizController from '#controllers/csv_quiz_controller'
import fs from 'node:fs'
import path from 'node:path'

router.get('/', async () => {
  return 'Welcome to ft_trancenders secret vault :D'
})

router.post('/api/quizzes/import-csv', [CsvQuizController, 'importCsv'])
// router.get('/api/quizzes/import-csv', async () => {
//   return { message: 'Use POST with multipart/form-data field "csv"' }
// })
router.get('/uploadcsv', async ({ response }) => {
  const filePath = path.join(process.cwd(), 'public', 'uploadcsv.html')
  const html = fs.readFileSync(filePath, 'utf8')

  response.header('Content-Type', 'text/html; charset=utf-8')
  return html
})