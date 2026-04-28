// app/services/ChatRooms.ts
import type { WebSocketContext } from 'adonisjs-websocket'

type ConversationId = number
type WsConn = WebSocketContext['ws'] // websocket connection object, has .id and .send() method 

export class ChatRooms {
  
  // conversation ID -> set of participant socket IDs
  private rooms = new Map<ConversationId, Set<WsConn>>()

  // every socket ID -> set of conversation IDs
  private memberships = new Map<WsConn, Set<ConversationId>>()

  join(conversationId: number, ws: WsConn) {
    if (!this.rooms.has(conversationId)) this.rooms.set(conversationId, new Set())
    this.rooms.get(conversationId)!.add(ws)

    if (!this.memberships.has(ws)) this.memberships.set(ws, new Set())
    this.memberships.get(ws)!.add(conversationId)
  }

  leave(conversationId: number, ws: WsConn) {
    this.rooms.get(conversationId)?.delete(ws)
    if (this.rooms.get(conversationId)?.size === 0) this.rooms.delete(conversationId)

    this.memberships.get(ws)?.delete(conversationId)
  }

  leaveAll(ws: WsConn) {
    const convs = this.memberships.get(ws)
    if (!convs) return

    for (const conversationId of convs) {
      this.rooms.get(conversationId)?.delete(ws)
      if (this.rooms.get(conversationId)?.size === 0) this.rooms.delete(conversationId)
    }

    this.memberships.delete(ws)
  }

  broadcastToConversation(conversationId: number, payload: unknown) {
    const room = this.rooms.get(conversationId)
    if (!room) return

    const data = JSON.stringify(payload)

    for (const ws of room) {
      try {
        ws.send(data)
      } catch {
        room.delete(ws)
      }
    }
  }

  isInConversation(conversationId: number, ws: WsConn) {
    if (this.rooms.get(conversationId)?.has(ws))
      return true
    return false
  }
}

export const chatRooms = new ChatRooms()