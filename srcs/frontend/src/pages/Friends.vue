<template>
  <div class="friends-page">
    <div class="friends-container">
      
      <!-- Hero Header -->
      <div class="hero-header text-center mb-5">
        <div class="hero-badge">👥 SOCIAL HUB</div>
        <h1 class="hero-title">Friends</h1>
        <p class="hero-subtitle text-muted">Manage your connections and find new players.</p>
      </div>

      <!-- Navigation Tabs -->
      <div class="friends-nav-wrapper mb-5">
        <div class="friends-nav">
          <button
            class="nav-pill"
            :class="{ active: activeTab === 'friends' }"
            @click="activeTab = 'friends'"
          >
            <span class="pill-icon">🧑‍🤝‍🧑</span>
            <span class="pill-label">Friends</span>
            <span v-if="friends.length" class="pill-badge">{{ friends.length }}</span>
          </button>
          <button
            class="nav-pill"
            :class="{ active: activeTab === 'requests' }"
            @click="activeTab = 'requests'"
          >
            <span class="pill-icon">📩</span>
            <span class="pill-label">Requests</span>
            <span v-if="requests.length" class="pill-badge pill-badge--danger">{{ requests.length }}</span>
          </button>
          <button
            class="nav-pill"
            :class="{ active: activeTab === 'sent' }"
            @click="activeTab = 'sent'"
          >
            <span class="pill-icon">📤</span>
            <span class="pill-label">Sent</span>
            <span v-if="sent.length" class="pill-badge">{{ sent.length }}</span>
          </button>
          <button
            class="nav-pill"
            :class="{ active: activeTab === 'find' }"
            @click="activeTab = 'find'"
          >
            <span class="pill-icon">🔍</span>
            <span class="pill-label">Find</span>
          </button>
        </div>
      </div>

      <!-- Error Alerts -->
      <BAlert v-if="errors.length" variant="danger" show class="mb-4 auth-alert">
        <div v-for="(error, index) in errors" :key="index">{{ error }}</div>
      </BAlert>

      <!-- Main Content Area -->
      <div class="friends-content">
        <div v-if="loading" class="loader-view">
          <div class="spinner-game"></div>
          <p>Loading your social circle...</p>
        </div>

        <div v-else class="content-fade">
          
          <!-- Friends Tab -->
          <div v-if="activeTab === 'friends'" class="friend-list">
            <div v-if="friends.length === 0" class="empty-state">
              <span class="empty-icon">🌵</span>
              <p>No friends yet. Use <strong>Find</strong> to add someone!</p>
            </div>
            <div
              v-for="user in friends"
              :key="user.id"
              class="friend-card"
            >
              <div class="friend-info">
                <div class="avatar-wrap">
                  <img :src="avatarUrl(user.avatarUrl)" class="friend-avatar" alt="Avatar" />
                  <div class="status-dot online"></div>
                </div>
                <router-link :to="`/profile/${user.id}`" class="friend-name">
                  {{ user.userName }}
                </router-link>
              </div>
              <button
                class="btn-game btn-game--danger btn-sm"
                @click="handleRemove(user.id)"
                :disabled="actionLoading === user.id"
              >
                Remove
              </button>
            </div>
          </div>

          <!-- Requests Tab -->
          <div v-if="activeTab === 'requests'" class="friend-list">
            <div v-if="requests.length === 0" class="empty-state">
              <span class="empty-icon">📭</span>
              <p>No pending friend requests.</p>
            </div>
            <div
              v-for="user in requests"
              :key="user.id"
              class="friend-card"
            >
              <div class="friend-info">
                <img :src="avatarUrl(user.avatarUrl)" class="friend-avatar" alt="Avatar" />
                <router-link :to="`/profile/${user.id}`" class="friend-name">
                  {{ user.userName }}
                </router-link>
              </div>
              <div class="friend-actions">
                <button
                  class="btn-game btn-game--success btn-sm"
                  @click="handleAccept(user.id)"
                  :disabled="actionLoading === user.id"
                >
                  Accept
                </button>
                <button
                  class="btn-game btn-game--danger btn-sm"
                  @click="handleRemove(user.id)"
                  :disabled="actionLoading === user.id"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>

          <!-- Sent Tab -->
          <div v-if="activeTab === 'sent'" class="friend-list">
            <div v-if="sent.length === 0" class="empty-state">
              <span class="empty-icon">✈️</span>
              <p>No outgoing requests.</p>
            </div>
            <div
              v-for="user in sent"
              :key="user.id"
              class="friend-card"
            >
              <div class="friend-info">
                <img :src="avatarUrl(user.avatarUrl)" class="friend-avatar" alt="Avatar" />
                <router-link :to="`/profile/${user.id}`" class="friend-name">
                  {{ user.userName }}
                </router-link>
              </div>
              <button
                class="btn-game btn-game--secondary btn-sm"
                @click="handleRemove(user.id)"
                :disabled="actionLoading === user.id"
              >
                Cancel
              </button>
            </div>
          </div>

          <!-- Find Tab -->
          <div v-if="activeTab === 'find'" class="search-view">
            <div class="search-box mb-4">
              <BForm @submit.prevent="handleSearch" class="search-form">
                <BFormInput
                  v-model="searchQuery"
                  placeholder="Search by username..."
                  :disabled="searchLoading"
                  class="game-input"
                />
                <button type="submit" class="btn-game btn-game--start" :disabled="searchLoading || !searchQuery.trim()">
                  {{ searchLoading ? '⌛' : '🔍' }}
                </button>
              </BForm>
            </div>

            <div class="friend-list">
              <div v-if="filteredSearchResults === null" class="empty-state">
                <p>Enter a username to find people.</p>
              </div>
              <div v-else-if="filteredSearchResults.length === 0" class="empty-state">
                <p>No users found matching "{{ searchQuery }}".</p>
              </div>
              <div
                v-else
                v-for="user in filteredSearchResults"
                :key="user.id"
                class="friend-card"
              >
                <div class="friend-info">
                  <img :src="avatarUrl(user.avatarUrl)" class="friend-avatar" alt="Avatar" />
                  <router-link :to="`/profile/${user.id}`" class="friend-name">
                    {{ user.userName }}
                  </router-link>
                </div>
                <div class="friend-actions">
                  <span
                    v-if="friendStatusMap[user.id] === 'accepted'"
                    class="status-pill status-pill--success"
                  >
                    Friends
                  </span>
                  <span
                    v-else-if="friendStatusMap[user.id] === 'requested'"
                    class="status-pill status-pill--info"
                  >
                    Request Sent
                  </span>
                  <div v-else-if="friendStatusMap[user.id] === 'pending'" class="friend-actions">
                    <button
                      class="btn-game btn-game--success btn-sm"
                      @click="handleAccept(user.id)"
                      :disabled="actionLoading === user.id"
                    >
                      Accept
                    </button>
                    <button
                      class="btn-game btn-game--danger btn-sm"
                      @click="handleRemove(user.id)"
                      :disabled="actionLoading === user.id"
                    >
                      Decline
                    </button>
                  </div>
                  <button
                    v-else
                    class="btn-game btn-game--start btn-sm"
                    @click="handleAdd(user.id)"
                    :disabled="actionLoading === user.id"
                  >
                    Add Friend
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getFriendsPivot, addFriend, acceptFriend, removeFriend } from '@/services/friends.js'
import { chatService } from '@/services/chat.js'

const allFriends = ref([])
const loading = ref(false)
const actionLoading = ref(null)
const errors = ref([])
const activeTab = ref('friends')

const searchQuery = ref('')
const searchResults = ref(null)
const searchLoading = ref(false)
const currentUser = ref(null)

const friends = computed(() => allFriends.value.filter((f) => f.status === 'accepted'))
const requests = computed(() => allFriends.value.filter((f) => f.status === 'pending'))
const sent = computed(() => allFriends.value.filter((f) => f.status === 'requested'))
const filteredSearchResults = computed(() => {
  if (!searchResults.value) return null
  return searchResults.value.filter((user) => user.id !== currentUser.value?.id)
})
const friendStatusMap = computed(() => {
  const map = {}
  allFriends.value.forEach((f) => { map[f.id] = f.status })
  return map
})

const avatarUrl = (userId) => '/api/profile/getAvatar/' + (userId || 'default.png') // userId is avatarUrl in this case

const setError = (error) => {
  if (error?.response?.data?.errors) {
    errors.value = Array.isArray(error.response.data.errors)
      ? error.response.data.errors.map((e) => e.message || e)
      : [error.response.data.errors]
  } else if (error?.response?.data?.error) {
    const payload = error.response.data.error
    errors.value = Array.isArray(payload) ? payload.map((e) => e.message || e) : [payload]
  } else if (error?.message) {
    errors.value = [error.message]
  } else {
    errors.value = ['An unexpected error occurred.']
  }
}

const loadFriends = async () => {
  loading.value = true
  errors.value = []
  try {
    allFriends.value = await getFriendsPivot()
  } catch (error) {
    setError(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  searchLoading.value = true
  errors.value = []
  try {
    searchResults.value = await chatService.searchUsers(searchQuery.value.trim())
  } catch (error) {
    setError(error)
  } finally {
    searchLoading.value = false
  }
}

const handleAdd = async (friendId) => {
  actionLoading.value = friendId
  errors.value = []
  try {
    await addFriend(friendId)
    await loadFriends()
  } catch (error) {
    setError(error)
  } finally {
    actionLoading.value = null
  }
}

const handleAccept = async (friendId) => {
  actionLoading.value = friendId
  errors.value = []
  try {
    await acceptFriend(friendId)
    await loadFriends()
  } catch (error) {
    setError(error)
  } finally {
    actionLoading.value = null
  }
}

const handleRemove = async (friendId) => {
  actionLoading.value = friendId
  errors.value = []
  try {
    await removeFriend(friendId)
    await loadFriends()
  } catch (error) {
    setError(error)
  } finally {
    actionLoading.value = null
  }
}

chatService.getMe().then((me) => {
  currentUser.value = me
}).catch(() => {})

loadFriends()
</script>

<style scoped>
/* ─── Page Shell ─────────────────────────────────────────── */
.friends-page {
  flex: 1;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #24243e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1.5rem;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.friends-container {
  width: 100%;
  max-width: 800px;
}

/* ─── Hero Header ────────────────────────────────────────── */
.hero-header {
  margin-bottom: 3rem;
}

.hero-badge {
  display: inline-block;
  background: linear-gradient(90deg, #6366f1, #06b6d4);
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
.friends-nav-wrapper {
  display: flex;
  justify-content: center;
  overflow-x: auto;
  padding-bottom: 1rem;
}

.friends-nav {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.4rem;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-pill {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1.2rem;
  border-radius: 100px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-pill:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.nav-pill.active {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.pill-badge {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 0.7rem;
  padding: 0.1rem 0.5rem;
  border-radius: 100px;
}

.pill-badge--danger {
  background: #f43f5e;
}

/* ─── Content ─────────────────────────────────────────────── */
.friends-content {
  width: 100%;
}

.friend-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.friend-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1rem 1.5rem;
  transition: transform 0.2s ease, background 0.2s ease;
}

.friend-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.friend-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-wrap {
  position: relative;
}

.friend-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.status-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #24243e;
}

.status-dot.online { background: #22c55e; }

.friend-name {
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.friend-name:hover {
  color: #818cf8;
}

.friend-actions {
  display: flex;
  gap: 0.5rem;
}

/* ─── Search ──────────────────────────────────────────────── */
.search-form {
  display: flex;
  gap: 0.75rem;
}

.game-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 100px !important;
  color: #fff !important;
  padding: 0.75rem 1.5rem !important;
}

.status-pill {
  padding: 0.4rem 1rem;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-pill--success { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
.status-pill--info { background: rgba(99, 102, 241, 0.15); color: #818cf8; }

/* ─── Utility ─────────────────────────────────────────────── */
.btn-game {
  padding: 0.5rem 1.2rem;
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  border: none;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-game:hover:not(:disabled) {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.btn-game--start { background: linear-gradient(90deg, #6366f1, #8b5cf6); color: #fff; }
.btn-game--success { background: #22c55e; color: #fff; }
.btn-game--danger { background: #f43f5e; color: #fff; }
.btn-game--secondary { background: rgba(255, 255, 255, 0.15); color: #fff; }

.btn-sm { padding: 0.4rem 1rem; font-size: 0.75rem; }

.loader-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.5);
}

.spinner-game {
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.4);
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.auth-alert {
  background: rgba(244, 63, 94, 0.1) !important;
  border: 1px solid rgba(244, 63, 94, 0.2) !important;
  color: #fb7185 !important;
  border-radius: 12px !important;
}
</style>
