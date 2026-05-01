<template>
  <div class="lobby-page">

    <!-- Hero Header -->
    <div class="hero-header">
      <div class="hero-badge">🎮 LOBBY</div>
      <h1 class="hero-title">Waiting Room</h1>
      <div class="session-id-pill">
        <span class="session-label">Session ID</span>
        <strong class="session-value">{{ sessionId }}</strong>
      </div>
    </div>

    <!-- Players & Spectators -->
    <div class="lobby-panels">

      <!-- Players Panel -->
      <div class="lobby-panel lobby-panel--players">
        <div class="panel-glow"></div>
        <h2 class="panel-title">
          <span class="panel-icon">🧑‍🤝‍🧑</span> Players
          <span class="panel-count">{{ players.length }}</span>
        </h2>
        <ul class="player-list">
          <li
            v-for="player in players"
            :key="player.userId"
            class="player-item"
          >
            <span class="player-avatar">{{ player.username[0]?.toUpperCase() }}</span>
            <span class="player-name">{{ player.username }}</span>
            <span v-if="player.userId === hostId" class="player-badge player-badge--host">👑 Host</span>
          </li>
        </ul>
        <p v-if="players.length === 0" class="empty-state">
          <span class="spinner-border spinner-border-sm me-2" role="status"></span>
          Waiting for players to join...
        </p>
      </div>

      <!-- Spectators Panel -->
      <div class="lobby-panel lobby-panel--spectators">
        <div class="panel-glow"></div>
        <h2 class="panel-title">
          <span class="panel-icon">👁️</span> Spectators
          <span class="panel-count">{{ spectators.length }}</span>
        </h2>
        <ul class="player-list">
          <li
            v-for="spectator in spectators"
            :key="spectator.userId"
            class="player-item"
          >
            <span class="player-avatar player-avatar--spectator">{{ spectator.username[0]?.toUpperCase() }}</span>
            <span class="player-name">{{ spectator.username }}</span>
            <span class="player-badge player-badge--spectator">Watching</span>
          </li>
        </ul>
        <p v-if="spectators.length === 0" class="empty-state">
          No spectators connected yet.
        </p>
      </div>

    </div>

    <!-- Action Row -->
    <div class="lobby-action">
      <button
        v-if="isHost && joinRole === 'player'"
        class="btn-game btn-game--start"
        @click="startGame"
        :disabled="isStarting || !hasJoinedSession"
      >
        {{ isStarting ? '⏳ Starting...' : '🚀 Start Game' }}
      </button>
      <p v-else-if="joinRole === 'spectator'" class="waiting-text">
        👁️ Spectator mode active — waiting for the host to start...
      </p>
      <p v-else class="waiting-text">
        ⏳ Waiting for the host to start the game...
      </p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { connect, disconnect, getIsConnected, onWs } from '@/services/wsConnection.js'
import { joinQuizSession, spectateQuizSession, leaveQuizSession, startQuiz } from '@/services/quizSocket.js'
import { getQuizSession, getCurrentUser } from '@/services/quizSessionService.js'
import { showError } from '@/services/notifications.js'

const router = useRouter()
const route = useRoute()

const sessionId = Number(route.params.sessionId)
const isHost = ref(false)
const isSingleMode = route.query.mode === 'single'
const requestedRole = route.query.role === 'spectator' ? 'spectator' : 'player'
const joinRole = ref(requestedRole)

const session = ref(null)
const currentUser = ref(null)
const hostId = computed(() => session.value?.hostId)
const players = computed(() => (session.value?.players ?? []).map((player) => ({
  userId: player.userId,
  username: player.user?.userName ?? `User ${player.userId}`,
  score: player.score ?? 0,
})))
const spectators = computed(() => (session.value?.spectators ?? []).map((spectator) => ({
  userId: spectator.userId,
  username: spectator.user?.userName ?? `User ${spectator.userId}`,
})))
const isStarting = ref(false)
const hasJoinedSession = ref(false)
let wsUnsubscribers = []

const startGame = () => {
  if (isStarting.value || !hasJoinedSession.value) return
  isStarting.value = true
  startQuiz(sessionId)
}

const joinCurrentSession = () => {
  hasJoinedSession.value = false
  if (joinRole.value === 'spectator') {
    spectateQuizSession(sessionId)
    return
  }
  joinQuizSession(sessionId)
  loadSession()
}

const setupWsListeners = () => {
  cleanupWsListeners()

  wsUnsubscribers.push(onWs('ws:connected', () => {
    joinCurrentSession()
  }))

  wsUnsubscribers.push(onWs('quiz:join:ok', (data) => {
    if (Number(data.sessionId) !== sessionId) return
    hasJoinedSession.value = true
    loadSession()

    if (joinRole.value === 'player' && isSingleMode && isHost.value && !isStarting.value) {
      startGame()
    }
  }))

  wsUnsubscribers.push(onWs('quiz:spectate:ok', (data) => {
    if (Number(data.sessionId) !== sessionId) return
    hasJoinedSession.value = true
    loadSession()
  }))

  wsUnsubscribers.push(onWs('quiz:player:joined', (data) => {
    if (Number(data.sessionId) !== sessionId) return
    loadSession()
  }))

  wsUnsubscribers.push(onWs('quiz:spectator:joined', (data) => {
    if (Number(data.sessionId) !== sessionId) return
    loadSession()
  }))

  wsUnsubscribers.push(onWs('quiz:state', (data) => {
    if (Number(data.sessionId) !== sessionId) return
    if (typeof data.playerCount === 'number' && players.value.length !== data.playerCount) {
      loadSession()
    }
    if (typeof data.spectatorCount === 'number' && spectators.value.length !== data.spectatorCount) {
      loadSession()
    }
  }))

  wsUnsubscribers.push(onWs('quiz:started', (data) => {
    if (Number(data.sessionId) !== sessionId) return
    router.push({ name: 'Game', params: { sessionId }, query: { role: joinRole.value } })
  }))

  wsUnsubscribers.push(onWs('error', (data) => {
    showError('WebSocket error in lobby.')
    isStarting.value = false
  }))
}

const cleanupWsListeners = () => {
  wsUnsubscribers.forEach((unsub) => unsub())
  wsUnsubscribers = []
}

const loadSession = async () => {
  const fetchedSession = await getQuizSession(sessionId)
  session.value = fetchedSession

  // Determine if current user is host and their role
  if (currentUser.value) {
    isHost.value = session.value.hostId === currentUser.value.id

    // If the user is already a spectator, preserve that state.
    const isSpectator = session.value.spectators?.some(spectator => spectator.userId === currentUser.value.id)
    if (isSpectator) {
      joinRole.value = 'spectator'
    } else if (requestedRole === 'spectator') {
      // Honor the initial spectator intent when first opening the lobby.
      joinRole.value = 'spectator'
    } else {
      joinRole.value = 'player'
    }
  } else {
    // Not authenticated, default to player
    isHost.value = false
    joinRole.value = 'player'
  }

  return fetchedSession
}

onMounted(async () => {
  if (!sessionId) {
    router.push('/choose-quiz')
    return
  }

  try {
    currentUser.value = await getCurrentUser()
  } catch (err) {
    currentUser.value = null
  }

  try {
    const session = await loadSession()
    if (session.state !== 'lobby') {
      router.push({ name: 'Game', params: { sessionId }, query: { role: joinRole.value } })
      return
    }
  } catch (err) {
    showError('Failed to load session.')
  }

  setupWsListeners()
  if (getIsConnected()) {
    joinCurrentSession()
  }
  connect()
})

onBeforeUnmount(() => {
  cleanupWsListeners()
  if (hasJoinedSession.value) {
    leaveQuizSession(sessionId)
  }
  disconnect()
})
</script>

<style scoped>
/* ─── Page Shell ─────────────────────────────────────────── */
.lobby-page {
  flex: 1;
  width: 100%;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #24243e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.75rem;
  padding: 1.5rem;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ─── Hero Header ─────────────────────────────────────────── */
.hero-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.hero-badge {
  display: inline-block;
  background: linear-gradient(90deg, #ff6fd8, #3813c2);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 0.35rem 1.1rem;
  border-radius: 100px;
  box-shadow: 0 0 18px rgba(255, 111, 216, 0.5);
}

.hero-title {
  font-size: clamp(1.8rem, 5vw, 3rem);
  font-weight: 900;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
}

.session-id-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 100px;
  padding: 0.4rem 1.1rem;
}

.session-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.session-value {
  font-size: 1rem;
  color: #fbbf24;
  letter-spacing: 0.05em;
}

/* ─── Panels Row ──────────────────────────────────────────── */
.lobby-panels {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  width: 100%;
  max-width: 860px;
}

/* ─── Panel Base ──────────────────────────────────────────── */
.lobby-panel {
  position: relative;
  flex: 1 1 320px;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.04);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem;
  overflow: hidden;
}

.panel-glow {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  pointer-events: none;
}

.lobby-panel--players .panel-glow {
  background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.3), transparent 65%);
}

.lobby-panel--spectators .panel-glow {
  background: radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.25), transparent 65%);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin: 0 0 1rem;
  position: relative;
}

.panel-icon {
  font-size: 1.2rem;
}

.panel-count {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 100px;
  padding: 0.1rem 0.65rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

/* ─── Player List ─────────────────────────────────────────── */
.player-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.player-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 0.6rem 0.9rem;
}

.player-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;
  color: #fff;
  flex-shrink: 0;
}

.player-avatar--spectator {
  background: linear-gradient(135deg, #06b6d4, #0284c7);
}

.player-name {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  flex: 1;
  font-size: 0.95rem;
}

.player-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.65rem;
  border-radius: 100px;
  letter-spacing: 0.05em;
}

.player-badge--host {
  background: linear-gradient(90deg, #f7971e, #ffd200);
  color: #1a1a2e;
}

.player-badge--spectator {
  background: rgba(6, 182, 212, 0.2);
  color: #06b6d4;
  border: 1px solid rgba(6, 182, 212, 0.3);
}

/* ─── Empty State ─────────────────────────────────────────── */
.empty-state {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.9rem;
  text-align: center;
  margin: 0.75rem 0 0;
  font-style: italic;
}

/* ─── Action Row ──────────────────────────────────────────── */
.lobby-action {
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-game {
  padding: 0.8rem 2.8rem;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: none;
  border-radius: 100px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease, opacity 0.15s ease;
}

.btn-game:hover:not(:disabled) {
  transform: scale(1.07);
  filter: brightness(1.12);
}

.btn-game:active:not(:disabled) {
  transform: scale(0.96);
}

.btn-game:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-game--start {
  background: linear-gradient(90deg, #f43f5e, #fb923c, #fbbf24);
  color: #fff;
  box-shadow: 0 4px 24px rgba(244, 63, 94, 0.55);
}

.waiting-text {
  color: rgba(255, 255, 255, 0.55);
  font-size: 1rem;
  margin: 0;
  font-style: italic;
}
</style>
