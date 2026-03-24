<template>
  <BForm @submit="onSubmit">
    <div class="d-flex">
      <BFormTextarea
        v-model="form.message"
        placeholder="Enter message..."
        rows="3"
      />
      <BButton
        type="submit"
        variant="primary"
        class="ms-2 align-self-start"
      >
        <IBiSend />
      </BButton>
    </div>
  </BForm>
</template>

<script setup>
import { reactive } from 'vue'
import { sendWs } from '@/services/chatSocket.js'

const props = defineProps({
  conversationId: { type: [Number, String], default: null }
})

const emit = defineEmits(['sent'])

const form = reactive({ message: '' })

const onSubmit = async (event) => {
  event.preventDefault()
  const text = form.message.trim()
  if (!props.conversationId || !text) return

  form.message = ''

  sendWs({
    type: 'chat:message:new',
    conversationId: props.conversationId,
    body: text,
  })
}
</script>
