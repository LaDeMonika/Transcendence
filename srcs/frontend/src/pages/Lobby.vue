<script setup></script>

<template>
  <div class="container d-flex flex-column" style="min-height: 100%">
    <div class="row border">
      <div class="col-sm d-flex justify-content-center">
        <h1>Hello Monika!</h1>
      </div>
    </div>
    <div class="row flex-grow-1 align-items-center justify-content-center border mb-5">
      <div class="col-sm d-flex justify-content-center border m-3 mb-5" style="height: 250px">
        <div class="d-flex flex-column align-items-center justify-content-center">
          <h2>SIMGLE MODE</h2>
          <p>Play solo quizzez</p>
          <router-link to="/single/setup">
            <button class="btn btn-primary">ENTER</button>
          </router-link>
        </div>
      </div>
      <div class="col-sm d-flex justify-content-center border m-3 mb-5" style="height: 250px">
        <div class="d-flex flex-column align-items-center justify-content-center">
          <h2>MULTIPAYER</h2>
          <p>Play with others</p>
          <button class="btn btn-primary">ENTER</button>
        </div>
      </div>
      <div class="col-sm d-flex justify-content-center border m-3 mb-5" style="height: 250px">
        <div class="d-flex flex-column align-items-center justify-content-center">
          <h2>TOURNAMENT</h2>
          <p>Play with others</p>
          <button class="btn btn-primary">ENTER</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
