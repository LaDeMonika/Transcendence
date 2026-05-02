<template>
  <div class="d-flex align-items-center justify-content-between p-3 border-bottom">
    <div class="d-flex align-items-center">
      <!-- Rank / Icon -->
      <div class="me-3 fs-4" style="width: 30px; text-align: center;">
        <span v-if="rank === 1" title="1st Place">🥇</span>
        <span v-else-if="rank === 2" title="2nd Place">🥈</span>
        <span v-else-if="rank === 3" title="3rd Place">🥉</span>
        <span v-else class="text-muted fw-bold fs-5">{{ rank }}</span>
      </div>
      
      <img 
        :src="avatarUrl" 
        :alt="player.name + ' avatar'" 
        class="rounded-circle me-3 border" 
        style="width: 48px; height: 48px; object-fit: cover;"
      >
      
      <!-- Player Name -->
      <span class="fs-5 fw-medium">{{ player.name }}</span>
    </div>
    
    <!-- Player Score -->
    <div class="fs-5 text-primary fw-bold">
      {{ player.score }} pts
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  player: {
    type: Object,
    required: true
  },
  rank: {
    type: Number,
    required: true
  }
})

const avatarUrl = computed(() => '/api/profile/getAvatar/' + (props.player.avatarUrl || 'default.png'))
</script>

<style scoped>
/* Scoped styles can be added here if you want to move away from Bootstrap utility classes later */
</style>
