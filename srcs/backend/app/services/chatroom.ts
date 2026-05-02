// app/services/ChatRooms.ts
import type { WebSocketContext } from 'adonisjs-websocket'

type ConversationId = number
type UserId = number
type WsConn = WebSocketContext['ws'] // websocket connection object, has .id and .send() method 

export class ChatRooms {
  
  // conversation ID -> set of participant socket IDs
  private rooms = new Map<ConversationId, Set<WsConn>>()

  // every socket ID -> set of conversation IDs
  private memberships = new Map<WsConn, Set<ConversationId>>()

  // user ID -> set of sockets
  private userSockets = new Map<UserId, Set<WsConn>>()

  addUser(userId: UserId, ws: WsConn) {
    if (!this.userSockets.has(userId)) this.userSockets.set(userId, new Set())
    this.userSockets.get(userId)!.add(ws)
  }

  removeUser(ws: WsConn) {
    for (const [userId, sockets] of this.userSockets) {
      sockets.delete(ws)
      if (sockets.size === 0) this.userSockets.delete(userId)
    }
  }

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
    this.removeUser(ws)
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

  broadcastToUser(userId: UserId, payload: unknown) {
    const sockets = this.userSockets.get(userId)
    if (!sockets) return

    const data = JSON.stringify(payload)

    for (const ws of sockets) {
      try {
        ws.send(data)
      } catch {
        sockets.delete(ws)
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