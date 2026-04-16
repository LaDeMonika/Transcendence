<template>
  <div>
    <BButton variant="link" @click="forgotPassModal = !forgotPassModal"> Forgot your password? </BButton>
    <BModal
      v-model="forgotPassModal"
      title="Forgot Password?"
    >
      <span>Enter your email to receive a reset code</span>
      <BFormFloatingLabel label="Email address" label-for="floatingEmail" class="my-2">
        <BFormInput id="floatingEmail" type="email" required v-model="form.email" placeholder="Email address" />
      </BFormFloatingLabel>
      <template #footer>
        <BButton type="submit" pill variant="primary" @click="onSubmit">Send Reset Code</BButton>
      </template>
    </BModal>
  </div>
</template>

<script setup>
import {reactive, ref} from 'vue'
  const form = reactive({
  email: ''
})

  const forgotPassModal = ref(false)

  const emit = defineEmits(['show-reset-password-modal'])

  const onSubmit = () => {
    forgotPassModal.value = false
    emit('show-reset-password-modal')
  }
</script>

<style scoped>
.modal-header > h5 {
  width: 100%;
}
</style>