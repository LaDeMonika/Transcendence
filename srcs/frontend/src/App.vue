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

.bg-lobby.main-wrapper,
.no-padding.main-wrapper {
  padding-top: 0;
  align-items: stretch;
  flex: 1;
  height: 100%;
}
</style>
