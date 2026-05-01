<template>
  <div class="leaderboard-page">
    <div class="leaderboard-card">
      <div class="card-glow"></div>

      <div class="hero-header">
        <div class="hero-badge">🏆 STANDINGS</div>
        <h1 class="hero-title">{{ isFinal ? 'Match Finished' : 'Current Progress' }}</h1>
        <p class="hero-subtitle">{{ isFinal ? 'Behold the winners!' : 'Keep it up, you are doing great!' }}</p>
      </div>

      <div class="panel-body">
        <div v-if="isLoading" class="loader-view">
          <div class="spinner-game"></div>
          <h3>Loading standings...</h3>
        </div>

        <template v-else>
          <div v-if="sortedPlayers.length === 0" class="empty-standings">
            No standings available.
          </div>
          <div v-else class="leaderboard-list">
            <LeaderboardRow
              v-for="(player, index) in sortedPlayers"
              :key="player.id"
              :player="player"
              :rank="index + 1"
            />
          </div>
        </template>
      </div>

      <div class="footer-actions">
        <div v-if="!isFinal" class="timer-next" :class="{ 'timer-next--urgent': timeLeft <= 1 }">
          <span class="timer-label">Next Question in</span>
          <span class="timer-value">{{ timeLeft }}s...</span>
        </div>
        <button v-else class="btn-game btn-game--start" @click="goToHome">Back to Home</button>
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
    showError('Failed to load standings')
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
/* ─── Page Shell ─────────────────────────────────────────── */
.leaderboard-page {
  flex: 1;
  width: 100%;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #24243e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ─── Leaderboard Card ─────────────────────────────────────── */
.leaderboard-card {
  position: relative;
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.2), transparent 70%);
  pointer-events: none;
}

/* ─── Header ──────────────────────────────────────────────── */
.hero-header {
  text-align: center;
  margin-bottom: 2rem;
}

.hero-badge {
  display: inline-block;
  background: linear-gradient(90deg, #f7971e, #ffd200);
  color: #1a1a2e;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 0.35rem 1.1rem;
  border-radius: 100px;
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.4);
  margin-bottom: 1rem;
}

.hero-title {
  font-size: 2.2rem;
  font-weight: 900;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.hero-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0.5rem 0 0;
}

/* ─── List Body ───────────────────────────────────────────── */
.panel-body {
  flex: 1;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 2rem;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
}

.loader-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.5);
}

.spinner-game {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #fbbf24;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-standings {
  padding: 3rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}

/* ─── Footer ──────────────────────────────────────────────── */
.footer-actions {
  display: flex;
  justify-content: center;
  align-items: center;
}

.timer-next {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: #fff;
}

.timer-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
}

.timer-value {
  font-size: 1.5rem;
  font-weight: 900;
  color: #818cf8;
}

.timer-next--urgent .timer-value {
  color: #f43f5e;
  animation: pulse 0.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.btn-game {
  padding: 0.8rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: none;
  border-radius: 100px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
}

.btn-game:hover {
  transform: scale(1.07);
  filter: brightness(1.12);
}

.btn-game--start {
  background: linear-gradient(90deg, #22c55e, #10b981);
  color: #fff;
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.4);
}
</style>
