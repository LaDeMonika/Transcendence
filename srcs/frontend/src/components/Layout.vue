<template>
  <div class="layout-container">
    <Header />
    <main class="scrollable-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
  import Header from './Header.vue'
</script>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
</style>