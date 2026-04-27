import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const AuthController = () => import('#controllers/auth_controller')

router
  .group(() => {
    router.post('/register', [AuthController, 'register'])
    router.post('/login', [AuthController, 'login'])
    router.get('/index', [AuthController, 'index'])
    router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
    router.post('/changePassword', [AuthController, 'changePassword']).use(middleware.auth())
  })
  .prefix('/api')
