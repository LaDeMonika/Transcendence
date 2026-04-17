<template>
  <div class="container d-flex flex-column" style="min-height: 100%">
    <div class="row border">
      <div class="col-sm d-flex justify-content-center">
        <h1>Lobby</h1>
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
    </div>

    <div class="row justify-content-center border py-4 mb-5">
      <div class="d-flex justify-content-center">
        <button
          v-if="isHost"
          class="btn btn-success btn-lg px-5 shadow"
          @click="startGame"
          :disabled="isStarting"
        >
          {{ isStarting ? 'Starting...' : 'Start Game' }}
        </button>
        <p v-else class="text-muted fs-5 mb-0">Waiting for the host to start the game...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { connect, disconnect, onWs } from '@/services/wsConnection.js'
import { joinQuizSession, leaveQuizSession, startQuiz } from '@/services/quizSocket.js'
import { getQuizSession, getQuizSessionStandings } from '@/services/quizSessionService.js'

const router = useRouter()
const route = useRoute()

const sessionId = Number(route.params.sessionId)
const isHost = route.query.isHost === 'true'
const isSingleMode = route.query.mode === 'single'

const players = ref([])
const hostId = ref(null)
const isStarting = ref(false)
let wsUnsubscribers = []

const fetchPlayers = async () => {
  try {
    const data = await getQuizSessionStandings(sessionId)
    players.value = data.standings
  } catch (err) {
    console.error('Failed to fetch players:', err)
  }
}

const startGame = () => {
  isStarting.value = true
  startQuiz(sessionId)
}

const setupWsListeners = () => {
  wsUnsubscribers.push(onWs('quiz:player:joined', (data) => {
    if (data.sessionId !== sessionId) return
    const exists = players.value.some((p) => p.userId === data.userId)
    if (!exists) {
      players.value.push({ userId: data.userId, username: data.username, score: 0 })
    }
  }))

  wsUnsubscribers.push(onWs('quiz:started', (data) => {
    if (data.sessionId !== sessionId) return
    router.push({ name: 'Game', params: { sessionId } })
  }))

  wsUnsubscribers.push(onWs('error', (data) => {
    console.error('WS error in lobby:', data.error)
    isStarting.value = false
  }))
}

const cleanupWsListeners = () => {
  wsUnsubscribers.forEach((unsub) => unsub())
  wsUnsubscribers = []
}

onMounted(async () => {
  if (!sessionId) {
    router.push('/choose-quiz')
    return
  }

  try {
    const session = await getQuizSession(sessionId)
    if (session.state !== 'lobby') {
      router.push({ name: 'Game', params: { sessionId } })
      return
    }
    hostId.value = session.hostId
  } catch (err) {
    console.error('Failed to load session:', err)
  }

  await fetchPlayers()

  connect()
  setupWsListeners()
  joinQuizSession(sessionId)

  if (isSingleMode) {
    startGame()
  }
})

onBeforeUnmount(() => {
  cleanupWsListeners()
  leaveQuizSession(sessionId)
  disconnect()
})
</script>

<style scoped></style>
