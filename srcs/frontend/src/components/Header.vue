<template>
  <header>
    <nav class="navbar navbar-expand-lg navbar-light" style="background-color: #e3f2fd;">
      <div class="container-fluid">
        <div class="col-sm d-flex justify-content-start">
          <router-link class="navbar-brand" to="/">
            Transcendence
          </router-link>
        </div>

        <div class="col-sm d-flex justify-content-center collapse navbar-collapse">
          <ul class="navbar-nav mr-auto">
            <template v-if="isPublicLayout">
              <li class="nav-item">
                <router-link class="nav-link" to="/privacy_policy">Privacy Policy</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/terms_of_service">Terms of Service</router-link>
              </li>
            </template>

             <template v-else>
              <li class="nav-item">
                <router-link class="nav-link" to="/home">Home</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/chat">Chat</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/friends">Friends</router-link>
              </li>
            </template>
          </ul>
        </div>

        <div class="col-sm d-flex justify-content-end gap-2 align-items-center">
          <template v-if="isPublicLayout">
            <router-link to="/login" class="btn btn-outline-success mx-1">Login</router-link>
            <router-link to="/sign_up" class="btn btn-success mx-1">Sign Up</router-link>
          </template>

          <template v-else>
            <button class="btn btn-outline-secondary" @click="isDropdownOpen = !isDropdownOpen">More</button>
            <ul class="dropdown-menu" :class="{ show: isDropdownOpen }">
              <li>
                <router-link class="dropdown-item" to="/privacy_policy" @click="isDropdownOpen = false">Privacy Policy</router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/terms_of_service" @click="isDropdownOpen = false">Terms of Service</router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/api-tester" @click="isDropdownOpen = false">Public API tester</router-link>
              </li>
            </ul>
            <button class="btn btn-outline-danger" type="button" @click="logout">Logout</button>
          </template>
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
.header-dropdown {
  position: relative;
  display: inline-block;
}

.header-dropdown summary {
  list-style: none;
  margin: 0;
  padding: 0;
}

.header-dropdown summary::-webkit-details-marker {
  display: none;
}

.dropdown-menu {
  display: none;
  position: absolute;
  right: 0;
  top: calc(100% + 0.25rem);
  min-width: 11rem;
  background-color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 0.25rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
  padding: 0.25rem 0;
  z-index: 1000;
  list-style: none;
  margin: 0;
}

.dropdown-menu.show {
  display: block;
}

.header-dropdown[open] .dropdown-menu {
  display: block;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.35rem 1rem;
  color: #212529;
  text-decoration: none;
}

.dropdown-item:hover,
.dropdown-item:focus {
  background-color: #f8f9fa;
}
</style>
