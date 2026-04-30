<template>
  <div class="home-page">
    <!-- Hero Header -->
    <div class="hero-header">
      <div class="hero-badge">🎮 QUIZ GAME</div>
      <h1 class="hero-title">
        Welcome back,<br />
        <span class="hero-username">{{ username || 'Player' }}</span>
        <span class="hero-wave">👋</span>
      </h1>
      <p class="hero-subtitle">Choose your battle mode and prove your knowledge!</p>
    </div>

    <!-- Game Mode Cards -->
    <div class="game-modes">
      <!--
      <div class="mode-card mode-card--single">
        <div class="mode-card__icon">🧠</div>
        <div class="mode-card__glow"></div>
        <h2 class="mode-card__title">SINGLE MODE</h2>
        <p class="mode-card__desc">Play solo quizz</p>
        <router-link to="/choose-quiz?mode=single" class="mode-card__link">
          <button class="btn-game btn-game--solo">PLAY SOLO</button>
        </router-link>
      </div>
      -->

      <div class="mode-card mode-card--multi">
        <div class="mode-card__icon">⚡</div>
        <div class="mode-card__glow"></div>
        <h2 class="mode-card__title">MULTIPLAYER</h2>
        <p class="mode-card__desc">Play with others</p>
        <router-link to="/multiplayer-create-join-room" class="mode-card__link">
          <button class="btn-game btn-game--multi">LET'S GO!</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCurrentUser } from '@/services/quizSessionService.js'
import { showError } from '@/services/notifications.js'

const username = ref('')

onMounted(async () => {
  try {
    const currentUser = await getCurrentUser()
    username.value = currentUser.userName || ''
  } catch (error) {
    showError(error?.message || 'Failed to load current user')
  }
})
</script>

<style scoped>
/* ─── Page Shell ─────────────────────────────────────────── */
.home-page {
  flex: 1;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #24243e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 3rem 1.5rem;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ─── Hero Header ─────────────────────────────────────────── */
.hero-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.hero-badge {
  display: inline-block;
  background: linear-gradient(90deg, #ff6fd8, #3813c2);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 0.35rem 1.1rem;
  border-radius: 100px;
  box-shadow: 0 0 18px rgba(255, 111, 216, 0.5);
}

.hero-title {
  font-size: clamp(2rem, 6vw, 3.5rem);
  font-weight: 900;
  color: #fff;
  line-height: 1.15;
  margin: 0;
  text-shadow: 0 2px 20px rgba(0,0,0,0.4);
}

.hero-username {
  background: linear-gradient(90deg, #f7971e, #ffd200, #21d4fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-wave {
  display: inline-block;
  margin-left: 0.4rem;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.02em;
}

/* ─── Game Modes Grid ─────────────────────────────────────── */
.game-modes {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  width: 100%;
  max-width: 900px;
}

/* ─── Card Base ───────────────────────────────────────────── */
.mode-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  padding: 2.5rem 2.8rem;
  min-width: 260px;
  flex: 1 1 260px;
  max-width: 360px;
  border-radius: 24px;
  overflow: hidden;
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: default;
}

.mode-card:hover {
  transform: translateY(-6px) scale(1.02);
}

/* Glow blob behind card content */
.mode-card__glow {
  position: absolute;
  inset: 0;
  opacity: 0.18;
  border-radius: 24px;
  pointer-events: none;
}

/* ─── Single Mode Card ────────────────────────────────────── */
.mode-card--single {
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
  box-shadow: 0 8px 40px rgba(99, 102, 241, 0.35);
}
.mode-card--single:hover {
  box-shadow: 0 16px 60px rgba(99, 102, 241, 0.55);
}
.mode-card--single .mode-card__glow {
  background: radial-gradient(circle at 50% 0%, #6366f1, transparent 70%);
  opacity: 0.4;
}

/* ─── Multiplayer Card ────────────────────────────────────── */
.mode-card--multi {
  background: linear-gradient(145deg, #1a1a2e 0%, #0d1b2a 100%);
  box-shadow: 0 8px 40px rgba(251, 113, 133, 0.35);
}
.mode-card--multi:hover {
  box-shadow: 0 16px 60px rgba(251, 113, 133, 0.55);
}
.mode-card--multi .mode-card__glow {
  background: radial-gradient(circle at 50% 0%, #f43f5e, transparent 70%);
  opacity: 0.4;
}

/* ─── Card Content ────────────────────────────────────────── */
.mode-card__icon {
  font-size: 3rem;
  line-height: 1;
  filter: drop-shadow(0 0 12px rgba(255,255,255,0.3));
}

.mode-card__title {
  font-size: 1.5rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0;
  text-shadow: 0 0 20px rgba(255,255,255,0.25);
}

.mode-card__desc {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
}

.mode-card__link {
  text-decoration: none;
}

/* ─── Buttons ─────────────────────────────────────────────── */
.btn-game {
  display: inline-block;
  padding: 0.75rem 2.2rem;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: none;
  border-radius: 100px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
}

.btn-game:hover {
  transform: scale(1.07);
  filter: brightness(1.12);
}

.btn-game:active {
  transform: scale(0.96);
}

.btn-game--solo {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.6);
}

.btn-game--multi {
  background: linear-gradient(90deg, #f43f5e, #fb923c, #fbbf24);
  color: #fff;
  box-shadow: 0 4px 20px rgba(244, 63, 94, 0.6);
}
</style>

