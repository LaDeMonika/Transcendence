
function buildWebSocketUrl() {
  let wsUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3333'

  wsUrl = wsUrl.replace('/api', '')

  if (wsUrl.startsWith('https://')) {
    wsUrl = 'wss://' + wsUrl.slice('https://'.length)
  } else if (wsUrl.startsWith('http://')) {
    wsUrl = 'ws://' + wsUrl.slice('http://'.length)
  }

  if (wsUrl.endsWith('/')) {
    wsUrl = wsUrl.slice(0, -1)
  }

  wsUrl += '/ws'

  const token = localStorage.getItem('token')
  if (token) {
    wsUrl += '?token=' + encodeURIComponent(token)
  }

  return wsUrl
}

let ws = null
let intentionalClose = false
let isConnected = false
const listeners = {}

function dispatch(payload) {
  listeners[payload.type]?.forEach((fn) => {
    try {
      fn(payload)
    } catch (error) {
      console.error('Error in WebSocket event handler:', error, payload)
    }
  })
}

function openSocket() {
  intentionalClose = false

  const wsUrl = buildWebSocketUrl()
  console.log(`WebSocket connecting`)

  ws = new WebSocket(wsUrl)

  ws.addEventListener('open', () => {
    console.log('WebSocket connected')
    isConnected = true
    dispatch({ type: 'ws:connected' })
  })

  ws.addEventListener('message', (e) => {
    let payload
    try {
      payload = JSON.parse(e.data)
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error, e.data)
      return
    }
    dispatch(payload)
  })

  ws.addEventListener('close', () => {
    console.log('WebSocket closed')
    isConnected = false
    if (!intentionalClose) {
      setTimeout(openSocket, 3000)
    }
  })

  ws.addEventListener('error', (error) => {
    console.error('WebSocket error:', error)
    dispatch({ type: 'ws:error', error })
  })
}

export function connect() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log('WebSocket already connected')
    return
  }

  if (ws && ws.readyState === WebSocket.CONNECTING) {
    console.log('WebSocket connecting')
    return
  }

  openSocket()
}

export function disconnect() {
  console.log('WebSocket disconnect request')

  intentionalClose = true
  ws?.close()
  ws = null
  isConnected = false
}

export function sendWs(payload) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload))
    return true
  }
  console.warn('WebSocket not connected, message not sent:', payload)
  return false
}

export function onWs(type, handler) {
  if (!listeners[type]) {
    listeners[type] = new Set()
  }
  listeners[type].add(handler)

  // Return unsubscribe function
  return () => offWs(type, handler)
}

export function offWs(type, handler) {
  listeners[type]?.delete(handler)
}

export function getIsConnected() {
  return isConnected
}
