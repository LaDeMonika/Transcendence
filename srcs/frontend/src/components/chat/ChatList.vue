<template>
  <div class="chat-list-container bg-light rounded p-3 flex-grow-1 overflow-auto">
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="text-danger">{{ error }}</div>
    <div
      v-for="conv in conversations"
      :key="conv.id"
      class="p-3 mb-2 rounded cursor-pointer transition border"
      :class="{ 'bg-primary text-white border-primary': selectedId === conv.id, 'bg-white border-light': selectedId !== conv.id }"
      @click="select(conv)"
    >
      {{ conv.otherParticipants?.map(p => p.userName).join(', ') || conv.id }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { chatService } from '@/services/chat.js'

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
    console.error('Error loading conversations:', err)
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
.cursor-pointer { cursor: pointer; }
.chat-list-container {
  display: flex;
  flex-direction: column;
}
.transition {
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}
.transition:hover {
  transform: translateX(2px);
}
</style>