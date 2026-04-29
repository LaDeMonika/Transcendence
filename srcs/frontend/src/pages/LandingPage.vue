<script setup>
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()

onMounted(() => {
  const token = localStorage.getItem('token')
  
  if (token) {
    router.push('/home')
  } else {
    router.push('/login')
  }
})
</script>

<template>
  <!-- Redirecting... -->
   <div></div>
</template>
