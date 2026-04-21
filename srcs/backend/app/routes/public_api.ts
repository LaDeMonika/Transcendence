import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const PublicApiController = () => import('#controllers/api/public_api_controller')

/**
 * @tagDescription public-api - Public API endpoints available under 
 * /api/public. Authenticate every request with the configured public API key 
 * and respect the public API rate limit middleware applied to this route group.
 * Available endpoints:
 * - GET /api/public/quizzes: list quizzes with public metadata.
 * - GET /api/public/quiz/:id: fetch one quiz and its questions without correct answers.
 * - GET /api/public/users/:id: fetch a public user profile.
 * - POST /api/public/quiz-sessions: create a quiz session with {"quizId": number, "hostId": number, "conversationId"?: number | null}.
 * - PUT /api/public/users/:id: update a user's name with {"userName": string}.
 * - DELETE /api/public/quiz-sessions/:id: delete an existing quiz session.
 */
router
  .group(() => {
    router.get('/quizzes', [PublicApiController, 'listQuizzes'])
    router.get('/quiz/:id', [PublicApiController, 'showQuiz'])
    router.get('/users/:id', [PublicApiController, 'showUser'])
    router.post('/quiz-sessions', [PublicApiController, 'createQuizSession'])
    router.put('/users/:id', [PublicApiController, 'updateUser'])
    router.delete('/quiz-sessions/:id', [PublicApiController, 'deleteQuizSession'])
  })
  .prefix('/api/public')
  .use([middleware.publicApiKey(), middleware.publicApiRateLimit()])
