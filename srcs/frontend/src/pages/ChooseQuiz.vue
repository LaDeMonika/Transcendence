<template>
  <div class="container d-flex flex-column" style="min-height: 100%">

    <!-- TITLE -->
    <div class="row align-items-center justify-content-center border">
      <div class="col-sm d-flex justify-content-center">
        <h1>Choose Quiz!</h1>
      </div>
    </div>

    <ScrollBoxSelectQuiz @update:selectedItems="updateSelectedItems"/>

    <!-- BUTTONS -> BACK (LOBBY) & START -->
    <div class="row align-items-center justify-content-center border">
      <div class="back-start-buttons d-flex justify-content-center">
        <button class="btn btn-primary mx-3" @click="goBack('lobby')">Lobby</button>
        <button class="btn btn-primary mx-3" @click="startGame('game')" :disabled="!canStart">Start</button>
      </div>
    </div>


  </div>
</template>

<script>
import ScrollBoxSelectQuiz from '@/components/ScrollBox-SelectQuiz.vue';

export default {
  data() {
    return {
      path: "/",
      selectedItems: [],
    };
  },
  methods: {
    goBack(path) {
      this.$router.push(path);
    },
    startGame(path) {
      this.$router.push(path);
    },
    updateSelectedItems(items) {
      this.selectedItems = items;
    },
  },
  computed: {
    canStart() {
      return this.selectedItems.length > 0
    }
  },
};
</script>

<style>
.back-start-buttons {
  padding: 25px;
}
</style>
