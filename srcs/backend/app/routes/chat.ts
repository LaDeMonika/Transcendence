import router from '@adonisjs/core/services/router'
import ChatController from '#controllers/api/chat_controller'

//have yet to be made, but will be used for chat system
router.group(() => {
  router.get('/me', [ChatController, 'me'])

  router.get('/conversations', [ChatController, 'indexConversations'])
  router.post('/conversations', [ChatController, 'createOrGetConversation'])

  router.get('/conversations/:id/messages', [ChatController, 'listMessages'])
  router.post('/conversations/:id/messages', [ChatController, 'sendMessage'])
}).prefix('/api')
