<template>
  <BForm
    @submit="onSubmit"
  >
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
import {reactive} from 'vue'

const form = reactive({
  message: '',
})

const onSubmit = (event) => {
  event.preventDefault()
}
</script>