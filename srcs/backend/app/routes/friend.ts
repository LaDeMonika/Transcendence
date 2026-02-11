import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const FriendsController = () => import('#controllers/api/friends_controller')

router
  .group(() => {
    router.get('/', [FriendsController, 'index'])
    router.get('/pivot', [FriendsController, 'indexPivot'])
    router.get('/accept/:friendId', [FriendsController, 'acceptFriend'])
    router.get('/add/:friendId', [FriendsController, 'addFriend'])
    // router.get('/block/:friendId', [FriendsController, 'blockFriend'])
    router.delete('/:friendId', [FriendsController, 'removeFriend'])
  })
  .prefix('/api/friends')
  .use(middleware.auth())
