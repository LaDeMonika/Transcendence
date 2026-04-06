<template>
  <div>
    {{ conversations }}
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { chatService } from '@/services/chat.js'

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

onMounted(() => {
  loadConversations()
})
</script>

<style scoped>
</style>