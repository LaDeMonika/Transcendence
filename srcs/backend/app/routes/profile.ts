import { middleware } from '#start/kernel'
const ProfilesController = () => import('#controllers/api/profiles_controller')
import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.post('/uploadAvatar', [ProfilesController, 'uploadAvatar'])
    router.delete('/deleteAvatar', [ProfilesController, 'deleteAvatar'])
    router.get('/', [ProfilesController, 'privateProfile'])
    // router.put('/', [ProfilesController, 'update'])
    router.get('/myQuizs', [ProfilesController, 'myQuizzes'])
    router.get('/othersQuizs/:userid', [ProfilesController, 'othersQuizzes'])
    router.get('/:userId', [ProfilesController, 'publicProfile'])
  })
  .prefix('/api/profile')
  .use(middleware.auth())

router.get('/getAvatar/:userid', [ProfilesController, 'getAvatar'])
  .prefix('/api/profile')
