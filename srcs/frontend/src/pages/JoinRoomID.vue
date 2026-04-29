<template>
  <div class="join-room-page">
    <div class="auth-card">
      <div class="card-glow"></div>
      
      <div class="hero-header">
        <div class="hero-badge">🚀 JOIN GAME</div>
        <h1 class="hero-title">Enter Room</h1>
        <p class="hero-subtitle">Enter the code provided by the host</p>
      </div>

      <form @submit.prevent="handleJoin" class="auth-form">
        <div class="form-group text-center">
          <label for="roomId" class="form-label">Room ID</label>
          <input 
            v-model="roomId"
            type="text" 
            id="roomId" 
            class="game-input text-center fs-2" 
            placeholder="00000"
            maxlength="10"
            required
          />
        </div>

        <div class="auth-actions mt-4">
          <button
            type="submit"
            class="btn-game btn-game--start w-100"
            :disabled="!roomId"
          >
            Join As Player
          </button>
          <button
            type="button"
            class="btn-game btn-game--secondary w-100 mt-3"
            :disabled="!roomId"
            @click="handleSpectate"
          >
            Watch As Spectator
          </button>
        </div>

        <div class="legal-text mt-4">
          Choose whether you want to compete or just watch the live action.
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const roomId = ref('');

const handleJoin = () => {
    router.push({ path: `/lobby/${roomId.value}`, query: { role: 'player' } });
};

const handleSpectate = () => {
    router.push({ path: `/lobby/${roomId.value}`, query: { role: 'spectator' } });
};
</script>

<style scoped>
/* ─── Page Shell ─────────────────────────────────────────── */
.join-room-page {
  flex: 1;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #24243e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ─── Auth Card ──────────────────────────────────────────── */
.auth-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.25), transparent 70%);
  pointer-events: none;
}

/* ─── Header ──────────────────────────────────────────────── */
.hero-header {
  text-align: center;
  margin-bottom: 2rem;
}

.hero-badge {
  display: inline-block;
  background: linear-gradient(90deg, #06b6d4, #6366f1);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 0.35rem 1.1rem;
  border-radius: 100px;
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
  margin-bottom: 1rem;
}

.hero-title {
  font-size: 2.2rem;
  font-weight: 900;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.hero-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0.5rem 0 0;
}

/* ─── Form ────────────────────────────────────────────────── */
.auth-form {
  width: 100%;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 0.75rem;
}

.game-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;
  padding: 1rem !important;
  color: #fff !important;
  letter-spacing: 0.1em;
  font-weight: 900;
  transition: all 0.2s ease !important;
}

.game-input:focus {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: #06b6d4 !important;
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.2) !important;
  outline: none !important;
}

/* ─── Buttons ─────────────────────────────────────────────── */
.btn-game {
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: none;
  border-radius: 100px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
}

.btn-game:hover:not(:disabled) {
  transform: scale(1.03);
  filter: brightness(1.1);
}

.btn-game:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-game:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-game--start {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.btn-game--secondary {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
}

.legal-text {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  line-height: 1.4;
}
</style>
