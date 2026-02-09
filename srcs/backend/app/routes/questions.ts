/**************************************************/
// Question and Quiz routes
/**************************************************/

import QuestionsController from '#controllers/api/questions_controller'
import QuizzesController from '#controllers/api/quizzes_controller'
import router from '@adonisjs/core/services/router'

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