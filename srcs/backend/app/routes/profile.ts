import { middleware } from '#start/kernel'
const ProfilesController = () => import('#controllers/api/profiles_controller')
import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.get('/getAvatar', [ProfilesController, 'getAvatar'])
    router.post('/uploadAvatar', [ProfilesController, 'uploadAvatar'])
    router.delete('/deleteAvatar', [ProfilesController, 'deleteAvatar'])
    router.get('/', [ProfilesController, 'privateProfile'])
    // router.put('/', [ProfilesController, 'update'])
    router.get('/:userId', [ProfilesController, 'publicProfile'])
  })
  .prefix('/api/profile')
  .use(middleware.auth())
