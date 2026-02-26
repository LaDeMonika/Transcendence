<template>
  <BApp class="app-root">
    <Layout>
      <div :class="$route.meta.bodyClass" class="main-wrapper">
        <router-view />
      </div>
    </Layout>
  </BApp>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

.main-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 100%;
}

.bg-lobby {
  background-image: url('../public/Lobby-background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>