import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const FriendsController = () => import('#controllers/api/friends_controller')

router
  .group(() => {
    router.get('/', [FriendsController, 'index'])
    // router.get('/:id', [FriendsController, 'addUser'])
    router.post('/', [FriendsController, 'addFriend'])
    router.delete('/:friendId', [FriendsController, 'removeFriend'])
    // router.post('/', [TestusersController, 'store'])
    // router.put('/', [TestusersController, 'update'])
    // router.get('/:id', [TestusersController, 'show'])
    // router.delete('/:id', [TestusersController, 'destroy'])
  })
  .prefix('/api/friends')
  .use(middleware.auth())
