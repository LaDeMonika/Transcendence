<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="card-glow"></div>
      
      <div class="hero-badge">🎮 QUIZ GAME</div>
      <h1 class="hero-title">Join the Game</h1>
      <p class="hero-subtitle">Create an account to start competing</p>

      <div class="auth-switch">
        <span>Already a member? <router-link to="/login" class="auth-link">Login</router-link></span>
      </div>

      <BAlert v-if="errors.length > 0" variant="danger" show class="my-3 auth-alert">
        <div v-for="(error, index) in errors" :key="index">{{ error.message }}</div>
      </BAlert>

      <BForm @submit="onSubmit" class="auth-form">
        <div class="form-group">
          <label class="form-label">Nickname</label>
          <BFormInput id="floatingNickname" type="text" required v-model="form.userName" placeholder="CoolPlayer42" class="game-input" />
        </div>

        <div class="form-group mt-3">
          <label class="form-label">Email address</label>
          <BFormInput id="floatingEmail" type="email" required v-model="form.email" placeholder="email@example.com" class="game-input" />
        </div>
        
        <div class="form-group mt-3">
          <label class="form-label">Password</label>
          <BFormInput id="floatingPassword" type="password" required v-model="form.password" placeholder="••••••••" class="game-input" />
        </div>

        <div class="auth-actions mt-4">
          <button :disabled="loading" type="submit" class="btn-game btn-game--create w-100">
            <span v-if="loading">⏳ Creating...</span>
            <span v-else>🚀 Create account</span>
          </button>
        </div>

        <div class="legal-text mt-4">
          By signing up, you agree to our <router-link to="/privacy_policy" class="auth-link">Privacy Policy</router-link>
        </div>
      </BForm>
    </div>
  </div>
</template>

<script setup>
  import { register } from '@/services/auth.js'
  import {reactive, ref} from 'vue'
  import { useRouter } from 'vue-router'
  const router = useRouter()

  const form = reactive({
  email: '',
  password: '',
  userName: ''
})

const errors = ref([])
const loading = ref(false)

const onSubmit = async (event) => {
  event.preventDefault()
  if (loading.value) return
  errors.value = []
  loading.value = true
  try {
    const response = await register(form.email, form.password, form.userName)
    if (response?.value?.errors) {
      errors.value = response.value.errors
    } else {
      await router.push('/login')
    }
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      errors.value = [{ message: 'An error occurred during sign up' }]
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ─── Page Shell ─────────────────────────────────────────── */
.auth-page {
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
  background: radial-gradient(circle at 50% 0%, rgba(244, 63, 94, 0.2), transparent 70%);
  pointer-events: none;
}

/* ─── Typography ─────────────────────────────────────────── */
.hero-badge {
  display: inline-block;
  background: linear-gradient(90deg, #ff6fd8, #3813c2);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 0.35rem 1.1rem;
  border-radius: 100px;
  box-shadow: 0 0 15px rgba(255, 111, 216, 0.4);
  margin-bottom: 1.5rem;
}

.hero-title {
  font-size: 2rem;
  font-weight: 900;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.hero-subtitle {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0.5rem 0 1.5rem;
  text-align: center;
}

.auth-switch {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
}

.auth-link {
  color: #fb7185;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.auth-link:hover {
  color: #fda4af;
  text-decoration: underline;
}

/* ─── Forms ──────────────────────────────────────────────── */
.auth-form {
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-left: 0.5rem;
}

.game-input {
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  padding: 0.75rem 1rem !important;
  color: #fff !important;
  transition: all 0.2s ease !important;
}

.game-input:focus {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: #f43f5e !important;
  box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.2) !important;
  outline: none !important;
}

.auth-alert {
  background: rgba(244, 63, 94, 0.15) !important;
  border: 1px solid rgba(244, 63, 94, 0.3) !important;
  color: #fb7185 !important;
  border-radius: 12px !important;
  font-size: 0.9rem !important;
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
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-game--create {
  background: linear-gradient(90deg, #f43f5e, #fb923c);
  color: #fff;
  box-shadow: 0 4px 15px rgba(244, 63, 94, 0.4);
}

.legal-text {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  line-height: 1.4;
}
</style>