<template>
  <div class="container d-flex flex-column" style="min-height: 100%">
    <div class="row border">
      <div class="col-sm d-flex justify-content-center">
        <h1>Lobby</h1>
      </div>
    </div>

    <div class="row border py-3">
      <div class="col-sm d-flex justify-content-center">
        <p class="mb-0 fs-5">
          Session ID:
          <strong>{{ sessionId }}</strong>
        </p>
      </div>
    </div>

    <div class="row flex-grow-1 align-items-start justify-content-center border py-4">
      <div class="col-sm-6">
        <h5 class="text-center mb-3">Players ({{ players.length }})</h5>
        <ul class="list-group">
          <li
            v-for="player in players"
            :key="player.userId"
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            {{ player.username }}
            <span v-if="player.userId === hostId" class="badge bg-primary">Host</span>
          </li>
        </ul>
        <p v-if="players.length === 0" class="text-center text-muted mt-3">
          <span class="spinner-border spinner-border-sm me-2" role="status"></span>
          Waiting for players to join...
        </p>
      </div>
      <div class="col-sm-6 mt-4 mt-sm-0">
        <h5 class="text-center mb-3">Spectators ({{ spectators.length }})</h5>
        <ul class="list-group">
          <li
            v-for="spectator in spectators"
            :key="spectator.userId"
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            {{ spectator.username }}
            <span class="badge bg-secondary">Watching</span>
          </li>
        </ul>
        <p v-if="spectators.length === 0" class="text-center text-muted mt-3">
          No spectators connected yet.
        </p>
      </div>
    </div>

    <div class="row justify-content-center border py-4 mb-5">
      <div class="d-flex justify-content-center">
        <button
          v-if="isHost && joinRole === 'player'"
          class="btn btn-success btn-lg px-5 shadow"
          @click="startGame"
          :disabled="isStarting || !hasJoinedSession"
        >
          {{ isStarting ? 'Starting...' : 'Start Game' }}
        </button>
        <p v-else-if="joinRole === 'spectator'" class="text-muted fs-5 mb-0">Spectator mode is active. Waiting for the host to start the game...</p>
        <p v-else class="text-muted fs-5 mb-0">Waiting for the host to start the game...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { connect, disconnect, onWs } from '@/services/wsConnection.js'
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

const setupWsListeners = () => {
  cleanupWsListeners()

  wsUnsubscribers.push(onWs('ws:connected', () => {
    hasJoinedSession.value = false
    if (joinRole.value === 'spectator') {
      spectateQuizSession(sessionId)
      return
    }
    joinQuizSession(sessionId)
    loadSession()
  }))

  wsUnsubscribers.push(onWs('quiz:join:ok', (data) => {
    if (Number(data.sessionId) !== sessionId) return
    hasJoinedSession.value = true
    loadSession()

    if (joinRole.value === 'player' && isSingleMode && isHost && !isStarting.value) {
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

<style scoped></style>
