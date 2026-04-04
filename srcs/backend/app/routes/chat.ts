import router from '@adonisjs/core/services/router'
import ChatController from '#controllers/api/chat_controller'
import fs from 'node:fs'
import path from 'node:path'
import ConversationParticipant from '#models/chatsystem/ConversationParticipant'
//import Message from '#models/chatsystem/Message'
import { chatRooms } from '#services/chatroom'
import { quizRooms } from '#services/quizroom'
import { handleWsChatMessage } from '#controllers/ws/ws_chat_handler'
import { handleWsQuizMessage } from '#controllers/ws/ws_quiz_handler'
import User from '#models/user'
import { Secret } from '@poppinss/utils'

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

router.get('/wschattest', async ({ response }) => {
  const filePath = path.join(process.cwd(), 'public', 'ws_chat_test.html')
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
  async ({ ws, request }) => {
  
  // Authenticate the user based on the access token provided in the query string or Authorization header
  const authorizationHeader = request.header('authorization')
  const bearerToken = authorizationHeader?.startsWith('Bearer ')
    ? authorizationHeader.slice(7).trim()
    : null
  const queryToken = request.qs().token
  // We prioritize the Bearer token from the Authorization header, but also allow a 
  // token in the query string for flexibility (e.g., WebSocket clients that can't set headers easily)
  const rawToken = bearerToken || queryToken

  if (!rawToken || typeof rawToken !== 'string') {
    ws.send(JSON.stringify({ type: 'error', error: 'Missing access token' }))
    ws.close()
    return
  }

  const accessToken = await User.accessTokens.verify(new Secret(rawToken))
  if (!accessToken) {
    ws.send(JSON.stringify({ type: 'error', error: 'Invalid access token' }))
    ws.close()
    return
  }

  const user = await User.find(accessToken.tokenableId)
  if (!user) {
    ws.send(JSON.stringify({ type: 'error', error: 'User not found for token' }))
    ws.close()
    return
  }

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

      if (!payload.type) {
        return ws.send(JSON.stringify({ type: 'error', error: 'Missing event type' }))
      }
      try {
        const handled = (await handleWsQuizMessage(ws, user, payload)) || (await handleWsChatMessage(ws, user, payload))
        if (!handled) {
          return ws.send(JSON.stringify({ type: 'error', error: 'Unknown event type' }))
        }
      } catch {
        return ws.send(JSON.stringify({ type: 'error', error: 'Internal server error' }))
      }
    })

    ws.on('close', () => {
      chatRooms.leaveAll(ws)
      quizRooms.leaveAll(ws)
    })
  },
[
  () => import('#middleware/container_bindings_middleware'),
  () => import('@adonisjs/auth/initialize_auth_middleware'),
]
)
