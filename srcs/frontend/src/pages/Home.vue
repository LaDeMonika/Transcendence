<template>
  <div class="container d-flex flex-column" style="min-height: 100%">
    <div class="row border">
      <div class="col-sm d-flex justify-content-center">
        <h1>Hello {{ username }}!</h1>
      </div>
    </div>
    <div class="row flex-grow-1 align-items-center justify-content-center border mb-5">
    <!--
      <div
        class="col-sm d-flex justify-content-center border m-3 mb-5"
        style="height: 250px"
      >
        <div class="d-flex flex-column align-items-center justify-content-center">
          <h2>SINGLE MODE</h2>
          <p>Play solo quizz</p>
          <router-link to="/choose-quiz?mode=single">
            <button class="btn btn-primary">ENTER</button>
          </router-link>
        </div>
      </div>
    -->
      <div
        class="col-sm d-flex justify-content-center border m-3 mb-5"
        style="height: 250px"
      >
        <div class="d-flex flex-column align-items-center justify-content-center">
          <h2>MULTIPLAYER</h2>
          <p>Play with others</p>
          <router-link to="/multiplayer-create-join-room">
            <button class="btn btn-primary">ENTER</button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { client } from '../services/client.js'

const username = ref('')

onMounted(async () => {
  try {
    const res = await client.get('/me')
    username.value = res.data.userName ?? res.data.username ?? ''
  } catch {
  }
})
</script>

<style scoped></style>
