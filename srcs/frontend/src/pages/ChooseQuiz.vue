<template>
  <div class="container d-flex flex-column" style="min-height: 100%">
    <div class="row align-items-center justify-content-center border">
      <div class="col-sm d-flex justify-content-center">
        <h1>Choose Quiz!</h1>
      </div>
    </div>
    <div class="row align-items-center justify-content-center border">
      <div class="scroll-box">
        <div class="grid">
          <div v-for="item in items" :key="item" class="card">
            {{ item }}
          </div>
        </div>
      </div>

      <div class="row align-items-center justify-content-center">
        <div class="back-start-buttons d-flex justify-content-center">
          <button class="btn btn-primary mx-3" @click="prevStep">Back</button>
          <button
            class="btn btn-primary mx-3"
            @click="startGame"
            :disabled="!selectedDifficulty"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: Array.from({ length: 30 }, (_, i) => `Box ${i + 1}`),
    };
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
  grid-template-columns: repeat(3, 1fr); /* 3 per row */
  gap: 20px;
}

.card {
  aspect-ratio: 1 / 0.5;
  background: #f5f5f5;
  padding: 20px;
  text-align: center;
  border-radius: 6px;
}

.back-start-buttons {
  padding: 25px;
}
</style>
