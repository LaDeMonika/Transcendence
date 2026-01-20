<template>
  <BCard title="Welcome Back" class="signin-card text-center">
    <span>Don't have an account? <BLink to="/sign_up">Sign up</BLink></span>
    <BButton variant="outline-primary" class="w-100 mt-2">Sign in with Google</BButton>
    <BButton variant="outline-primary" class="w-100 mt-2">Sign in with Github</BButton>
    <span>or</span>
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
  import {reactive} from 'vue'
  const form = reactive({
  email: '',
  password: ''
})

const onSubmit = (event) => {
  event.preventDefault()
  signin(form.email, form.password)
}
</script>

<style scoped>
.signin-card {
  max-width: 30rem;
  flex: 1 1 auto;
  margin: 1rem;
}

</style>