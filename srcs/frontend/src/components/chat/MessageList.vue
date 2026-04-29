<template>
  <div ref="listContainer" class="p-4 overflow-auto flex-grow-1">
    <div v-if="loading">Loading messages...</div>
    <div v-else-if="error" class="text-danger">{{ error }}</div>
    <div v-else-if="!conversationId" class="text-muted">Select a chat to start messaging</div>
    <div v-else-if="messages.length === 0" class="text-muted">No messages yet</div>
    <div
      v-for="msg in messages"
      :key="msg.id"
      class="mb-2"
      :class="{ 'text-end': isOwnMessage(msg.senderId) }"
    >
      <div
        class="px-3 py-2 rounded d-inline-block message-bubble"
        :class="isOwnMessage(msg.senderId) ? 'bg-primary text-white' : 'bg-light'"
        style="max-width: 70%"
      >
        <div class="mb-1">
          <span class="fw-bold">{{ senderName(msg.senderId) }}</span>:
        </div>
        <div>{{ msg.text }}</div>
        <div class="mt-1">
          <small class="" :class="isOwnMessage(msg.senderId) ? 'text-info' : 'text-muted'">{{ formatTime(msg.createdAt) }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { chatService } from '@/services/chat.js'
import { onWs, offWs } from '@/services/chatSocket.js'

const props = defineProps({
  conversationId: { type: [Number, String], default: null },
  conversation: { type: Object, default: null }
})

const currentUser = ref(null)
chatService.getMe().then((u) => { currentUser.value = u }).catch(() => {})

const senderMap = computed(() => {
  const map = {}
  for (const p of props.conversation?.otherParticipants ?? []) {
    map[p.id] = p.email
  }
  return map
})

const senderName = (senderId) => {
  if (currentUser.value && Number(senderId) === Number(currentUser.value.id)) return 'You'
  return senderMap.value[senderId] ?? 'former member'
}

const isOwnMessage = (senderId) => {
  return currentUser.value && Number(senderId) === Number(currentUser.value.id)
}

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

const listContainer = ref(null)
const messages = ref([])
const loading = ref(false)
const error = ref(null)
const seenIds = new Set()

const scrollToBottom = () => {
  const el = listContainer.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

const loadMessages = async (id) => {
  if (!id) { messages.value = []; seenIds.clear(); return }
  try {
    loading.value = true
    error.value = null
    messages.value = await chatService.getMessages(id)
    seenIds.clear()
    messages.value.forEach((m) => seenIds.add(m.id))
    await nextTick()
    scrollToBottom()
  } catch (err) {
    error.value = 'Failed to load messages: ' + err.message
    console.error('Error loading messages:', err)
  } finally {
    loading.value = false
  }
}

const onWsMessage = async (payload) => {
  if (Number(payload.conversationId) !== Number(props.conversationId)) return
  if (seenIds.has(payload.message.id)) return
  seenIds.add(payload.message.id)
  messages.value.push(payload.message)
  await nextTick()
  scrollToBottom()
}

watch(() => props.conversationId, (id) => loadMessages(id), { immediate: true })

onMounted(() => onWs('chat:message:created', onWsMessage))
onUnmounted(() => offWs('chat:message:created', onWsMessage))

defineExpose({ loadMessages })
</script>

<style scoped>
.message-bubble {
  word-wrap: break-word;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
