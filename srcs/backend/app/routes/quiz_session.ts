import router from '@adonisjs/core/services/router'
import QuizSessionController from '#controllers/api/quiz_session_controller'


// This file defines API routes for managing quiz sessions. It includes endpoints for:

// - Creating a new quiz session (POST /api/quiz-sessions)
// - Retrieving quiz session details (GET /api/quiz-sessions/:id)
// - Joining a quiz session as a player (POST /api/quiz-sessions/:id/players)
// - Joining a quiz session as a spectator (POST /api/quiz-sessions/:id/spectate)
// - Starting the quiz session (POST /api/quiz-sessions/:id/start)
// - Getting current standings (GET /api/quiz-sessions/:id/standings)

router.group(() => {
    router.post('/quiz-sessions', [QuizSessionController, 'create'])
    router.get('/quiz-sessions/:id', [QuizSessionController, 'show'])
    router.post('/quiz-sessions/:id/join', [QuizSessionController, 'join'])
    router.post('/quiz-sessions/:id/spectate', [QuizSessionController, 'spectate'])
    router.post('/quiz-sessions/:id/start', [QuizSessionController, 'start'])
    router.get('/quiz-sessions/:id/state', [QuizSessionController, 'state'])
    router.get('/quiz-sessions/:id/standings', [QuizSessionController, 'standings'])
}).prefix('/api')
