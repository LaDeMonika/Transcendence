import router from '@adonisjs/core/services/router'
import ChatController from '#controllers/api/chat_controller'
import fs from 'node:fs'
import path from 'node:path'
import { middleware } from '#start/kernel'
import ConversationParticipant from '#models/chatsystem/ConversationParticipant'
import Message from '#models/chatsystem/Message'
import { chatRooms } from '#services/chatroom'
import User from '#models/user'

router.group(() => {
  router.get('/me', [ChatController, 'me'])

  router.get('/conversations', [ChatController, 'indexConversations'])
  router.post('/conversations', [ChatController, 'createOrGetConversation'])

  router.get('/conversations/:id/messages', [ChatController, 'listMessages'])
  router.post('/conversations/:id/messages', [ChatController, 'sendMessage'])

  router.post('/conversations/add-user', [ChatController, 'addUserToConversation'])
  router.delete('/conversations/remove-user', [ChatController, 'removeUserFromConversation'])

})

router.get('/chattest', async ({ response }) => {
  const filePath = path.join(process.cwd(), 'public', 'chat_test2.html')
  const html = fs.readFileSync(filePath, 'utf8')

  response.header('Content-Type', 'text/html; charset=utf-8')
  return html
})


// WebSocket route for real-time chat
/* we are expecting the following payloads from the client:
1. To join a conversation room (auto-joined on connect, but can be used to join others):
{ "type": "join", "conversationId": 123 }

2. To leave a conversation room:
{ "type": "leave", "conversationId": 123 }

3. To send a new message to a conversation:
{ "type": "message:new", "conversationId": 123, "body": "Hello everyone!" }

The server will respond with:
- Acknowledgments for joins/leaves
- Broadcast new messages to all participants in the conversation room
- Error messages for invalid actions
*/
router.ws(
  '/ws',
  async ({ ws, auth }) => {
  const user = await auth.use('web').authenticate() as User

  console.log('WS authed user', user.id)

  ws.send(JSON.stringify({ type: 'ws:connected', userId: user.id, socketId: ws.id }))
    // Auto-join all conversation rooms the user is part of:
    const convIds = await ConversationParticipant.query()
    .where('userId', user.id)
    .select('conversationId')
    for (const row of convIds) {
      chatRooms.join(row.conversationId, ws)
    }

    ws.on('message', async (raw) => {
      let payload: any
      try {
        payload = JSON.parse(raw.toString())
      } catch {
        return ws.send(JSON.stringify({ type: 'error', error: 'Invalid JSON' }))
      }

      // LEAVE a conversation room
      if (payload.type === 'leave') {
        const conversationId = Number(payload.conversationId)
        chatRooms.leave(conversationId, ws)
        return ws.send(JSON.stringify({ type: 'leave:ok', conversationId }))
      }

      //Join a conversation room (client can also auto-join on connect, but this allows joining others)
      if (payload.type === 'join') {
        const conversationId = Number(payload.conversationId)
        chatRooms.join(conversationId, ws)
        return ws.send(JSON.stringify({ type: 'join:ok', conversationId }))
      }

      // CREATE a new message (persist then broadcast)
      if (payload.type === 'message:new') {
        const conversationId = Number(payload.conversationId)
        const body = String(payload.body ?? '').trim()

        // Check basic validity
        if (!body) return ws.send(JSON.stringify({ type: 'error', error: 'Empty message' }))
        if (!chatRooms.isInConversation(conversationId, ws)) {
          return ws.send(JSON.stringify({ type: 'error', error: 'Not joined to conversation' }))
        }

        // Check with DB if user is part of the conversation
        const allowed = await ConversationParticipant.query()
          .where('conversationId', conversationId)
          .where('userId', user.id)
          .first()
        if (!allowed) {
          return ws.send(JSON.stringify({ type: 'error', error: 'Not a participant' }))
        }

        // Create the message in DB
        const msg = await Message.create({
          conversationId,
          senderId: user.id,
          text: body,
        })
        if (!msg) {
          return ws.send(JSON.stringify({ type: 'error', error: 'Failed to create message' }))
        }

        // Broadcast the new message to everyone in the conversation room
        chatRooms.broadcastToConversation(conversationId, {
          type: 'message:created',
          conversationId,
          message: msg,
        })

        // Acknowledge to sender with the new message ID
        return ws.send(
          JSON.stringify({
            type: 'message:ack',
            conversationId,
            messageId: msg.id,
          })
        )
      }

      // Unknown event
      return ws.send(JSON.stringify({ type: 'error', error: 'Unknown event type' }))
    })

    ws.on('close', () => {
      chatRooms.leaveAll(ws)
    })
  },
[
  () => import('#middleware/container_bindings_middleware'),
  () => import('@adonisjs/session/session_middleware'), 
  () => import('@adonisjs/auth/initialize_auth_middleware'),
  middleware.auth({ guards: ['web'] }),
]
)