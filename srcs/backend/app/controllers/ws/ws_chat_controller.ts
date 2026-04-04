import type { WebSocketContext } from 'adonisjs-websocket'

export default class WsChatController {
  public async handle({ ws, params }: WebSocketContext) {
    const roomId = params.roomId

    // Optional: tell the user they joined
    ws.send(JSON.stringify({ type: 'system', text: `Joined room ${roomId}`, at: Date.now() }))
    ws.send('Hello! Your id is ' + ws.id)

    ws.on('message', async (raw) => {
    let payload: any
    try {
      payload = JSON.parse(raw.toString())
    } catch {
      // Ignore invalid JSON
      return
    }

    // Expect: { name: string, text: string }
    const name = String(payload.name || 'Anon').slice(0, 30)
    const text = String(payload.text || '').trim().slice(0, 500)
    if (!text) return

    const msg = {
      type: 'chat',
      roomId,
      name,
      text,
      at: Date.now(),
    }

    // Send to everyone connected to the SAME room url path
    // Everyone connected to /chat/123 gets it; /chat/999 does not.
    await ws.broadcast(JSON.stringify(msg))
    })

    ws.on('close', () => {
    console.log(`WS disconnected from room ${roomId}`)
    })
  }
}
