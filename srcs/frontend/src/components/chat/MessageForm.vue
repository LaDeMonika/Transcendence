<template>
  <BForm @submit="onSubmit" class="px-3 py-2">
    <div class="d-flex">
      <BFormTextarea
        v-model="form.message"
        placeholder="Enter message..."
        rows="3"
        class="top-border-only"
      />
      <BButton
        type="submit"
        variant="primary"
        class="ms-2 align-self-start"
      >
        <IBiSend />
      </BButton>
    </div>
    <p v-if="error" class="text-danger mt-2 mb-0">{{ error }}</p>
  </BForm>
</template>

<script setup>
import { onUnmounted, reactive, ref, watch } from 'vue'
import { offWs, onWs, sendWs } from '@/services/chatSocket.js'

const CHAT_MESSAGE_MAX_LENGTH = 255

const props = defineProps({
  conversationId: { type: [Number, String], default: null }
})

const form = reactive({ message: '' })
const error = ref(null)

const clearError = () => {
  error.value = null
}

const onChatError = (payload) => {
  if (Number(payload.conversationId) !== Number(props.conversationId)) return
  error.value = payload.error || 'Failed to send message'
}

watch(() => props.conversationId, () => {
  clearError()
})

watch(() => form.message, () => {
  if (error.value) {
    clearError()
  }
})

onWs('chat:error', onChatError)
onUnmounted(() => offWs('chat:error', onChatError))

const onSubmit = async (event) => {
  event.preventDefault()
  const text = form.message.trim()
  if (!props.conversationId || !text) return

  if (text.length > CHAT_MESSAGE_MAX_LENGTH) {
    error.value = `Message is too long. Maximum length is ${CHAT_MESSAGE_MAX_LENGTH} characters.`
    return
  }

  clearError()

  const wasSent = sendWs({
    type: 'chat:message:new',
    conversationId: props.conversationId,
    body: text,
  })

  if (!wasSent) {
    error.value = 'Chat is not connected right now. Please try again.'
    return
  }

  form.message = ''
}
</script>

<style scoped>
.top-border-only {
  border: none;
  border-top: 1px solid #dee2e6;
  border-radius: 0;
}

.top-border-only:focus {
  border-top: 1px solid #0d6efd;
  outline: none;
  box-shadow: none;
}
</style>
