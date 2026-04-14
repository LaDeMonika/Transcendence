<template>
  <div class="container d-flex flex-column py-4" style="min-height: 100%">
    <div class="row align-items-center justify-content-center border">
      <div class="col-sm justify-content-center">
        
        <div class="row align-items-center justify-content-center border">
          <h4 class="m-0">
            Question {{ currentQuestionIndex + 1 }} / {{ questions.length }}
          </h4>
        </div>

        <div class="row align-items-center justify-content-center border">
          <span :class="{ 'text-danger': timeLeft <= 5 }">
            Time Remaining: {{ timeLeft }}s
          </span>
        </div>

      </div>
    </div>


    <div class="row align-items-center justify-content-center border flex-grow-1">
      <div class="col-sm-10 col-md-8 col-lg-6">
        <div class="quiz-card-wrapper" :class="{ 'is-flipped': isFlipped }">
          <div class="quiz-card-inner">

            <!-- FRONT -->
            <div
              v-if="!isFlipped"
              class="card bg-light p-4 shadow-sm quiz-card-front"
            >
              <h3>{{ currentQuestion.text }}</h3>
              <div class="list-group mt-3 text-start">
                <button
                  v-for="(option, index) in currentQuestion.options"
                  :key="index"
                  @click="selectAnswer(index)"
                  class="list-group-item list-group-item-action"
                  :class="{ active: selectedAnswer === index }"
                >
                  {{ option }}
                </button>
              </div>
            </div>

            <!-- BACK -->
            <div
              v-else
              class="card p-4 shadow-sm text-center"
              :class="isCorrect ? 'bg-success text-white' : 'bg-danger text-white'"
            >
              <h2>{{ isCorrect ? "CORRECT!" : "WRONG!" }}</h2>
              <p class="mt-3">
                The answer was:
                <strong>{{ currentQuestion.options[currentQuestion.answer] }}</strong>
              </p>
              <button v-if="false" class="btn btn-light mt-3" @click="viewLeaderboard">
                View Leaderboard
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

// State
const currentQuestionIndex = ref(parseInt(route.query.index) || 0); 
const selectedAnswer = ref(null);
const isFlipped = ref(false);
const timeLeft = ref(10);
let timerInterval = null;
let transitionTimeout = null;

const questions = [
  {
    text: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    answer: 2,
  },
  {
    text: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    answer: 1,
  },
];

// Computed
const currentQuestion = computed(() => questions[currentQuestionIndex.value]);

const isCorrect = computed(() => {
  return currentQuestion.value && selectedAnswer.value === currentQuestion.value.answer;
});

// Logic
const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
  
  timeLeft.value = 10;
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      revealAnswer();
    }
  }, 1000);
};

const selectAnswer = (index) => {
  if (!isFlipped.value) {
    selectedAnswer.value = index;
  }
};

const revealAnswer = () => {
  clearInterval(timerInterval);
  isFlipped.value = true;
  
  transitionTimeout = setTimeout(() => {
    viewLeaderboard();
  }, 3000);
};

const viewLeaderboard = () => {
  const isFinal = currentQuestionIndex.value >= questions.length - 1;
  const nextIndex = currentQuestionIndex.value + 1;
  router.push({ 
    path: '/leaderboard', 
    query: { isFinal: isFinal, nextIndex: nextIndex } 
  });
};

onMounted(() => startTimer());
onUnmounted(() => {
  clearInterval(timerInterval);
  if (transitionTimeout) clearTimeout(transitionTimeout);
});
</script>

<style>
.quiz-card-wrapper {
  height: 400px;
}

.quiz-card-inner {
  height: 100%;
}

.quiz-card-inner > div {
  transition: opacity 0.3s ease;
}
</style>
