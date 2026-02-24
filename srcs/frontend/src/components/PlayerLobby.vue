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
    <div class="under-img-txt text-center">
      <p>{{ user?.name }} <small>(Host)</small></p>
    </div>
  </div>

  <!-- EMPTY SLOT -->
  <div v-else-if="role === 'empty'">
    <img src="../../public/invite2.png" class="player-img" @click="emit('invite')" />
    <div class="under-img-txt text-center">
      <button class="invite-btn" @click="emit('invite')">Invite Player</button>
    </div>
  </div>

  <!-- NORMAL PLAYER -->
  <div v-else>
    <BAvatar size="10rem" />
    <div class="under-img-txt text-center">
      <p>{{ user?.name }}</p>
    </div>
  </div>
</template>

<style scoped>
.player-img {
  width: 10rem;
  height: 10rem;
  object-fit: cover; /* important */
  position: relative;
  left: 13px; /* Bewegt das Bild 15px von seiner normalen Position nach links */
}

.under-img-txt {
    padding: 20px
}

.invite-btn {
  border: none;
  outline: none;

  padding: 10px;
  border-radius: 999px; /* oval pill shape */

  background: linear-gradient(
    135deg,
    #0f0f0f,
    #2a0a3d
  );

  color: white;
  font-weight: 500;

  cursor: pointer;

  box-shadow:
    0 0 8px rgba(120, 40, 180, 0.4),
    0 0 18px rgba(60, 0, 90, 0.3);

  transition: all 0.25s ease;
}

.invite-btn:hover {
  transform: translateY(-5px);

  box-shadow:
    0 0 12px rgba(140, 60, 220, 0.6),
    0 0 25px rgba(80, 20, 120, 0.5);
}

.invite-btn:active {
  transform: scale(0.96);
}
</style>
