<template>
  <div class="container mt-5 w-100">
    <div class="card shadow-sm mx-auto" style="max-width: 600px;">
      <div class="card-header bg-dark text-white text-center py-3">
        <h3 class="mb-0">Match Leaderboard</h3>
        <small class="text-light">Current Progress</small>
      </div>
      
      <div class="card-body p-0">
        <!-- Uses the reusable LeaderboardRow we created -->
        <LeaderboardRow 
          v-for="(player, index) in sortedPlayers" 
          :key="player.id" 
          :player="player" 
          :rank="index + 1" 
        />
        
        <div v-if="players.length === 0" class="p-4 text-center text-muted">
          Waiting for players to join...
        </div>
      </div>
      
      <div class="card-footer bg-light text-center py-3">
        <div v-if="!isFinal" class="fs-5 fw-bold" :class="timeLeft <= 1 ? 'text-danger' : 'text-primary'">
          Next Question in {{ timeLeft }}s...
        </div>
        <button v-else class="btn btn-success px-4" @click="goToLobby">Back to Lobby</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LeaderboardRow from '@/components/LeaderboardRow.vue'

const router = useRouter()
const route = useRoute()

const isFinal = computed(() => route.query.isFinal === 'true')
const nextIndex = computed(() => route.query.nextIndex || 0)

const timeLeft = ref(3)
let timerInterval = null

// Trash/mock data based on requirement
const mockPlayers = [
  { id: 1, name: 'Alice Smith', avatar: 'https://i.pravatar.cc/150?img=1', score: 450 },
  { id: 2, name: 'Bob Jones', avatar: 'https://i.pravatar.cc/150?img=53', score: 320 },
  { id: 3, name: 'Charlie Brown', avatar: 'https://i.pravatar.cc/150?img=33', score: 500 },
  { id: 4, name: 'Diana Prince', avatar: 'https://i.pravatar.cc/150?img=4', score: 150 },
  { id: 5, name: 'Evan Wright', avatar: 'https://i.pravatar.cc/150?img=11', score: 280 }
]

const players = ref(mockPlayers)

// We dynamically sort the state so the rank is accurate 
const sortedPlayers = computed(() => {
  return [...players.value].sort((a, b) => b.score - a.score)
})

const nextQuestion = () => {
  router.push({ path: '/game', query: { index: nextIndex.value } })
}

const goToLobby = () => {
  router.push('/lobby')
}

onMounted(() => {
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
/* Optional specific styling */
</style>
