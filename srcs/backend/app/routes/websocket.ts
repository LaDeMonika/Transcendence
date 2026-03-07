/**************************************************/
// WebSocket routes and Chat routes
/**************************************************/

import router from '@adonisjs/core/services/router'
import WsChatController from '#controllers/ws/ws_chat_controller'
import fs from 'node:fs'
import path from 'node:path'

// npx wscat -c "ws://localhost:3333/ws" to test connection via terminal
router.ws('/ws', ({ ws }) => {
  ws.on('message', (message) => {
    ws.send('Received: ' + message.toString())
  })

  ws.on('close', () => {
    console.log('Connection closed')
  })

  ws.send('Hello! Your id is ' + ws.id)
})

router.ws('/chat/:roomId', [WsChatController, 'handle'])
router.get('/chat/:roomId', async ({ response }) => {
  const filePath = path.join(process.cwd(), 'public', 'chat.html')
  const html = fs.readFileSync(filePath, 'utf8')

  response.header('Content-Type', 'text/html; charset=utf-8')
  return html
})

