<template>
  <div ref="listContainer" class="message-list">
    <div v-if="loading" class="loader-view">
      <div class="spinner-game"></div>
    </div>
    <div v-else-if="error" class="error-view">{{ error }}</div>
    <div v-else-if="!conversationId" class="empty-view">Select a chat to start messaging</div>
    
    <div v-else class="messages-wrapper">
      <div v-if="messages.length === 0" class="empty-view">No messages yet. Say hi! 👋</div>
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-row"
        :class="{ 'message-row--own': isOwnMessage(msg.senderId) }"
      >
        <div class="message-bubble-wrapper">
          <div v-if="!isOwnMessage(msg.senderId)" class="sender-name">
            {{ senderName(msg.senderId) }}
          </div>
          <div class="message-bubble">
            <div class="message-text">{{ msg.text }}</div>
            <div class="message-meta">
              <span class="message-time">{{ formatTime(msg.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { chatService } from '@/services/chat.js'
import { onWs, offWs } from '@/services/chatSocket.js'
import { showError } from '@/services/notifications.js'

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
  return senderMap.value[senderId] ?? 'Former Member'
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
    showError('Error loading messages.')
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
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.message-list::-webkit-scrollbar {
  width: 6px;
}
.message-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.messages-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-row {
  display: flex;
  width: 100%;
}

.message-row--own {
  justify-content: flex-end;
}

.message-bubble-wrapper {
  max-width: 75%;
  display: flex;
  flex-direction: column;
}

.sender-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 0.25rem;
  margin-left: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  position: relative;
  transition: transform 0.1s ease;
}

.message-row--own .message-bubble {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border: none;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
}

.message-row:not(.message-row--own) .message-bubble {
  border-bottom-left-radius: 4px;
}

.message-text {
  font-size: 0.95rem;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-meta {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.25rem;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.6;
}

.loader-view {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.spinner-game {
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-view {
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  padding: 2rem;
  font-style: italic;
}

.error-view {
  color: #f43f5e;
  text-align: center;
  padding: 1rem;
  background: rgba(244, 63, 94, 0.1);
  border-radius: 10px;
}
</style>
