<template>
  <BApp>
    <Layout>
      <div class="app-content">
        <router-view />
      </div>
    </Layout>
  </BApp>
</template>

<script setup>
import { BApp } from 'bootstrap-vue-next'
import Layout from './components/Layout.vue';
</script>

<style>
.app-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>