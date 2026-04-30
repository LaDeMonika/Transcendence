<template>
  <div class="profile-page">
    <div class="profile-container">
      
      <!-- Hero Header -->
      <div class="hero-header text-center mb-5">
        <div class="hero-badge">{{ isPrivate ? '👤 MY ACCOUNT' : '🌐 PUBLIC PROFILE' }}</div>
        <h1 class="hero-title">{{ isPrivate ? 'My Profile' : profile?.userName || 'User Profile' }}</h1>
        <p class="hero-subtitle text-muted">{{ isPrivate ? 'Manage your settings and track your progress.' : 'View player details and game history.' }}</p>
      </div>

      <!-- Quick Navigation -->
      <div class="profile-nav-wrapper mb-5">
        <div class="profile-nav">
          <a v-for="tab in tabs" :key="tab.id" :href="`#${tab.id}`" class="nav-pill">
            <span class="pill-icon">{{ tab.icon }}</span>
            <span class="pill-label">{{ tab.label }}</span>
          </a>
        </div>
      </div>

      <!-- Main Profile Card -->
      <div class="profile-card mb-5">
        <div class="card-glow"></div>
        <div class="profile-info">
          <div class="avatar-wrapper">
            <img v-if="profile" :src="avatarUrl" alt="Avatar" class="avatar-img" />
            <div v-else class="avatar-placeholder">?</div>
            <div class="avatar-glow"></div>
          </div>
          
          <div class="info-text">
            <h2 v-if="profile" class="profile-name">{{ profile.userName }}</h2>
            <p v-if="profile" class="profile-id">ID: {{ profile.id }}</p>
            
            <div v-if="!isPrivate && profile" class="social-actions mt-3">
              <button
                v-if="friendStatus === null"
                class="btn-game btn-game--start btn-sm"
                @click="handleAddFriend"
                :disabled="loadingFriendAction"
              >
                Add Friend
              </button>
              <div v-else-if="friendStatus === 'pending'" class="friend-options">
                <button
                  class="btn-game btn-game--success btn-sm"
                  @click="handleAcceptFriend"
                  :disabled="loadingFriendAction"
                >
                  Accept Request
                </button>
                <button
                  class="btn-game btn-game--danger btn-sm"
                  @click="handleRemoveFriend"
                  :disabled="loadingFriendAction"
                >
                  Decline
                </button>
              </div>
              <button
                v-else-if="friendStatus === 'requested'"
                class="btn-game btn-game--secondary btn-sm"
                @click="handleRemoveFriend"
                :disabled="loadingFriendAction"
              >
                Cancel Request
              </button>
              <button
                v-else-if="friendStatus === 'accepted'"
                class="btn-game btn-game--danger btn-sm"
                @click="handleRemoveFriend"
                :disabled="loadingFriendAction"
              >
                Remove Friend
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sections Grid -->
      <div class="sections-grid">
        
        <!-- Avatar Upload -->
        <section id="avatar" class="profile-section">
          <div class="section-card">
            <h4 class="section-title"><span class="icon">🖼️</span> Avatar Settings</h4>
            <p class="section-desc">Upload a new profile picture (PNG/JPG, max 5MB).</p>
            <BForm @submit.prevent="handleAvatarUpload" class="upload-form">
              <div class="upload-controls">
                <BFormFile
                  ref="avatarInput"
                  name="avatar"
                  accept="image/png, image/jpeg"
                  @change="onAvatarFileChange"
                  class="game-file-input"
                />
                <button type="submit" class="btn-game btn-game--start" :disabled="!selectedAvatarFile">Upload</button>
                <button v-if="isPrivate && profile?.avatarUrl" type="button" class="btn-game btn-game--danger" @click="handleDeleteAvatar">Delete</button>
              </div>
            </BForm>
            <BAlert v-if="errors.length" variant="danger" show class="mt-3 auth-alert">
              <div v-for="(error, index) in errors" :key="index">{{ error }}</div>
            </BAlert>
          </div>
        </section>

        <!-- Stats Section -->
        <section id="stats" class="profile-section">
          <div class="section-card">
            <h4 class="section-title"><span class="icon">📊</span> Game Statistics</h4>
            <div v-if="loadingStats" class="loader-view">
              <div class="spinner-game"></div>
              <p>Calculating stats...</p>
            </div>
            <div v-else-if="stats" class="stats-grid">
              <div class="stat-item">
                <span class="stat-val">{{ stats.playedSessions }}</span>
                <span class="stat-lab">Sessions</span>
              </div>
              <div class="stat-item">
                <span class="stat-val">{{ stats.totalQuestions }}</span>
                <span class="stat-lab">Questions</span>
              </div>
              <div class="stat-item">
                <span class="stat-val">{{ stats.totalAnswers }}</span>
                <span class="stat-lab">Answers</span>
              </div>
              <div class="stat-item">
                <span class="stat-val">{{ accuracy }}%</span>
                <span class="stat-lab">Accuracy</span>
              </div>
            </div>
            <div v-else class="empty-state">Statistics not available.</div>
          </div>
        </section>

        <!-- Password Section (Private Only) -->
        <section v-if="isPrivate" id="password" class="profile-section">
          <div class="section-card">
            <h4 class="section-title"><span class="icon">🔒</span> Security</h4>
            <BForm @submit.prevent="handlePasswordChange" class="auth-form">
              <div class="form-group mb-3">
                <label class="form-label">Current Password</label>
                <BFormInput type="password" required v-model="passwordForm.oldPassword" class="game-input" />
              </div>
              <div class="form-group mb-3">
                <label class="form-label">New Password</label>
                <BFormInput type="password" required v-model="passwordForm.newPassword" class="game-input" />
              </div>
              <button type="submit" class="btn-game btn-game--start w-100">Update Password</button>
            </BForm>
            <BAlert v-if="message" variant="success" show class="mt-3 auth-alert success">{{ message }}</BAlert>
            <BAlert v-if="errors.length" variant="danger" show class="mt-3 auth-alert">
              <div v-for="(error, index) in errors" :key="index">{{ error }}</div>
            </BAlert>
          </div>
        </section>

        <!-- Game History -->
        <section id="history" class="profile-section full-width">
          <div class="section-card">
            <h4 class="section-title"><span class="icon">🕘</span> {{ isPrivate ? 'Recent Matches' : 'Last Games' }}</h4>
            <div v-if="loadingGames" class="loader-view">
              <div class="spinner-game"></div>
              <p>Fetching history...</p>
            </div>
            <div v-else-if="games.length === 0" class="empty-state">No games found yet. Start playing!</div>
            <div v-else class="history-list">
              <div v-for="(game, index) in games" :key="index" class="history-item">
                <div class="history-main">
                  <span class="history-title">{{ game.title || 'Classic Quiz Match' }}</span>
                  <span class="history-score">Score: <strong>{{ game.score }}</strong></span>
                </div>
                <div class="history-meta">
                  <span>{{ game.questionCount ?? '-' }} Questions</span>
                  <span v-if="game.correctAnswerCount !== undefined">{{ game.correctAnswerCount }} Correct</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Leaderboard -->
        <section id="leaderboard" class="profile-section full-width">
          <div class="section-card">
            <h4 class="section-title"><span class="icon">🏆</span> Global Leaderboard</h4>
            <div v-if="loadingLeaderboard" class="loader-view">
              <div class="spinner-game"></div>
              <p>Loading legends...</p>
            </div>
            <BAlert v-else-if="leaderboardError" variant="danger" show class="mt-3 auth-alert">{{ leaderboardError }}</BAlert>
            <div v-else-if="leaderboard.length > 0" class="leaderboard-table-wrapper">
              <table class="game-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Total Score</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(player, index) in leaderboard" :key="player.id" 
                      :class="{ 'row-current': isPrivate && profile?.id === player.id }">
                    <td>
                      <span class="rank-badge" :class="`rank-${index + 1}`">#{{ index + 1 }}</span>
                    </td>
                    <td>
                      <span class="player-name-cell">{{ player.user_name }}</span>
                    </td>
                    <td>
                      <span class="score-cell">{{ player.total_score }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state">No leaderboard data available.</div>
          </div>
        </section>

        <!-- Danger Zone -->
        <section v-if="isPrivate" id="delete-account" class="profile-section full-width">
          <div class="section-card section-card--danger">
            <h4 class="section-title text-danger"><span class="icon">⚠️</span> Danger Zone</h4>
            <p class="section-desc">Permanently delete your account and all associated data. This action is irreversible.</p>
            <button class="btn-game btn-game--danger" @click="handleDeleteAccount">Delete My Account</button>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  fetchPrivateProfile,
  fetchPublicProfile,
  fetchMyQuizzes,
  fetchOthersQuizzes,
  fetchStats,
  fetchLeaderboard,
  uploadAvatar,
  deleteAvatar,
  changePassword,
  deleteAccount,
} from '@/services/profile.js'
import { setAuthToken } from '@/services/client.js'
import { getFriendsPivot, addFriend, acceptFriend, removeFriend } from '@/services/friends.js'

const route = useRoute()
const router = useRouter()
const profile = ref(null)
const games = ref([])
const stats = ref(null)
const leaderboard = ref([])
const loading = ref(false)
const loadingGames = ref(false)
const loadingStats = ref(false)
const loadingLeaderboard = ref(false)
const errors = ref([])
const leaderboardError = ref('')
const message = ref('')
const selectedAvatarFile = ref(null)
const passwordForm = ref({ oldPassword: '', newPassword: '' })
const friendStatus = ref(null) // null | 'pending' | 'requested' | 'accepted'
const loadingFriendAction = ref(false)

const tabs = [
  { id: 'avatar', icon: '👤', label: 'Avatar' },
  { id: 'password', icon: '🔒', label: 'Password' },
  { id: 'history', icon: '🕘', label: 'History' },
  { id: 'stats', icon: '📊', label: 'Stats' },
  { id: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
]

const userId = computed(() => {
  return route.params.userId ? Number(route.params.userId) : null
})

const isPrivate = computed(() => !route.params.userId)

if (isPrivate.value) {
  tabs.push({ id: 'delete-account', icon: '❌', label: 'Delete' })
}

const avatarUrl = computed(() => {
  if (!profile.value) return ''
  // return '../public/host.jpg'
  return `/api/profile/getAvatar/${profile.value.id}`
})

const accuracy = computed(() => {
  if (!stats.value || !stats.value.totalAnswers) return 0
  return Math.round((stats.value.totalCorrectAnswers / stats.value.totalAnswers) * 100)
})

const setError = (error) => {
  if (error?.response?.data?.errors) {
    errors.value = Array.isArray(error.response.data.errors) ? error.response.data.errors.map((e) => e.message || e) : [error.response.data.errors]
  } else if (error?.response?.data?.error) {
    const payload = error.response.data.error
    errors.value = Array.isArray(payload) ? payload.map((e) => e.message || e) : [payload]
  } else if (error?.message) {
    errors.value = [error.message]
  } else {
    errors.value = ['An unexpected error occurred.']
  }
}

const loadFriendStatus = async () => {
  if (isPrivate.value) return
  try {
    const pivot = await getFriendsPivot()
    const entry = pivot.find((f) => f.id === userId.value)
    friendStatus.value = entry?.status ?? null
  } catch {
    friendStatus.value = null
  }
}

const handleAddFriend = async () => {
  loadingFriendAction.value = true
  errors.value = []
  try {
    await addFriend(userId.value)
    friendStatus.value = 'requested'
  } catch (error) {
    setError(error)
  } finally {
    loadingFriendAction.value = false
  }
}

const handleAcceptFriend = async () => {
  loadingFriendAction.value = true
  errors.value = []
  try {
    await acceptFriend(userId.value)
    friendStatus.value = 'accepted'
  } catch (error) {
    setError(error)
  } finally {
    loadingFriendAction.value = false
  }
}

const handleRemoveFriend = async () => {
  loadingFriendAction.value = true
  errors.value = []
  try {
    await removeFriend(userId.value)
    friendStatus.value = null
  } catch (error) {
    setError(error)
  } finally {
    loadingFriendAction.value = false
  }
}

const loadProfile = async () => {
  loading.value = true
  errors.value = []
  message.value = ''
  try {
    if (isPrivate.value) {
      profile.value = await fetchPrivateProfile()
    } else {
      profile.value = await fetchPublicProfile(userId.value)
      await loadFriendStatus()
    }
    await Promise.all([loadGames(), loadStats(), loadLeaderboard()])
  } catch (error) {
    setError(error)
  } finally {
    loading.value = false
  }
}

const loadGames = async () => {
  loadingGames.value = true
  errors.value = []
  try {
    if (isPrivate.value) {
      games.value = await fetchMyQuizzes()
    } else {
      games.value = await fetchOthersQuizzes(userId.value)
    }
  } catch (error) {
    games.value = []
    setError(error)
  } finally {
    loadingGames.value = false
  }
}

const loadStats = async () => {
  loadingStats.value = true
  try {
    const id = isPrivate.value ? profile.value?.id : userId.value
    if (id) {
      stats.value = await fetchStats(id)
    } else {
      stats.value = null
    }
  } catch (error) {
    stats.value = null
    setError(error)
  } finally {
    loadingStats.value = false
  }
}

const loadLeaderboard = async () => {
  loadingLeaderboard.value = true
  leaderboardError.value = ''
  try {
    leaderboard.value = await fetchLeaderboard()
  } catch (error) {
    leaderboard.value = []
    leaderboardError.value =
      error?.response?.data?.error ||
      (error?.message ? String(error.message) : 'Failed to fetch leaderboard.')
  } finally {
    loadingLeaderboard.value = false
  }
}

const onAvatarFileChange = (event) => {
  selectedAvatarFile.value = event.files?.[0] ?? null
}

const handleAvatarUpload = async () => {
  if (!selectedAvatarFile.value) return
  errors.value = []
  message.value = ''
  try {
    await uploadAvatar(selectedAvatarFile.value)
    message.value = 'Avatar uploaded successfully.'
    selectedAvatarFile.value = null
    await loadProfile()
  } catch (error) {
    setError(error)
  }
}

const handleDeleteAvatar = async () => {
  const confirmed = window.confirm('Delete your current avatar?')
  if (!confirmed) return
  errors.value = []
  message.value = ''
  try {
    await deleteAvatar()
    message.value = 'Avatar deleted successfully.'
    await loadProfile()
  } catch (error) {
    setError(error)
  }
}

const handlePasswordChange = async () => {
  errors.value = []
  message.value = ''
  try {
    if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) {
      errors.value = ['Please fill out both password fields.']
      return
    }
    await changePassword(passwordForm.value.oldPassword, passwordForm.value.newPassword)
    message.value = 'Password changed successfully.'
    passwordForm.value.oldPassword = ''
    passwordForm.value.newPassword = ''
  } catch (error) {
    setError(error)
  }
}

const handleDeleteAccount = async () => {
  const confirmed = window.confirm('Are you sure you want to delete your account? This cannot be undone.')
  if (!confirmed) return
  errors.value = []
  try {
    await deleteAccount()
    setAuthToken(null)
    router.push('/login')
  } catch (error) {
    setError(error)
  }
}

watch(() => route.params.userId, loadProfile, { immediate: true })
</script>

<style scoped>
/* ─── Page Shell ─────────────────────────────────────────── */
.profile-page {
  flex: 1;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #24243e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1.5rem;
  font-family: 'Segoe UI', system-ui, sans-serif;
  overflow-x: hidden;
}

.profile-container {
  width: 100%;
  max-width: 1000px;
}

/* ─── Hero Header ────────────────────────────────────────── */
.hero-header {
  margin-bottom: 3rem;
}

.hero-badge {
  display: inline-block;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 0.4rem 1.2rem;
  border-radius: 100px;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
  margin-bottom: 1rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 900;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.hero-subtitle {
  font-size: 1.1rem;
  opacity: 0.7;
}

/* ─── Navigation ──────────────────────────────────────────── */
.profile-nav-wrapper {
  display: flex;
  justify-content: center;
  overflow-x: auto;
  padding-bottom: 1rem;
}

.profile-nav {
  display: flex;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 100px;
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-pill:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* ─── Main Card ───────────────────────────────────────────── */
.profile-card {
  position: relative;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2.5rem;
  overflow: hidden;
}

.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.2), transparent 70%);
  pointer-events: none;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  text-align: center;
}

@media (min-width: 768px) {
  .profile-info {
    flex-direction: row;
    text-align: left;
  }
}

.avatar-wrapper {
  position: relative;
  width: 160px;
  height: 160px;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  position: relative;
  z-index: 1;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #302b63;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: #fff;
  border: 4px solid #fff;
  z-index: 1;
}

.avatar-glow {
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.6), transparent 70%);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
  100% { opacity: 0.4; transform: scale(1); }
}

.profile-name {
  font-size: 2.5rem;
  font-weight: 900;
  color: #fff;
  margin: 0;
}

.profile-id {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0.25rem 0 0;
}

/* ─── Sections ────────────────────────────────────────────── */
.sections-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 2rem;
}

@media (min-width: 992px) {
  .sections-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .full-width {
    grid-column: span 2;
  }
}

.section-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  height: 100%;
}

.section-card--danger {
  border-color: rgba(244, 63, 94, 0.3);
  background: rgba(244, 63, 94, 0.05);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-desc {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 1.5rem;
}

/* ─── Form Elements ───────────────────────────────────────── */
.form-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.5rem;
  display: block;
}

.game-input {
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  color: #fff !important;
  padding: 0.75rem 1rem !important;
}

.game-file-input :deep(.form-control) {
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  color: #fff !important;
}

.upload-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 576px) {
  .upload-controls {
    flex-direction: row;
    align-items: center;
  }
}

/* ─── Stats ───────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-val {
  font-size: 1.8rem;
  font-weight: 900;
  color: #818cf8;
}

.stat-lab {
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
}

/* ─── History ─────────────────────────────────────────────── */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-main {
  display: flex;
  flex-direction: column;
}

.history-title {
  font-weight: 700;
  color: #fff;
  font-size: 1.1rem;
}

.history-score {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.history-meta {
  text-align: right;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
}

/* ─── Table ───────────────────────────────────────────────── */
.leaderboard-table-wrapper {
  overflow-x: auto;
}

.game-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 0.5rem;
}

.game-table th {
  text-transform: uppercase;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  padding: 0.5rem 1rem;
  text-align: left;
}

.game-table td {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.game-table td:first-child {
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px 0 0 12px;
}

.game-table td:last-child {
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0 12px 12px 0;
}

.row-current td {
  background: rgba(99, 102, 241, 0.15) !important;
  border-color: rgba(99, 102, 241, 0.3) !important;
}

.rank-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
  font-weight: 800;
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.1);
}

.rank-1 { background: #fbbf24; color: #1a1a2e; }
.rank-2 { background: #94a3b8; color: #1a1a2e; }
.rank-3 { background: #b45309; color: #1a1a2e; }

.player-name-cell {
  font-weight: 700;
  color: #fff;
}

.score-cell {
  font-weight: 800;
  color: #fbbf24;
}

/* ─── Buttons ─────────────────────────────────────────────── */
.btn-game {
  padding: 0.7rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 800;
  text-transform: uppercase;
  border: none;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-game:hover:not(:disabled) {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.btn-game:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-game--start {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: #fff;
}

.btn-game--success { background: #22c55e; color: #fff; }
.btn-game--danger { background: #f43f5e; color: #fff; }
.btn-game--secondary { background: rgba(255, 255, 255, 0.15); color: #fff; }

.btn-sm { padding: 0.4rem 1rem; font-size: 0.8rem; }

/* ─── Loader ──────────────────────────────────────────────── */
.loader-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.5);
}

.spinner-game {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
}

.auth-alert {
  background: rgba(244, 63, 94, 0.1) !important;
  border: 1px solid rgba(244, 63, 94, 0.2) !important;
  color: #fb7185 !important;
  border-radius: 12px !important;
}

.auth-alert.success {
  background: rgba(34, 197, 94, 0.1) !important;
  border: 1px solid rgba(34, 197, 94, 0.2) !important;
  color: #4ade80 !important;
}
</style>
