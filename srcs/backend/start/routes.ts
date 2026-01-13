/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const TestusersController = () => import('#controllers/testusers_controller')
import router from '@adonisjs/core/services/router'

// router.get('/', async () => {
//   return {
//     hello: 'world',
//   }
// })

router
  .group(() => {
    router.get('/', [TestusersController, 'index'])
    router.post('/register', [TestusersController, 'store'])
    router.get('/:id', [TestusersController, 'show'])
    router.delete('/:id', [TestusersController, 'destroy'])
  })
  .prefix('/auth')

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
