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

router.group(() => {
    router.get('/', [TestusersController, 'index'])
    router.post('/register', [TestusersController, 'store'])
    router.get('/:id', [TestusersController, 'show'])
    router.delete('/:id', [TestusersController, 'destroy'])
  })
