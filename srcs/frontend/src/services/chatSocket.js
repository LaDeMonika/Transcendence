import { connect as wsConnect, disconnect as wsDisconnect, sendWs, onWs, offWs } from './wsConnection.js'

// Export the unified connection functions
export function connect() {
  return wsConnect()
}

export function disconnect() {
  return wsDisconnect()
}

// Legacy names for backward compatibility
export function connectSocket() {
  return connect()
}

export function disconnectSocket() {
  return disconnect()
}

export function sendMessage(conversationId, message) {
  sendWs({ type: 'message:new', conversationId, body: message })
}

export function joinConversation(conversationId) {
  sendWs({ type: 'conversation:join', conversationId })
}

export function leaveConversation(conversationId) {
  sendWs({ type: 'conversation:leave', conversationId })
}

export { sendWs, onWs, offWs }
