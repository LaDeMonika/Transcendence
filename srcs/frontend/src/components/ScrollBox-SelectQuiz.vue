<template>

    <!-- SCROLL-BOX - SELECT QUIZZES -->
    <div class="row align-items-center justify-content-center border">
      <div class="scroll-box">
        <div class="grid">
          <div
            v-if="items.length === 0"
            class="card empty"
          >
            No quizzes available.
          </div>
          <div
            v-for="item in items"
            :key="item.id"
            class="card"
            :class="{ selected: selectedIds.includes(item.id) }"
            @click="toggleCard(item)"
          >
            {{ item.title }}
          </div>
        </div>
      </div>
    </div>

</template>


<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      selectedIds: [],
      selectedDifficulty: null, // make sure this exists if you use :disabled
    };
  },
  methods: {
    toggleCard(item) {
      const itemId = item.id
      if (this.selectedIds.includes(itemId)) {
        this.selectedIds = []
      } else {
        this.selectedIds = [itemId]
      }

      const selectedItems = this.items.filter((quiz) => this.selectedIds.includes(quiz.id))
      this.$emit('update:selectedItems', selectedItems)
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
</style>
