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
import QuestionsController from '#controllers/api/questions_controller'
import QuizzesController from '#controllers/api/quizzes_controller'
import CsvQuizController from '#controllers/csv_quiz_controller'
import WsChatController from '#controllers/ws/chat_controller'
import fs from 'node:fs'
import path from 'node:path'

router.get('/', async () => {
  return 'Welcome to ft_trancenders secret vault :D'
})

/**************************************************/
// CSV Import routes
/**************************************************/

router.post('/api/quizzes/import-csv', [CsvQuizController, 'importCsv'])
router.get('/uploadcsv', async ({ response }) => {
  const filePath = path.join(process.cwd(), 'public', 'uploadcsv.html')
  const html = fs.readFileSync(filePath, 'utf8')

  response.header('Content-Type', 'text/html; charset=utf-8')
  return html
})

/**************************************************/
// WebSocket routes and Chat routes
/**************************************************/

// npx wscat -c "ws://localhost:3333/ws" to test connection via terminal
router.ws('/ws', ({ ws }) => {
  ws.on('message', (message) => {
    ws.send('Received: ' + message.toString())
  })

  ws.on('close', () => {
    console.log('Connection closed')
  })

  ws.send('Hello! Your id is ' + ws.id)
})

router.ws('/chat/:roomId', [WsChatController, 'handle'])
router.get('/chat/:roomId', async ({ response }) => {
  const filePath = path.join(process.cwd(), 'public', 'chat.html')
  const html = fs.readFileSync(filePath, 'utf8')

  response.header('Content-Type', 'text/html; charset=utf-8')
  return html
})

/**************************************************/
// Question and Quiz routes
/**************************************************/

router.group(() => {
  // get random question from any quiz
  router.get('/random-question', [QuestionsController, 'random']) 

  // get next question in the same quiz, or null if no more questions
  router.get('/:quizId/:questionId/next-question', [QuestionsController, 'next'])

  // submit an answer and get correctness result
  router.post('/submit-answer', [QuestionsController, 'submit'])

  // get a quiz by id
  router.get('/quiz/:id', [QuizzesController, 'show'])
  
}).prefix('/api')