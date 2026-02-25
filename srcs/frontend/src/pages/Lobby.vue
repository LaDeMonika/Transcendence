<script setup>
import PlayerLobby from '@/components/PlayerLobby.vue'
import { ref } from 'vue'

const host = ref({
  name: 'Monika',
})

const leftPlayer = ref(null)
const rightPlayer = ref(null)

const showInviteInput = ref(null)
// "left" | "right" | null

const usernameInput = ref('')

function openInvite(side) {
  showInviteInput.value = side
  usernameInput.value = ''
}

function confirmInvite() {
  const newPlayer = { name: usernameInput.value }

  if (showInviteInput.value === 'left') {
    leftPlayer.value = newPlayer
  }

  if (showInviteInput.value === 'right') {
    rightPlayer.value = newPlayer
  }

  showInviteInput.value = null
}
</script>

<template>
  <main class="lobby-main">
    <div class="container">
      <div class="row">
        <div class="col-sm d-flex justify-content-center col-up">
          <PlayerLobby
            :user="leftPlayer"
            :role="leftPlayer ? 'player' : 'empty'"
            @invite="openInvite('left')"
          />
        </div>
        <div class="col-sm d-flex justify-content-center col-down">
          <PlayerLobby :user="host" role="host" />
        </div>
        <div class="col-sm d-flex justify-content-center col-up">
          <PlayerLobby
            :user="rightPlayer"
            :role="rightPlayer ? 'player' : 'empty'"
            @invite="openInvite('right')"
          />
        </div>
      </div>
      <!-- Invite Input Modal (simple version) -->
      <div v-if="showInviteInput" class="invite-box">
        <input v-model="usernameInput" placeholder="Enter username" />
        <button @click="confirmInvite">Confirm</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* .lobby-main {
  height: ; not working properly, need to fix somehow
} */

.container {
  position: relative;
}

.col-sm {
    margin: 0px 80px 0px 80px;
}

.col-up {
  transform: translateY(-100px);
}

.col-down {
  transform: translateY(15px);
}

.invite-box {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);

  width: 300px;
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  z-index: 1000;
}
</style>
