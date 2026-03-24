let wsUrl = import.meta.env.VITE_BACKEND_URL

if (wsUrl.startsWith('https://')) {
  wsUrl = 'wss://' + wsUrl.slice('https://'.length)
} else if (wsUrl.startsWith('http://')) {
  wsUrl = 'ws://' + wsUrl.slice('http://'.length)
}

if (wsUrl.endsWith('/')) {
  wsUrl = wsUrl.slice(0, -1)
}

wsUrl += '/ws'

let socket = null
let intentionalClose = false
const listeners = {}

function dispatch(payload) {
  for (const key of [payload.type, '*']) {
    listeners[key]?.forEach((fn) => fn(payload))
  }
}

export function connectSocket() {
  if (socket && socket.readyState <= WebSocket.OPEN) return
  intentionalClose = false
  socket = new WebSocket(wsUrl)

  socket.addEventListener('message', (e) => {
    let payload
    try { payload = JSON.parse(e.data) } catch { return }
    dispatch(payload)
  })

  socket.addEventListener('close', () => {
    if (!intentionalClose) setTimeout(connectSocket, 3000)
  })
}

export function disconnectSocket() {
  intentionalClose = true
  socket?.close()
  socket = null
}

export function sendWs(payload) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload))
    return true
  }
  return false
}

export function onWs(type, handler) {
  if (!listeners[type]) listeners[type] = new Set()
  listeners[type].add(handler)
}

export function offWs(type, handler) {
  listeners[type]?.delete(handler)
}
