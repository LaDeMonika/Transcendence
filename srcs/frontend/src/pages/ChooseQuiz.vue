<template>
  <div class="container d-flex flex-column" style="min-height: 100%">

    <!-- TITLE -->
    <div class="row align-items-center justify-content-center border">
      <div class="col-sm d-flex justify-content-center">
        <h1>Choose Quiz!</h1>
      </div>
    </div>

    <!-- SCROLL-BOX - SELECT QUIZZES -->
    <div class="row align-items-center justify-content-center border">
      <div class="scroll-box">
        <div class="grid">
          <div
            v-for="item in items"
            :key="item"
            class="card"
            :class="{ selected: selectedItems.includes(item) }"
            @click="toggleCard(item)"
          >
            {{ item }}
          </div>
        </div>
      </div>
    </div>

    <!-- BUTTONS -> BACK (LOBBY) & START -->
    <div class="row align-items-center justify-content-center border">
      <div class="back-start-buttons d-flex justify-content-center">
        <button class="btn btn-primary mx-3" @click="goBack('lobby')">Lobby</button>
        <button class="btn btn-primary mx-3" @click="startGame('game')">Start</button>
      </div>
    </div>


  </div>
</template>

<script>
export default {
  data() {
    return {
      items: Array.from({ length: 30 }, (_, i) => `Box ${i + 1}`),
      selectedItems: [],
      path: "/",
    };
  },
  methods: {
    toggleCard(item) {
      if (this.selectedItems.includes(item)) {
        this.selectedItems = this.selectedItems.filter((i) => i !== item);
      } else {
        this.selectedItems.push(item);
      }
    },
    goBack(path) {
      this.$router.push(path);
    },
    startGame(path) {
      this.$router.push(path);
    },
  },
};
</script>

<style>
.scroll-box {
  height: 600px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 15px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.card {
  aspect-ratio: 1 / 0.5;
  background: #f5f5f5;
  padding: 20px;
  text-align: center;
  border-radius: 6px;
}

.card.selected {
  border-color: blue;
  background-color: #e6f0ff;
}

.back-start-buttons {
  padding: 25px;
}
</style>
