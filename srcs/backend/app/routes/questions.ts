import QuestionsController from '#controllers/api/questions_controller'
import QuizzesController from '#controllers/api/quizzes_controller'
import router from '@adonisjs/core/services/router'

/**
 * API routes for handling questions and quizzes.
 * 
 * Routes:
 * - GET /api/random-question: Retrieves a random question from any quiz.
 * - GET /api/:quizId/:questionId/next-question: Retrieves the next question in the same quiz, or null if no more questions exist.
 * - POST /api/submit-answer: Submits an answer and returns the correctness result.
 * - GET /api/quiz/:id: Retrieves a quiz by its ID.
 * - GET /api/admin/quiz/:id: Retrieves a quiz by its ID for admin purposes.
 * - GET /api/quizzes: Retrieves a list of all quizzes.
 */

router.group(() => {
  // Question-related routes
  router.get('/random-question', [QuestionsController, 'random']) 
  router.get('/:quizId/:questionId/next-question', [QuestionsController, 'next'])
  router.post('/submit-answer', [QuestionsController, 'submit'])
  router.get('/question/:id', [QuestionsController, 'show'])

  // Quiz-related routes
  router.get('/quiz/:id', [QuizzesController, 'show'])
  router.get('/admin/quiz/:id', [QuizzesController, 'showAdmin'])
  router.get('/quizzes', [QuizzesController, 'index'])
  
}).prefix('/api')
