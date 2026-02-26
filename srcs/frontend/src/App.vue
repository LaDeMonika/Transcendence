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

  /* background: #232526;
  background: -webkit-linear-gradient(to right, #414345, #232526);
  background: linear-gradient(
    to right,
    #414345,
    #232526
  ); */

  /* background: #5c258d;
  background: -webkit-linear-gradient(to right, #4389a2, #5c258d);
  background: linear-gradient(
    to right,
    #4389a2,
    #5c258d
  ); */

  /* background: #16222a;
  background: -webkit-linear-gradient(to bottom, #6fbee6, #16222a);
  background: linear-gradient(
    to bottom,
    #7dd1fb,
    #72b5e1,
    #152129
  ); */
}
</style>
