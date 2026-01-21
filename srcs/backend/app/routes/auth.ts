import router from '@adonisjs/core/services/router'

const AuthController = () => import('#controllers/auth_controller')

router.group(() => {
  router.post('/register', [AuthController, 'register'])
  router.post('/login', [AuthController, 'login'])
  router.get('/index', [AuthController, 'index'])
})
