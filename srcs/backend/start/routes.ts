/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const TestusersController = () => import('#controllers/testusers_controller')
const AuthController = () => import('#controllers/auth_controller')
import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return 'Welcome to ft_trancenders secret vault :D'
})

router.group(() => {
  router.post('/register', [AuthController, 'register'])
  router.post('/login', [AuthController, 'login'])
  router.get('/list', [AuthController, 'index'])
})

router
  .group(() => {
    router.get('/', [TestusersController, 'index'])
    router.post('/', [TestusersController, 'store'])
    router.put('/', [TestusersController, 'update'])
    router.get('/:id', [TestusersController, 'show'])
    router.delete('/:id', [TestusersController, 'destroy'])
  })
  .prefix('/testuser')

// SWAGGER CONFIGURATION
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'
// returns swagger in YAML
router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

// Renders Swagger-UI and passes YAML-output of /swagger
router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
  // return AutoSwagger.default.scalar('/swagger') //; to use Scalar instead. If you want, you can pass proxy url as second argument here.
  // return AutoSwagger.default.rapidoc('/swagger', 'view') //; to use RapiDoc instead (pass "view" default, or "read" to change the render-style)
})
