<template>
  <div class="message-form-container">
    <BForm @submit="onSubmit" class="message-form">
      <div class="input-wrapper">
        <textarea
          v-model="form.message"
          placeholder="Type a message..."
          class="chat-textarea"
          @keydown.enter.exact.prevent="onSubmit"
          rows="1"
          ref="textareaRef"
          @input="adjustHeight"
        ></textarea>
        <button
          type="submit"
          class="btn-send"
          :disabled="!form.message.trim()"
        >
          <span class="icon">🚀</span>
        </button>
      </div>
      <transition name="fade">
        <p v-if="error" class="error-text">{{ error }}</p>
      </transition>
    </BForm>
  </div>
</template>

<script setup>
import { onUnmounted, reactive, ref, watch, nextTick } from 'vue'
import { offWs, onWs, sendWs } from '@/services/chatSocket.js'

const CHAT_MESSAGE_MAX_LENGTH = 255

const props = defineProps({
  conversationId: { type: [Number, String], default: null }
})

const form = reactive({ message: '' })
const error = ref(null)
const textareaRef = ref(null)

const clearError = () => {
  error.value = null
}

const adjustHeight = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = (el.scrollHeight) + 'px'
}

const onChatError = (payload) => {
  if (Number(payload.conversationId) !== Number(props.conversationId)) return
  error.value = payload.error || 'Failed to send message'
}

watch(() => props.conversationId, () => {
  clearError()
  form.message = ''
  nextTick(adjustHeight)
})

watch(() => form.message, () => {
  if (error.value) {
    clearError()
  }
})

onWs('chat:error', onChatError)
onUnmounted(() => offWs('chat:error', onChatError))

const onSubmit = async (event) => {
  if (event) event.preventDefault()
  const text = form.message.trim()
  if (!props.conversationId || !text) return

  if (text.length > CHAT_MESSAGE_MAX_LENGTH) {
    error.value = `Message is too long (max ${CHAT_MESSAGE_MAX_LENGTH})`
    return
  }

  clearError()

  const wasSent = sendWs({
    type: 'chat:message:new',
    conversationId: props.conversationId,
    body: text,
  })

  if (!wasSent) {
    error.value = 'Connection lost. Retrying...'
    return
  }

  form.message = ''
  nextTick(adjustHeight)
}
</script>

<style scoped>
.message-form-container {
  padding: 1rem 1.5rem;
  background: rgba(15, 12, 41, 0.4);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.message-form {
  position: relative;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 0.5rem 0.5rem 0.5rem 1.25rem;
  transition: all 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.1);
}

.chat-textarea {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 0.95rem;
  padding: 0.4rem 0;
  resize: none;
  max-height: 120px;
  outline: none;
  font-family: inherit;
}

.chat-textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.btn-send {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-send:hover:not(:disabled) {
  transform: scale(1.1) rotate(-10deg);
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
}

.btn-send:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
}

.error-text {
  position: absolute;
  top: -2rem;
  left: 1rem;
  color: #f43f5e;
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(15, 12, 41, 0.9);
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  border: 1px solid rgba(244, 63, 94, 0.3);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
