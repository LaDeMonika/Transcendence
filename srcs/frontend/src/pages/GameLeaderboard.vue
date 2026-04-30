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
        <button class="btn btn-success px-4" @click="goToHome">Back to Home</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LeaderboardRow from '@/components/LeaderboardRow.vue'
import { getQuizSessionStandings } from '@/services/quizSessionService.js'
import { showError } from '@/services/notifications.js'

const router = useRouter()
const route = useRoute()

const isFinal = computed(() => route.query.isFinal === 'true')
const sessionId = route.query.sessionId

const isLoading = ref(true)

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
    showError('Failed to load standings.')
  } finally {
    isLoading.value = false
  }
}

const goToHome = () => {
  router.push('/home')
}

onMounted(async () => {
  await loadStandings()
})
</script>

<style scoped>
</style>
