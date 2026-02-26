<!-- *** THIS FILE USELESS FOR NOW *** -->

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
      <p class="txt-shadow host">{{ user?.name }} <small>(Host)</small></p>
    </div>
  </div>

  <!-- EMPTY SLOT -->
  <div v-else-if="role === 'empty'">
    <img src="../../public/invite2.png" class="player-img" @click="emit('invite')" />
    <div class="under-img-txt text-center">
      <button class="btn btn-transparent" @click="emit('invite')">
        <span class="txt-shadow">Invite Player</span>
      </button>
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
  object-fit: cover;
  position: relative;
  left: 13px;
}

.under-img-txt {
  padding: 20px;
}

.btn-transparent {
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  padding: 0;
}

.txt-shadow {
  position: relative;
  display: inline-block;
  font-size: 1.2rem;
  font-weight: 600;
  color: white;

  text-shadow:
    0 0 5px rgba(129, 23, 242, 0.9),
    0 0 10px rgba(129, 23, 242, 0.8);
}

.txt-shadow::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 55%;
  transform: translate(-50%, -50%);
  width: 180%;
  height: 150%;
  background: radial-gradient(
    ellipse at center,
    rgba(29, 157, 232, 0.95) 0%,
    rgba(23, 176, 242, 0.9) 30%,
    rgba(0, 43, 200, 0.85) 55%,
    rgba(1, 54, 112, 0.6) 75%,
    rgba(5, 2, 66, 0.525) 50%
  );
  filter: blur(8px);
  border-radius: 50%;
  z-index: -1;
  opacity: 0.5;
}

</style>
