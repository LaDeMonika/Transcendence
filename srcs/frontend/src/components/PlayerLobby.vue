<script setup>
defineProps({
  user: {
    type: Object,
    default: null,
  },
  role: {
    type: String,
    required: true, // "host" | "player" | "empty"
  },
})

const emit = defineEmits(['invite'])
</script>

<template>
  <!--
    if host then show host data, 
    else if no user then invite,
    else if user accept invite then show user data
  -->
  <!-- HOST -->
  <div v-if="role === 'host'">
    <BAvatar size="10rem" src="../../public/host.jpg" />
    <div class="text-center">
      <p>{{ user?.name }} <small>(Host)</small></p>
    </div>
  </div>

  <!-- EMPTY SLOT -->
  <div v-else-if="role === 'empty'">
    <img src="../../public/invite2.png" class="player-img" @click="emit('invite')" />
    <div class="text-center">
      <button @click="emit('invite')">Invite Player</button>
    </div>
  </div>

  <!-- NORMAL PLAYER -->
  <div v-else>
    <BAvatar size="10rem" />
    <div class="text-center">
      <p>{{ user?.name }}</p>
    </div>
  </div>
</template>

<style scoped>
.player-img {
  width: 10rem;
  height: 10rem;
  object-fit: cover; /* important */
}
</style>
