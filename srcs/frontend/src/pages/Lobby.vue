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
        <input v-model="usernameInput" placeholder="Enter username" @keyup.enter="confirmInvite" />
      </div>
      <div class="ready-btn">
        <button class="btn btn-game btn-purple">START GAME</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* .lobby-main {
  height: ; not working properly, need to fix somehow
} */

.row {
  margin-top: 180px;
}

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
  top: -270px;
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  justify-content: center;
  align-items: center;

  width: 800px;
  padding: 15px;
  border-radius: 30px;
  border: 2px solid #2c3e50;
  box-shadow: 5px 5px 50px rgba(44, 62, 80, 0.4);

  background-color: rgba(13, 2, 49, 0.235); /* Crna pozadina s 50% prozirnosti */
  backdrop-filter: blur(5px);           /* Opcionalno: zamućuje ono što je iza (stakleni efekt) */

  z-index: 1000;
}

.invite-box input {
  background: transparent;
  border: none;
  outline: none;
  padding: 8px;
  color: inherit;
  text-align: center;
}

.invite-box input::placeholder {
  color: rgba(255, 255, 255, 0.826);
}

.ready-btn {
  display: flex;
  justify-content: center;
  align-items: center;

  margin-top: 100px;
}

.btn-purple {
  background: linear-gradient(45deg, #1117cb 0%, #257bfc 100%);
  border: none;
  color: white;
  padding: 12px 30px;
  font-weight: bold;
  text-transform: uppercase;
  box-shadow: 0 4px 15px rgba(8, 25, 56, 0.677);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.btn-purple:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 117, 252, 0.6);
  color: white;
}
</style>
