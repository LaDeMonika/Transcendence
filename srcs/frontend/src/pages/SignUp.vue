<template>
  <BCard title="Create new account" class="signup-card text-center">
    <span>Already a member? <BLink to="/login">Login</BLink></span>
    <BButton variant="outline-primary" class="w-100 mt-2">Sign up with Google</BButton>
    <BButton variant="outline-primary" class="w-100 mt-2">Sign up with Github</BButton>
    <span>or</span>
    <BAlert v-if="errors.length > 0" variant="danger" show class="my-3">
      <div v-for="(error, index) in errors" :key="index">{{ error.message }}</div>
    </BAlert>
    <BForm @submit="onSubmit">
      <BFormGroup>
        <div class="row">
          <div class="col">
            <BFormFloatingLabel label="First name" label-for="floatingFirstName" class="my-2">
              <BFormInput id="floatingFirstName" type="text" required v-model="form.firstName" placeholder="First name" />
            </BFormFloatingLabel>
            </div>
          <div class="col">
            <BFormFloatingLabel label="Last name" label-for="floatingLastName" class="my-2">
              <BFormInput id="floatingLastName" type="text" required v-model="form.lastName" placeholder="Last name" />
            </BFormFloatingLabel>
          </div>
        </div>
      </BFormGroup>
      <BFormFloatingLabel label="Email address" label-for="floatingEmail" class="my-2">
        <BFormInput id="floatingEmail" type="email" required v-model="form.email" placeholder="Email address" />
      </BFormFloatingLabel>
      <BFormFloatingLabel label="Password" label-for="floatingPassword" class="my-2">
        <BFormInput id="floatingPassword" type="password" required v-model="form.password" placeholder="Password" />
      </BFormFloatingLabel>
      <BButton :disabled="loading" type="submit" pill variant="primary">
        <span v-if="loading">Creating...</span>
        <span v-else>Create account</span>
      </BButton>
    </BForm>
  </BCard>
</template>

<script setup>
  import { register } from '@/services/auth.js'
  import {reactive, ref} from 'vue'
  import { useRouter } from 'vue-router'
  const router = useRouter()

  const form = reactive({
  email: '',
  password: '',
  firstName: '',
  lastName: ''
})

const errors = ref([])
const loading = ref(false)

const onSubmit = async (event) => {
  event.preventDefault()
  if (loading.value) return
  errors.value = []
  loading.value = true
  try {
    const response = await register(form.email, form.password, form.firstName, form.lastName)
    if (response?.value?.errors) {
      errors.value = response.value.errors
    } else {
      await router.push('/login')
    }
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      errors.value = ['An error occurred during sign up']
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.signup-card {
  max-width: 30rem;
  flex: 1 1 auto;
  margin: 1rem;
}

</style>