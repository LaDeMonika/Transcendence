<template>
  <header>
    <!-- Public Header (Before Login) -->
    <nav v-if="$route.meta.layout === 'public'" class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <div class="col-sm d-flex justify-content-start">
          <router-link class="navbar-brand" to="/">Logo here</router-link>
        </div>

        <div class="col-sm d-flex justify-content-center collapse navbar-collapse">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/privacy_policy">Privacy Policy</router-link>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Help</a>
            </li>
          </ul>
        </div>

        <div class="col-sm d-flex justify-content-end gap-2">
          <router-link to="/login" class="btn btn-outline-success mx-1">Login</router-link>
          <router-link to="/sign_up" class="btn btn-success mx-1">Sign Up</router-link>
        </div>
      </div>
    </nav>

    <!-- Authenticated Header (After Login) -->
    <nav v-else class="navbar navbar-expand-lg navbar-light" style="background-color: #e3f2fd;">
      <div class="container-fluid">
        <div class="col-sm d-flex justify-content-start">
          <router-link class="navbar-brand" to="/home">Transcendence</router-link>
        </div>

        <div class="col-sm d-flex justify-content-center collapse navbar-collapse">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/home">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/game">Game</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/lobby">Lobby</router-link>
            </li>
          </ul>
        </div>

        <div class="col-sm d-flex justify-content-end">
          <button class="btn btn-outline-danger" type="button">Logout</button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
// The setup script is intentionally left empty. 
// $route is handled automatically in the template context in Vue 3.
</script>
