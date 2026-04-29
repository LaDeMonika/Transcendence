<template>
  <div class="container mt-5 w-100">
    <div class="card shadow-sm mx-auto" style="max-width: 600px;">
      <div class="card-header bg-dark text-white text-center py-3">
        <h3 class="mb-0">Match Leaderboard</h3>
        <small class="text-light">Current Progress</small>
      </div>

      <div class="card-body p-0">
        <div v-if="isLoading" class="p-4 text-center text-muted">
          <div class="spinner-border spinner-border-sm me-2" role="status"></div>
          Loading standings...
        </div>

        <template v-else>
          <LeaderboardRow
            v-for="(player, index) in sortedPlayers"
            :key="player.id"
            :player="player"
            :rank="index + 1"
          />

          <div v-if="sortedPlayers.length === 0" class="p-4 text-center text-muted">
            No standings available.
          </div>
        </template>
      </div>

      <div class="card-footer bg-light text-center py-3">
        <div v-if="!isFinal" class="fs-5 fw-bold" :class="timeLeft <= 1 ? 'text-danger' : 'text-primary'">
          Next Question in {{ timeLeft }}s...
        </div>
        <button v-else class="btn btn-success px-4" @click="goToHome">Back to Home</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LeaderboardRow from '@/components/LeaderboardRow.vue'
import { getQuizSessionStandings } from '@/services/quizSessionService.js'

const router = useRouter()
const route = useRoute()

const isFinal = computed(() => route.query.isFinal === 'true')
const nextIndex = computed(() => route.query.nextIndex || 0)
const sessionId = route.query.sessionId

const timeLeft = ref(3)
const isLoading = ref(true)
let timerInterval = null

const players = ref([])

const sortedPlayers = computed(() => {
  return [...players.value].sort((a, b) => b.score - a.score)
})

const loadStandings = async () => {
  if (!sessionId) return
  try {
    const data = await getQuizSessionStandings(sessionId)
    players.value = data.standings.map((entry) => ({
      id: entry.userId,
      name: entry.username,
      score: entry.score,
    }))
  } catch (err) {
    console.error('Failed to load standings:', err)
  } finally {
    isLoading.value = false
  }
}

const nextQuestion = () => {
  if (!sessionId) return
  router.push({ name: 'Game', params: { sessionId } })
}

const goToHome = () => {
  router.push('/home')
}

onMounted(async () => {
  await loadStandings()

  // If not final leaderboard, wait with a live countdown
  if (!isFinal.value) {
    timerInterval = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
      } else {
        clearInterval(timerInterval)
        nextQuestion()
      }
    }, 1000)
  }
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
</style>
