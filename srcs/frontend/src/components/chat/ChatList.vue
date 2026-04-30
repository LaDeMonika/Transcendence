<template>
  <div class="chat-list-container">
    <div v-if="loading" class="loader-view">
      <div class="spinner-game"></div>
    </div>
    <div v-else-if="error" class="error-text">{{ error }}</div>
    <div v-else class="list-wrapper">
      <div
        v-for="conv in conversations"
        :key="conv.id"
        class="conversation-item"
        :class="{ 'active': selectedId === conv.id }"
        @click="select(conv)"
      >
        <div class="item-icon">
          <span v-if="conv.otherParticipants?.length > 1">👥</span>
          <span v-else>👤</span>
        </div>
        <div class="item-content">
          <div class="item-name">
            {{ conv.otherParticipants?.map(p => p.userName).join(', ') || 'Group Chat #' + conv.id }}
          </div>
          <div class="item-status">Active conversation</div>
        </div>
        <div class="item-indicator" v-if="selectedId === conv.id"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { chatService } from '@/services/chat.js'
import { logRecoverable } from '@/services/logger.js'

const props = defineProps({
  selectedId: { type: [Number, String], default: null }
})

const emit = defineEmits(['select'])

const conversations = ref([])
const loading = ref(true)
const error = ref(null)

const loadConversations = async () => {
  try {
    loading.value = true
    error.value = null
    const data = await chatService.getConversations()
    conversations.value = data
  } catch (err) {
    error.value = 'Failed to load conversations: ' + err.message
    logRecoverable('Failed to load conversations', err)
  } finally {
    loading.value = false
  }
}

const select = (conv) => {
  emit('select', conv)
}

onMounted(() => {
  loadConversations()
})

defineExpose({ loadConversations, conversations })
</script>

<style scoped>
.chat-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.conversation-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1.5px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.conversation-item:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateX(4px);
}

.conversation-item.active {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.active .item-icon {
  background: rgba(99, 102, 241, 0.2);
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-name {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 700;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active .item-name {
  color: #fff;
}

.item-status {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 0.1rem;
}

.item-indicator {
  position: absolute;
  left: 0;
  top: 25%;
  bottom: 25%;
  width: 3px;
  background: #6366f1;
  border-radius: 0 4px 4px 0;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.8);
}

.loader-view {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.spinner-game {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-text {
  color: #f43f5e;
  font-size: 0.85rem;
  padding: 1rem;
  text-align: center;
}
</style>
