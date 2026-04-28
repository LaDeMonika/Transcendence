// app/services/quizroom.ts
import type { WebSocketContext } from 'adonisjs-websocket'

type WsConn = WebSocketContext['ws'] // websocket connection object, has .id and .send() method 
class QuizRooms {
  private rooms = new Map<string, Set<WsConn>>() // key: sessionId string

  join(sessionId: string, ws: WsConn) {
    const set = this.rooms.get(sessionId) ?? new Set<WsConn>()
    set.add(ws)
    this.rooms.set(sessionId, set)
  }

  leave(sessionId: string, ws: WsConn) {
    const set = this.rooms.get(sessionId)
    if (!set) return
    set.delete(ws)
    if (set.size === 0) this.rooms.delete(sessionId)
  }

  leaveAll(ws: WsConn) {
    for (const [sessionId, set] of this.rooms.entries()) {
      if (set.has(ws)) {
        set.delete(ws)
        if (set.size === 0) this.rooms.delete(sessionId)
      }
    }
  }

  isInSession(sessionId: string, ws: WsConn) {
    return this.rooms.get(sessionId)?.has(ws) ?? false
  }

  broadcastToSession(sessionId: string, payload: any) {
    const set = this.rooms.get(sessionId)
    if (!set) return
    const msg = JSON.stringify(payload)
    for (const sock of set) {
      try {
        sock.send(msg)
      } catch {
        set.delete(sock)
      }
    }

    if (set.size === 0) {
      this.rooms.delete(sessionId)
    }
  }
}

export const quizRooms = new QuizRooms()
