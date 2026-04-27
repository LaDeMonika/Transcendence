<template>
  <div class="container d-flex flex-column" style="min-height: 100%">
    <div class="row border">
      <div class="col-sm d-flex justify-content-center">
        <h1>Join Room</h1>
      </div>
    </div>
    <div class="row flex-grow-1 align-items-center justify-content-center border mb-5">
      <div class="col-sm d-flex justify-content-center border m-3 mb-5" style="height: 250px">
        <div class="d-flex flex-column align-items-center justify-content-center">

          <form @submit.prevent="handleJoin">
            <div class="mb-3 text-center">
            <label for="roomId" class="form-label">Room ID</label>
            <input 
                v-model="roomId"
                type="text" 
                id="roomId" 
                class="form-control form-control-lg" 
                placeholder="e.g. 12345"
                maxlength="10"
                required
            />
            </div>

            <div class="d-grid gap-2">
              <button
                type="submit"
                class="btn btn-primary btn-lg w-100"
                :disabled="!roomId"
              >
                Join As Player
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary btn-lg w-100"
                :disabled="!roomId"
                @click="handleSpectate"
              >
                Watch As Spectator
              </button>
            </div>
        </form>

        <div class="text-center mt-3">
            <small class="text-muted">Enter the ID provided by the host and choose whether to play or watch live.</small>
        </div>


        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; // 1. Import the router hook

const router = useRouter(); // 2. Initialize the router instance

const roomId = ref('');

const handleJoin = () => {
    router.push({ path: `/lobby/${roomId.value}`, query: { role: 'player' } });
};

const handleSpectate = () => {
    router.push({ path: `/lobby/${roomId.value}`, query: { role: 'spectator' } });
};
</script>

<style scoped></style>
