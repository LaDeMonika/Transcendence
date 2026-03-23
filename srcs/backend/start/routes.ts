/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import '../app/routes/swagger.js'
import '../app/routes/auth.js'
import '../app/routes/testuser.js'
import '../app/routes/csvupload.js'
import '../app/routes/questions.js'
import '../app/routes/websocket.test.js'
import '../app/routes/chat.js'
import '../app/routes/quiz_session.js'

router.get('/', async () => {
  return 'Welcome to ft_trancenders secret vault :D'
})
