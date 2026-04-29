<template>
  <div class="container py-4 profile-page">
    <div class="text-center mb-4">
      <h2>{{ isPrivate ? 'My Profile' : 'Public Profile' }}</h2>
      <p class="text-muted">{{ isPrivate ? 'Manage your account.' : 'User details.' }}</p>
    </div>

    <div class="d-flex flex-wrap justify-content-center mb-4 profile-nav">
      <a v-for="tab in tabs" :key="tab.id" :href="`#${tab.id}`" class="btn btn-outline-primary profile-nav-btn me-2 mb-2">
        <span class="btn-icon">{{ tab.icon }}</span>
        <span class="btn-label ms-2">{{ tab.label }}</span>
      </a>
    </div>

    <BCard class="mb-4 text-center">
      <BCardBody>
        <div class="profile-avatar">
          <img v-if="profile" :src="avatarUrl" alt="Avatar" class="rounded-circle avatar-image mb-3" />
          <div v-else class="avatar-placeholder rounded-circle mb-3">?</div>
          <h4 v-if="profile">{{ profile.userName }}</h4>
          <p v-if="profile" class="mb-0 text-muted">User ID: {{ profile.id }}</p>
          <div v-if="!isPrivate && profile" class="mt-3">
            <BButton
              v-if="friendStatus === null"
              variant="primary"
              size="sm"
              @click="handleAddFriend"
              :disabled="loadingFriendAction"
            >
              Add Friend
            </BButton>
            <div v-else-if="friendStatus === 'pending'" class="d-flex gap-2 justify-content-center">
              <BButton
                variant="success"
                size="sm"
                @click="handleAcceptFriend"
                :disabled="loadingFriendAction"
              >
                Accept Request
              </BButton>
              <BButton
                variant="outline-danger"
                size="sm"
                @click="handleRemoveFriend"
                :disabled="loadingFriendAction"
              >
                Decline
              </BButton>
            </div>
            <BButton
              v-else-if="friendStatus === 'requested'"
              variant="outline-secondary"
              size="sm"
              @click="handleRemoveFriend"
              :disabled="loadingFriendAction"
            >
              Cancel Request
            </BButton>
            <BButton
              v-else-if="friendStatus === 'accepted'"
              variant="outline-danger"
              size="sm"
              @click="handleRemoveFriend"
              :disabled="loadingFriendAction"
            >
              Remove Friend
            </BButton>
          </div>
        </div>
      </BCardBody>
    </BCard>

    <div id="avatar" class="mb-5 section-block">
      <BCard>
        <BCardBody>
          <h4 class="mb-3">Avatar</h4>
          <p class="text-muted">Upload a new avatar picture (PNG or JPG, max 5 MB).</p>
          <BForm @submit.prevent="handleAvatarUpload" class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
            <BFormFile
              ref="avatarInput"
              name="avatar"
              accept="image/png, image/jpeg"
              @change="onAvatarFileChange"
            />
            <BButton type="submit" variant="primary" :disabled="!selectedAvatarFile">Upload</BButton>
            <BButton variant="outline-secondary" @click="handleDeleteAvatar" v-if="isPrivate && profile?.avatarUrl">Delete avatar</BButton>
          </BForm>
          <BAlert v-if="errors.length" variant="danger" show class="mt-3">
            <div v-for="(error, index) in errors" :key="index">{{ error }}</div>
          </BAlert>
        </BCardBody>
      </BCard>
    </div>

    <hr class="section-divider" />

    <div id="password" v-if="isPrivate" class="mb-5 section-block">
      <BCard>
        <BCardBody>
          <h4 class="mb-3">Change Password</h4>
          <BForm @submit.prevent="handlePasswordChange">
            <BFormFloatingLabel label="Current Password" label-for="oldPassword" class="mb-3">
              <BFormInput id="oldPassword" type="password" required v-model="passwordForm.oldPassword" placeholder="Current Password" />
            </BFormFloatingLabel>
            <BFormFloatingLabel label="New Password" label-for="newPassword" class="mb-3">
              <BFormInput id="newPassword" type="password" required v-model="passwordForm.newPassword" placeholder="New Password" />
            </BFormFloatingLabel>
            <BButton type="submit" variant="primary">Update password</BButton>
          </BForm>
          <BAlert v-if="message" variant="success" show class="mt-3">{{ message }}</BAlert>
          <BAlert v-if="errors.length" variant="danger" show class="mt-3">
            <div v-for="(error, index) in errors" :key="index">{{ error }}</div>
          </BAlert>
        </BCardBody>
      </BCard>
    </div>

    <hr class="section-divider" />

    <div id="history" class="mb-5 section-block">
      <BCard>
        <BCardBody>
          <h4 class="mb-3">{{ isPrivate ? 'Game History' : 'Last Games' }}</h4>
          <div v-if="loadingGames" class="text-center py-4">Loading games...</div>
          <div v-else-if="games.length === 0" class="text-muted">No games found.</div>
          <div v-else>
            <div v-for="(game, index) in games" :key="index" class="game-row mb-3 p-3 rounded border">
              <div class="d-flex justify-content-between flex-wrap gap-2">
                <div>
                  <strong>{{ game.title || 'Deleted quiz game' }}</strong>
                  <div class="text-muted">Score: {{ game.score }}</div>
                </div>
                <div class="text-end">
                  <div>Questions: {{ game.questionCount ?? '-' }}</div>
                  <div v-if="game.correctAnswerCount !== undefined">Correct: {{ game.correctAnswerCount }}</div>
                </div>
              </div>
            </div>
          </div>
        </BCardBody>
      </BCard>
    </div>

    <hr class="section-divider" />

    <div id="stats" class="mb-5 section-block">
      <BCard>
        <BCardBody>
          <h4 class="mb-3">Game Statistics</h4>
          <div v-if="loadingStats" class="text-center py-4">Loading statistics...</div>
          <div v-else-if="stats">
            <div class="row text-center">
              <div class="col-sm-6 col-md-3 mb-3">
                <div class="stat-card p-3 rounded border bg-light">Sessions<br /><strong>{{ stats.playedSessions }}</strong></div>
              </div>
              <div class="col-sm-6 col-md-3 mb-3">
                <div class="stat-card p-3 rounded border bg-light">Questions<br /><strong>{{ stats.totalQuestions }}</strong></div>
              </div>
              <div class="col-sm-6 col-md-3 mb-3">
                <div class="stat-card p-3 rounded border bg-light">Answers<br /><strong>{{ stats.totalAnswers }}</strong></div>
              </div>
              <div class="col-sm-6 col-md-3 mb-3">
                <div class="stat-card p-3 rounded border bg-light">Correct<br /><strong>{{ stats.totalCorrectAnswers }}</strong></div>
              </div>
              <div class="col-12">
                <div class="mt-3 text-muted">Accuracy: <strong>{{ accuracy }}%</strong></div>
              </div>
            </div>
          </div>
          <div v-else class="text-muted">Statistics not available.</div>
        </BCardBody>
      </BCard>
    </div>

    <hr class="section-divider" />

    <div id="leaderboard" class="mb-5 section-block">
      <BCard>
        <BCardBody>
          <h4 class="mb-3">🏆 Leaderboard</h4>
          <div v-if="loadingLeaderboard" class="text-center py-4">Loading leaderboard...</div>
          <BAlert v-else-if="leaderboardError" variant="danger" show class="mb-3">{{ leaderboardError }}</BAlert>
          <div v-else-if="leaderboard.length > 0">
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Total Score</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(player, index) in leaderboard" :key="player.id" 
                      :class="{ 'table-warning': isPrivate && profile?.id === player.id }">
                    <td>
                      <strong>#{{ index + 1 }}</strong>
                      <span v-if="index < 3" class="ms-2">
                        🥇🥈🥉
                      </span>
                    </td>
                    <td>{{ player.user_name }}</td>
                    <td><strong>{{ player.total_score }}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="text-muted">No leaderboard data available.</div>
        </BCardBody>
      </BCard>
    </div>

    <hr class="section-divider" />

    <div id="delete-account" v-if="isPrivate" class="mb-5 section-block">
      <BCard class="border-danger">
        <BCardBody>
          <h4 class="mb-3 text-danger">Delete Account</h4>
          <p class="text-muted">Deleting your account will remove your profile and game history permanently.</p>
          <BButton variant="danger" @click="handleDeleteAccount">Delete my account</BButton>
        </BCardBody>
      </BCard>
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
  // { id: 'delete-account', icon: '❌', label: 'Delete' }, // add only if user is private
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
  selectedAvatarFile.value = event.target.files?.[0] ?? null
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
.profile-page {
  min-height: 100%;
}
.profile-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 10rem;
}
.profile-nav-btn .btn-icon {
  font-size: 1.15rem;
}
.profile-nav-btn .btn-label {
  display: inline-block;
}

.profile-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.avatar-image,
.avatar-placeholder {
  width: 150px;
  height: 150px;
  object-fit: cover;
}
.avatar-image {
  border: 3px solid #dee2e6;
}
.avatar-placeholder {
  background: #f8f9fa;
  color: #6c757d;
  display: grid;
  place-items: center;
  font-size: 2rem;
}
.section-divider {
  width: 80%;
  margin: 2rem auto;
  border-top: 1px solid #dee2e6;
}
.section-block {
  scroll-margin-top: 120px;
}
.game-row {
  background: #ffffff;
}
.stat-card {
  min-height: 100px;
}
</style>
