<template>
  <div class="container py-4 friends-page">
    <div class="text-center mb-4">
      <h2>Friends</h2>
    </div>

    <div class="d-flex justify-content-center mb-4">
      <div class="btn-group">
        <button
          class="btn"
          :class="activeTab === 'friends' ? 'btn-primary' : 'btn-outline-primary'"
          @click="activeTab = 'friends'"
        >
          Friends
          <span v-if="friends.length" class="badge bg-secondary ms-1">{{ friends.length }}</span>
        </button>
        <button
          class="btn"
          :class="activeTab === 'requests' ? 'btn-primary' : 'btn-outline-primary'"
          @click="activeTab = 'requests'"
        >
          Requests
          <span v-if="requests.length" class="badge bg-danger ms-1">{{ requests.length }}</span>
        </button>
        <button
          class="btn"
          :class="activeTab === 'sent' ? 'btn-primary' : 'btn-outline-primary'"
          @click="activeTab = 'sent'"
        >
          Sent
          <span v-if="sent.length" class="badge bg-secondary ms-1">{{ sent.length }}</span>
        </button>
        <button
          class="btn"
          :class="activeTab === 'find' ? 'btn-primary' : 'btn-outline-primary'"
          @click="activeTab = 'find'"
        >
          Find
        </button>
      </div>
    </div>

    <BAlert v-if="errors.length" variant="danger" show class="mb-3">
      <div v-for="(error, index) in errors" :key="index">{{ error }}</div>
    </BAlert>

    <div v-if="loading" class="text-center py-5 text-muted">Loading...</div>

    <div v-else>
      <BCard v-if="activeTab === 'friends'">
        <BCardBody>
          <div v-if="friends.length === 0" class="text-muted text-center py-3">
            No friends yet. Use Find to add someone!
          </div>
          <div
            v-for="user in friends"
            :key="user.friend_id"
            class="friend-row d-flex align-items-center justify-content-between p-3 rounded border mb-2"
          >
            <div class="d-flex align-items-center gap-3">
              <img :src="avatarUrl(user.friend_id)" class="rounded-circle friend-avatar" alt="Avatar" />
              <router-link :to="`/profile/${user.friend_id}`" class="fw-bold text-decoration-none">
                {{ user.userName }}
              </router-link>
            </div>
            <BButton
              variant="outline-danger"
              size="sm"
              @click="handleRemove(user.friend_id)"
              :disabled="actionLoading === user.friend_id"
            >
              Remove
            </BButton>
          </div>
        </BCardBody>
      </BCard>

      <BCard v-if="activeTab === 'requests'">
        <BCardBody>
          <div v-if="requests.length === 0" class="text-muted text-center py-3">
            No pending friend requests.
          </div>
          <div
            v-for="user in requests"
            :key="user.friend_id"
            class="friend-row d-flex align-items-center justify-content-between p-3 rounded border mb-2"
          >
            <div class="d-flex align-items-center gap-3">
              <img :src="avatarUrl(user.friend_id)" class="rounded-circle friend-avatar" alt="Avatar" />
              <router-link :to="`/profile/${user.friend_id}`" class="fw-bold text-decoration-none">
                {{ user.userName }}
              </router-link>
            </div>
            <div class="d-flex gap-2">
              <BButton
                variant="success"
                size="sm"
                @click="handleAccept(user.friend_id)"
                :disabled="actionLoading === user.friend_id"
              >
                Accept
              </BButton>
              <BButton
                variant="outline-danger"
                size="sm"
                @click="handleRemove(user.friend_id)"
                :disabled="actionLoading === user.friend_id"
              >
                Decline
              </BButton>
            </div>
          </div>
        </BCardBody>
      </BCard>

      <BCard v-if="activeTab === 'sent'">
        <BCardBody>
          <div v-if="sent.length === 0" class="text-muted text-center py-3">
            No outgoing requests.
          </div>
          <div
            v-for="user in sent"
            :key="user.friend_id"
            class="friend-row d-flex align-items-center justify-content-between p-3 rounded border mb-2"
          >
            <div class="d-flex align-items-center gap-3">
              <img :src="avatarUrl(user.friend_id)" class="rounded-circle friend-avatar" alt="Avatar" />
              <router-link :to="`/profile/${user.friend_id}`" class="fw-bold text-decoration-none">
                {{ user.userName }}
              </router-link>
            </div>
            <BButton
              variant="outline-secondary"
              size="sm"
              @click="handleRemove(user.friend_id)"
              :disabled="actionLoading === user.friend_id"
            >
              Cancel
            </BButton>
          </div>
        </BCardBody>
      </BCard>

      <BCard v-if="activeTab === 'find'">
        <BCardBody>
          <BForm @submit.prevent="handleSearch" class="d-flex gap-2 mb-4">
            <BFormInput
              v-model="searchQuery"
              placeholder="Search by username..."
              :disabled="searchLoading"
            />
            <BButton type="submit" variant="primary" :disabled="searchLoading || !searchQuery.trim()">
              {{ searchLoading ? 'Searching...' : 'Search' }}
            </BButton>
          </BForm>

          <div v-if="searchResults === null" class="text-muted text-center py-3">
            Enter a username to find people.
          </div>
          <div v-else-if="searchResults.length === 0" class="text-muted text-center py-3">
            No users found.
          </div>
          <div
            v-else
            v-for="user in searchResults"
            :key="user.id"
            class="friend-row d-flex align-items-center justify-content-between p-3 rounded border mb-2"
          >
            <div class="d-flex align-items-center gap-3">
              <img :src="avatarUrl(user.id)" class="rounded-circle friend-avatar" alt="Avatar" />
              <router-link :to="`/profile/${user.id}`" class="fw-bold text-decoration-none">
                {{ user.userName }}
              </router-link>
            </div>
            <div>
              <BButton
                v-if="friendStatusMap[user.id] === 'accepted'"
                variant="outline-secondary"
                size="sm"
                disabled
              >
                Friends
              </BButton>
              <BButton
                v-else-if="friendStatusMap[user.id] === 'requested'"
                variant="outline-secondary"
                size="sm"
                disabled
              >
                Request Sent
              </BButton>
              <div v-else-if="friendStatusMap[user.id] === 'pending'" class="d-flex gap-2">
                <BButton
                  variant="success"
                  size="sm"
                  @click="handleAccept(user.id)"
                  :disabled="actionLoading === user.id"
                >
                  Accept
                </BButton>
                <BButton
                  variant="outline-danger"
                  size="sm"
                  @click="handleRemove(user.id)"
                  :disabled="actionLoading === user.id"
                >
                  Decline
                </BButton>
              </div>
              <BButton
                v-else
                variant="primary"
                size="sm"
                @click="handleAdd(user.id)"
                :disabled="actionLoading === user.id"
              >
                Add Friend
              </BButton>
            </div>
          </div>
        </BCardBody>
      </BCard>
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

const friends = computed(() => allFriends.value.filter((f) => f.status === 'accepted'))
const requests = computed(() => allFriends.value.filter((f) => f.status === 'pending'))
const sent = computed(() => allFriends.value.filter((f) => f.status === 'requested'))
const friendStatusMap = computed(() => {
  const map = {}
  allFriends.value.forEach((f) => { map[f.friend_id] = f.status })
  return map
})

const avatarUrl = (userId) => `/api/profile/getAvatar/${userId}`

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

loadFriends()
</script>

<style scoped>
.friend-avatar {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border: 2px solid #dee2e6;
}
.friend-row {
  background: #ffffff;
}
</style>
