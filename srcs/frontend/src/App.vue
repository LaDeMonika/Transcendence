<template>
  <BApp class="app-root" append-toast>
    <Layout>
      <div :class="$route.meta.bodyClass" class="main-wrapper">
        <router-view />
      </div>
    </Layout>
  </BApp>
</template>

<script setup>
import { useToast } from 'bootstrap-vue-next'
import { setToastInstance } from '@/services/notifications.js'

const toast = useToast()
setToastInstance(toast)
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}

.main-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100%;
  width: 100%;
  padding-top: 2rem;
  flex: 1 1 auto;
}

.bg-lobby {
  background-color: azure;
}
</style>
