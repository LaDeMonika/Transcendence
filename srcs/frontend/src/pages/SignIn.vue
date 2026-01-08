<template>
  <BCard title="Sign In" style="max-width: 40rem">
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
  import {reactive} from 'vue'
  const form = reactive({
  email: '',
  password: ''
})

const onSubmit = (event) => {
  event.preventDefault()
  // eslint-disable-next-line no-alert
  alert(JSON.stringify(form))
}
</script>