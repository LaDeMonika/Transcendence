<template>
  <header class="game-header-wrapper">
    <nav class="navbar navbar-expand-lg navbar-dark game-navbar">
      <div class="container-fluid">
        <!-- Logo -->
        <div class="navbar-brand-col">
          <router-link class="game-logo" to="/">
            <span class="logo-icon">✨</span>
            <span class="logo-text">Transcendence</span>
          </router-link>
        </div>

        <!-- Mobile Toggle -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Main Nav -->
        <div class="collapse navbar-collapse" id="navbarContent">
          <ul class="navbar-nav mx-auto">
            <template v-if="isPublicLayout">
              <li class="nav-item">
                <router-link class="nav-link-game" to="/privacy_policy">Privacy Policy</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link-game" to="/terms_of_service">Terms of Service</router-link>
              </li>
            </template>

             <template v-else>
              <li class="nav-item">
                <router-link class="nav-link-game" to="/home">Home</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link-game" to="/chat">Chat</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link-game" to="/friends">Friends</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link-game" to="/profile">Profile</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link-game" to="/choose-quiz">Quiz Manager</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link-game" to="/api-tester">Public API</router-link>
              </li>
            </template>
          </ul>

          <div class="auth-actions-col">
            <template v-if="isPublicLayout">
              <router-link to="/login" class="btn-game btn-game--outline">Login</router-link>
              <router-link to="/sign_up" class="btn-game btn-game--primary">Sign Up</router-link>
            </template>

            <template v-else>
              <button class="btn-game btn-game--danger" type="button" @click="logout">Logout</button>
            </template>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { setAuthToken } from '@/services/client.js'

const router = useRouter()
const isDropdownOpen = ref(false)

// Check if user is authenticated by looking for auth token in localStorage
const isAuthenticated = computed(() => {
  try {
    return !!localStorage.getItem('token')
  } catch (e) {
    return false
  }
})

const isPublicLayout = computed(() => {
  const routeLayout = router.currentRoute.value.meta.layout
  if (routeLayout === 'public') {
    return !isAuthenticated.value
  }
  if (routeLayout === 'auth') {
    return false
  }

  return !isAuthenticated.value
})

function logout() {
  setAuthToken(null)
  router.push('/login')
}
</script>

<style scoped>
.game-header-wrapper {
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
}

.game-navbar {
  background: rgba(15, 12, 41, 0.85) !important;
  backdrop-filter: blur(12px);
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
  padding: 0.75rem 1.5rem;
}

/* Logo */
.game-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  transition: transform 0.2s ease;
}

.game-logo:hover {
  transform: scale(1.05);
}

.logo-icon {
  font-size: 1.5rem;
  filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.6));
}

.logo-text {
  font-size: 1.4rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.02em;
  background: linear-gradient(90deg, #fff, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Nav Links */
.nav-link-game {
  color: rgba(255, 255, 255, 0.65) !important;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 0.5rem 1rem !important;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link-game:hover, .router-link-active {
  color: #fff !important;
}

.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 1rem;
  right: 1rem;
  height: 2px;
  background: #6366f1;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.8);
  border-radius: 2px;
}

/* Buttons */
.auth-actions-col {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.btn-game {
  padding: 0.5rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
}

.btn-game:hover {
  transform: scale(1.05);
}

.btn-game--primary {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.btn-game--outline {
  background: transparent;
  color: #fff;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
}

.btn-game--danger {
  background: rgba(244, 63, 94, 0.15);
  color: #fb7185;
  border: 1.5px solid rgba(244, 63, 94, 0.3);
}

.btn-game--danger:hover {
  background: #f43f5e;
  color: #fff;
}

@media (max-width: 991px) {
  .navbar-collapse {
    background: rgba(15, 12, 41, 0.95);
    margin: 1rem -1.5rem -0.75rem;
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .auth-actions-col {
    margin-top: 1rem;
    justify-content: center;
  }
  
  .nav-link-game {
    text-align: center;
  }
  
  .router-link-active::after {
    display: none;
  }
}
</style>
