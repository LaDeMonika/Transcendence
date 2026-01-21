import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const TestusersController = () => import('#controllers/testusers_controller')

router
  .group(() => {
    router.get('/', [TestusersController, 'index'])
    router.post('/', [TestusersController, 'store'])
    router.put('/', [TestusersController, 'update'])
    router.get('/:id', [TestusersController, 'show'])
    router.delete('/:id', [TestusersController, 'destroy'])
  })
  .prefix('/testuser')
  .use(middleware.auth())
