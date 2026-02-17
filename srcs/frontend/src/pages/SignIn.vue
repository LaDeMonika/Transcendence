<template>
  <BCard title="Welcome Back" class="signin-card text-center">
    <span>Don't have an account? <BLink to="/sign_up">Sign up</BLink></span>
    <BButton variant="outline-primary" class="w-100 mt-2">Sign in with Google</BButton>
    <BButton variant="outline-primary" class="w-100 mt-2">Sign in with Github</BButton>
    <span>or</span>
    <BAlert v-if="errors.length > 0" variant="danger" show class="my-3">
      <div v-for="(error, index) in errors" :key="index">{{ error.message }}</div>
    </BAlert>
    <BForm @submit="onSubmit">
      <BFormFloatingLabel label="Email address" label-for="floatingEmail" class="my-2">
        <BFormInput id="floatingEmail" type="email" required v-model="form.email" placeholder="Email address" />
      </BFormFloatingLabel>
      <BFormFloatingLabel label="Password" label-for="floatingPassword" class="my-2">
        <BFormInput id="floatingPassword" type="password" required v-model="form.password" placeholder="Password" />
      </BFormFloatingLabel>
      <BButton type="submit" pill variant="primary">Login</BButton>
    </BForm>
  </BCard>
</template>

<script setup>
  import { signin } from '@/services/auth.js'
  import { setAuthToken } from '@/services/client.js'
  import {reactive, ref} from 'vue'
  const form = reactive({
  email: '',
  password: ''
})

const errors = ref([])

const onSubmit = async (event) => {
  event.preventDefault()
  errors.value = []
  try {
    const response = await signin(form.email, form.password)
    if (response.value?.errors) {
      errors.value = response.value.errors
    } else if (response.value?.token) {
      const token = response.value.token
      setAuthToken(token)
    }
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      errors.value = ['An error occurred during sign in']
    }
  }
}
</script>

<style scoped>
.signin-card {
  max-width: 30rem;
  flex: 1 1 auto;
  margin: 1rem;
}

</style>