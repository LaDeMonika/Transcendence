<template>
  <BModal
    :model-value="props.modelValue"
    @update:model-value="$emit('update:model-value', $event)"
    title="Reset Password"
  >
    <BFormFloatingLabel label="Reset Code" label-for="resetCode" class="my-2">
      <BFormInput id="resetCode" type="text" required v-model="form.reset_code" placeholder="Reset Code" />
    </BFormFloatingLabel>
    <BFormFloatingLabel label="New Password" label-for="newPassword" class="my-2">
      <BFormInput id="newPassword" type="password" required v-model="form.password" placeholder="New Password" />
    </BFormFloatingLabel>
    <BFormFloatingLabel label="Confirm New Password" label-for="confirmNewPassword" class="my-2">
      <BFormInput id="confirmNewPassword" type="password" required v-model="form.confirm_password" placeholder="Confirm New Password" />
    </BFormFloatingLabel>
    <template #footer>
      <BButton type="submit" pill variant="primary">Reset Password</BButton>
    </template>
  </BModal>
</template>

<script setup lang="ts">
import {reactive} from 'vue'
  const form = reactive({
  reset_code: '',
  password: '',
  confirm_password: ''
})

const props = defineProps(['modelValue'])
</script>

<style scoped>
.modal-header > h5 {
  width: 100%;
}
</style>