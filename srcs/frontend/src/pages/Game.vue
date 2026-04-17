<template>
  <div class="container d-flex flex-column py-4" style="min-height: 100%">
    <div class="row align-items-center justify-content-center border">
      <div class="col-sm justify-content-center">

        <div class="row align-items-center justify-content-center border">
          <h4 class="m-0">
            {{ sessionState === 'finished' ? 'Quiz Complete' : currentQuestion ? 'Question' : 'Waiting...' }}
          </h4>
        </div>

        <div class="row align-items-center justify-content-center border">
          <span :class="{ 'text-danger': timeLeft <= 5 }">
            {{ sessionState === 'question' ? `Time Remaining: ${timeLeft}s` : '' }}
          </span>
        </div>

      </div>
    </div>


    <div class="row align-items-center justify-content-center border flex-grow-1">
      <div class="col-sm-10 col-md-8 col-lg-6">
        <div v-if="sessionState === 'connecting'" class="text-center py-5">
          <h3>Connecting to quiz...</h3>
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="sessionState === 'lobby'" class="text-center py-5">
          <h3>Waiting for quiz to start...</h3>
        </div>

        <div v-else-if="isLoadingNextQuestion" class="text-center py-5">
          <h3>Loading next question...</h3>
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else class="quiz-card-wrapper" :class="{ 'is-flipped': isFlipped }">
          <div class="quiz-card-inner">

            <!-- FRONT -->
            <div
              v-if="!isFlipped && currentQuestion"
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
                  :disabled="alreadyAnswered"
                >
                  {{ option }}
                </button>
              </div>
              <div v-if="alreadyAnswered" class="mt-3 text-muted">
                Answer submitted!
              </div>
            </div>

            <!-- BACK -->
            <div
              v-if="isFlipped && currentQuestion"
              class="card p-4 shadow-sm text-center"
              :class="isCorrect ? 'bg-success text-white' : 'bg-danger text-white'"
            >
              <h2>{{ isCorrect ? "CORRECT!" : "WRONG!" }}</h2>
              <p class="mt-3">
                The correct answer was:
                <strong>{{ correctAnswerText }}</strong>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { connect, disconnect, onWs } from '@/services/wsConnection.js'
import { submitAnswer, joinQuizSession, leaveQuizSession } from '@/services/quizSocket.js'
import { getNextQuestion } from '@/services/questionsService.js'
import { getQuizSessionState } from '@/services/quizSessionService.js'

const router = useRouter();
const route = useRoute();

const sessionId = route.params.sessionId

// State
const currentQuestion = ref(null);
const selectedAnswer = ref(null);
const isFlipped = ref(false);
const timeLeft = ref(0);
const sessionState = ref('connecting');
const standings = ref([]);
const alreadyAnswered = ref(false);
const correctAnswer = ref(null);
const isLoadingNextQuestion = ref(false);
let timerInterval = null;
let transitionTimeout = null;
let questionEndTime = null;
let wsUnsubscribers = [];

const normalizeQuestion = (question) => {
  if (!question) return null;

  return {
    id: question.id,
    quizId: question.quizId,
    text: question.text ?? question.question,
    options: question.options ?? [
      question.answerA,
      question.answerB,
      question.answerC,
      question.answerD,
    ],
  };
};

// Computed
const isCorrect = computed(() => {
  if (selectedAnswer.value === null || !correctAnswer.value || !currentQuestion.value) return false;
  const selectedLetter = String.fromCharCode(65 + selectedAnswer.value); // Convert index to letter
  return selectedLetter === correctAnswer.value;
});

const correctAnswerText = computed(() => {
  if (!correctAnswer.value || !currentQuestion.value) return '';
  const answerIndex = correctAnswer.value.charCodeAt(0) - 65; // Convert letter to index
  return currentQuestion.value.options[answerIndex];
});

const getTimeRemaining = () => {
  if (!questionEndTime) return 0;
  return Math.max(0, Math.ceil((questionEndTime - Date.now()) / 1000));
};

// Methods
const connectWebSocket = () => {
  try {
    connect();
    console.log('WebSocket connecting, joining session:', sessionId);

    // Give connection a moment to establish
    setTimeout(() => {
      joinQuizSession(sessionId);
      setupWebSocketListeners();
    }, 100);

  } catch (error) {
    console.error('Failed to connect WebSocket:', error);
    sessionState.value = 'error';
  }
};

const setupWebSocketListeners = () => {
  cleanupWebSocketListeners();

  wsUnsubscribers.push(onWs('quiz:state', (data) => {
    console.log('Quiz state:', data);
    updateQuizState(data);
  }));

  wsUnsubscribers.push(onWs('quiz:started', (data) => {
    console.log('Quiz started:', data);
    sessionState.value = 'started';
  }));

  wsUnsubscribers.push(onWs('quiz:question:start', (data) => {
    console.log('Question started:', data);
    handleQuestionStart(data);
  }));

  wsUnsubscribers.push(onWs('quiz:question:closed', (data) => {
    console.log('Question closed:', data);
    handleQuestionClosed(data);
  }));

  wsUnsubscribers.push(onWs('quiz:question:reveal', (data) => {
    console.log('Question reveal:', data);
    handleQuestionReveal(data);
  }));

  wsUnsubscribers.push(onWs('quiz:leaderboard', (data) => {
    console.log('Leaderboard:', data);
    standings.value = data.standings;
  }));

  wsUnsubscribers.push(onWs('quiz:finished', (data) => {
    console.log('Quiz finished:', data);
    handleQuizFinished(data);
  }));

  wsUnsubscribers.push(onWs('quiz:answer:ack', (data) => {
    console.log('Answer ack:', data);
    if (data.alreadyAnswered) {
      alreadyAnswered.value = true;
    }
  }));

  wsUnsubscribers.push(onWs('error', (data) => {
    console.error('WebSocket error:', data.error);
  }));
};

const cleanupWebSocketListeners = () => {
  wsUnsubscribers.forEach((unsubscribe) => unsubscribe());
  wsUnsubscribers = [];
};

const updateQuizState = (data) => {
  sessionState.value = data.state;
  currentQuestion.value = normalizeQuestion(data.question);
  alreadyAnswered.value = data.alreadyAnswered ?? false;
  isLoadingNextQuestion.value = false;

  if (data.state === 'question' && data.questionEndsAt) {
    questionEndTime = new Date(data.questionEndsAt).getTime();
    startTimer();
  } else {
    clearInterval(timerInterval);
    questionEndTime = null;
    timeLeft.value = 0;
  }

  if (data.standings) {
    standings.value = data.standings;
  }
};

const handleQuestionStart = (data) => {
  sessionState.value = 'question';
  currentQuestion.value = normalizeQuestion(data.question);
  selectedAnswer.value = null;
  isFlipped.value = false;
  alreadyAnswered.value = false;
  isLoadingNextQuestion.value = false;
  questionEndTime = new Date(data.endsAt).getTime();
  startTimer();
};

const loadNextQuestionViaApi = async () => {
  if (!currentQuestion.value?.quizId || !currentQuestion.value?.id) {
    return false;
  }

  try {
    const nextQuestion = await getNextQuestion(currentQuestion.value.quizId, currentQuestion.value.id);
    if (!nextQuestion) {
      return false;
    }

    currentQuestion.value = normalizeQuestion(nextQuestion);
    selectedAnswer.value = null;
    alreadyAnswered.value = false;
    return true;
  } catch (error) {
    console.error('Failed to load next question via API:', error);
    return false;
  }
};

const handleQuestionClosed = (data) => {
  clearInterval(timerInterval);
  timeLeft.value = 0;
};

const handleQuestionReveal = (data) => {
  isFlipped.value = true;
  correctAnswer.value = data.correctAnswer;
  standings.value = data.standings;

  // Auto-advance after reveal period
  const revealEndTime = new Date(data.revealEndsAt).getTime();
  const delay = revealEndTime - Date.now();
  transitionTimeout = setTimeout(async () => {
    isFlipped.value = false;
    correctAnswer.value = null;
    isLoadingNextQuestion.value = true;

    const loaded = await loadNextQuestionViaApi();
    if (!loaded) {
      currentQuestion.value = null;
    }

    isLoadingNextQuestion.value = false;
  }, Math.max(0, delay));
};

const handleQuizFinished = (data) => {
  standings.value = data.standings;
  router.push({
    path: '/leaderboard',
    query: { sessionId: sessionId, isFinal: true }
  });
};

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);

  const tick = () => {
    timeLeft.value = getTimeRemaining();
    if (timeLeft.value <= 0) {
      clearInterval(timerInterval);
    }
  };

  tick();
  timerInterval = setInterval(tick, 100);
};

const selectAnswer = (index) => {
  if (isFlipped.value || alreadyAnswered.value || !currentQuestion.value) return;

  selectedAnswer.value = index;

  const answerLetter = String.fromCharCode(65 + index); // A, B, C, D
  submitAnswer(sessionId, currentQuestion.value.id, answerLetter);
  alreadyAnswered.value = true;
};

const leaveSession = () => {
  leaveQuizSession(sessionId);
};

onMounted(async () => {
  if (!sessionId) {
    console.error('No session ID provided');
    router.push('/choose-quiz');
    return;
  }

  try {
    const state = await getQuizSessionState(sessionId);
    if (state.state === 'finished') {
      router.push({ path: '/leaderboard', query: { sessionId, isFinal: true } });
      return;
    }
    updateQuizState(state);
  } catch (error) {
    console.error('Failed to load initial session state:', error);
  }

  connectWebSocket();
});

onBeforeUnmount(() => {
  cleanupWebSocketListeners();
  leaveSession();
  disconnect();
});

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
