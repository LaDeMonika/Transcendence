import router from '@adonisjs/core/services/router'
import ChatController from '#controllers/api/chat_controller'
import fs from 'node:fs'
import path from 'node:path'

//have yet to be made, but will be used for chat system
router.group(() => {
  router.get('/me', [ChatController, 'me'])

  router.get('/conversations', [ChatController, 'indexConversations'])
  router.post('/conversations', [ChatController, 'createOrGetConversation'])

  router.get('/conversations/:id/messages', [ChatController, 'listMessages'])
  router.post('/conversations/:id/messages', [ChatController, 'sendMessage'])

  router.post('/conversations/add-user', [ChatController, 'addUserToConversation'])
  router.delete('/conversations/remove-user', [ChatController, 'removeUserFromConversation'])

}).prefix('/api')

router.get('/chattest', async ({ response }) => {
  const filePath = path.join(process.cwd(), 'public', 'chat_test.html')
  const html = fs.readFileSync(filePath, 'utf8')

  response.header('Content-Type', 'text/html; charset=utf-8')
  return html
})