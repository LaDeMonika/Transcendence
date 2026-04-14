<template>
  <div class="container d-flex flex-column" style="min-height: 100%">
    <div class="row border">
      <div class="col-sm d-flex justify-content-center">
        <h1>Lobby</h1>
      </div>
    </div>
    <div class="row flex-grow-1 align-items-center justify-content-center border mb-5">
      <div class="d-flex flex-column align-items-center">
        <p class="fs-4 text-muted mb-4">waiting for players ...</p>
        <button class="btn btn-success btn-lg px-5 shadow" @click="startGame">Start Game</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const startGame = () => {
  // Pass index: 0 to ensure game starts at the very first question properly
  router.push({ path: '/game', query: { index: 0 } })
}
</script>

<style scoped></style>
