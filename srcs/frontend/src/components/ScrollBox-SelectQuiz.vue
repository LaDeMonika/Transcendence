<template>

  <!-- SCROLL-BOX - SELECT QUIZZES -->
  <div class="scroll-box-wrapper">
    <div class="scroll-box">
      <div class="grid">
        <div
          v-if="items.length === 0"
          class="quiz-card empty"
        >
          No quizzes available.
        </div>
        <div
          v-for="item in items"
          :key="item.id"
          class="quiz-card"
          :class="{ selected: selectedIds.includes(item.id) }"
          @click="toggleCard(item)"
        >
          <div class="quiz-card__glow"></div>
          <span class="quiz-card__title">{{ item.title }}</span>
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
      selectedDifficulty: null,
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


<style scoped>
.scroll-box-wrapper {
  width: 100%;
  max-width: 960px;
}

.scroll-box {
  height: 340px;
  overflow-y: auto;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.scroll-box::-webkit-scrollbar {
  width: 6px;
}
.scroll-box::-webkit-scrollbar-track {
  background: transparent;
}
.scroll-box::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

/* ─── Quiz Card ───────────────────────────────────────────── */
.quiz-card {
  position: relative;
  aspect-ratio: 1 / 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  font-size: 0.95rem;
  text-align: center;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.quiz-card:hover {
  transform: translateY(-3px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
}

.quiz-card__glow {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.0), transparent 70%);
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.quiz-card__title {
  position: relative;
  z-index: 1;
}

/* ─── Selected State ──────────────────────────────────────── */
.quiz-card.selected {
  border-color: #818cf8;
  background: rgba(99, 102, 241, 0.2);
  color: #fff;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.45);
}

.quiz-card.selected .quiz-card__glow {
  background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.5), transparent 70%);
}

/* ─── Empty State ─────────────────────────────────────────── */
.quiz-card.empty {
  grid-column: 1 / -1;
  aspect-ratio: unset;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.35);
  font-style: italic;
  cursor: default;
  border-style: dashed;
}
.quiz-card.empty:hover {
  transform: none;
  box-shadow: none;
}
</style>
