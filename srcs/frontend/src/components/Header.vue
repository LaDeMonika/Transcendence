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
            <template v-if="$route.meta.layout === 'public'">
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
              <li class="nav-item">
                <router-link class="nav-link" to="/profile">Profile</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/choose-quiz">Export Quiz</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/api-tester">Public API</router-link>
              </li>
            </template>
          </ul>
        </div>

        <div class="col-sm d-flex justify-content-end gap-2">
          <template v-if="$route.meta.layout === 'public'">
            <router-link to="/login" class="btn btn-outline-success mx-1">Login</router-link>
            <router-link to="/sign_up" class="btn btn-success mx-1">Sign Up</router-link>
          </template>

          <template v-else>
            <button class="btn btn-outline-danger" type="button" @click="logout">Logout</button>
          </template>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { setAuthToken } from '@/services/client.js'

const router = useRouter()

function logout() {
  setAuthToken(null)
  router.push('/login')
}
</script>
