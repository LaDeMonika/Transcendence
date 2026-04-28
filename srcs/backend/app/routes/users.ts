import UserController from '#controllers/api/user_controller'
import router from '@adonisjs/core/services/router'

router.get('/api/users', [UserController, 'index'])
router.get('/api/user/:id', [UserController, 'show'])
router.get('/api/search-users', [UserController, 'search'])
router.post('/api/update-username', [UserController, 'updateUsername'])
router.delete('/api/user', [UserController, 'destroy'])
router.get('/api/user/:id/stats', [UserController, 'stats'])