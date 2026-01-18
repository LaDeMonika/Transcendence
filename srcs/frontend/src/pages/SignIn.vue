<template>
  <BCard title="Sign In" class="signin-card">
    <BForm @submit="onSubmit">
      <BFormFloatingLabel label="Email address" label-for="floatingEmail" class="my-2">
        <BFormInput id="floatingEmail" type="email"  v-model="form.email" placeholder="Email address" />
      </BFormFloatingLabel>
      <BFormFloatingLabel label="Password" label-for="floatingPassword" class="my-2">
        <BFormInput id="floatingPassword" type="password" v-model="form.password" placeholder="Password" />
      </BFormFloatingLabel>
      <BButton type="submit" variant="primary" size="lg"> Sign In</BButton>
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