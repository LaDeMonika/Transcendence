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

        <div class="row align-items-center justify-content-center border">
          <span class="text-muted">
            {{ quizRole === 'spectator' ? 'Spectator Mode: read-only live view' : 'Player Mode' }}
          </span>
        </div>

      </div>
    </div>


    <div class="row align-items-center justify-content-center border flex-grow-1">
      <div :class="contentColumnClass">
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

        <div v-else-if="sessionState === 'reveal' && currentQuestion" class="row g-4 align-items-stretch">
          <div class="col-lg-6">
            <div
              class="card p-4 shadow-sm text-center h-100"
              :class="revealCardClass"
            >
              <h2>{{ revealHeadline }}</h2>
              <p class="mt-3 mb-0">
                The correct answer was:
                <strong>{{ correctAnswerText }}</strong>
              </p>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-dark text-white">
                <h5 class="mb-0">Current Leaderboard</h5>
              </div>
              <div class="card-body p-0">
                <div v-if="rankedStandings.length === 0" class="p-4 text-center text-muted">
                  No standings available yet.
                </div>
                <div v-else>
                  <LeaderboardRow
                    v-for="(player, index) in rankedStandings"
                    :key="player.id"
                    :player="player"
                    :rank="index + 1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="quiz-card-wrapper" :class="{ 'is-flipped': isFlipped }">
          <div class="quiz-card-inner">

            <div
              v-if="currentQuestion"
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
                  :disabled="alreadyAnswered || quizRole === 'spectator'"
                >
                  {{ option }}
                </button>
              </div>
              <div v-if="alreadyAnswered && quizRole === 'player'" class="mt-3 text-muted">
                Answer submitted!
              </div>
              <div v-else-if="quizRole === 'spectator'" class="mt-3 text-muted">
                Spectators receive live updates but cannot submit answers.
              </div>
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
import LeaderboardRow from '@/components/LeaderboardRow.vue'
import { connect, disconnect, onWs, getIsConnected } from '@/services/wsConnection.js'
import { submitAnswer, joinQuizSession, spectateQuizSession, leaveQuizSession } from '@/services/quizSocket.js'
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
const quizRole = ref(null); // Will be determined from server
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

const revealHeadline = computed(() => {
  if (quizRole.value === 'spectator') return 'ANSWER REVEALED'
  return isCorrect.value ? 'CORRECT!' : 'WRONG!'
})

const revealCardClass = computed(() => {
  if (quizRole.value === 'spectator') return 'bg-dark text-white'
  return isCorrect.value ? 'bg-success text-white' : 'bg-danger text-white'
})

const correctAnswerText = computed(() => {
  if (!correctAnswer.value || !currentQuestion.value) return '';
  const answerIndex = correctAnswer.value.charCodeAt(0) - 65; // Convert letter to index
  return currentQuestion.value.options[answerIndex];
});

const buildAvatar = (username) => {
  const initial = String(username ?? '?').trim().charAt(0).toUpperCase() || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="#0d6efd"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" fill="#ffffff">${initial}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const rankedStandings = computed(() => {
  return standings.value.map((player) => ({
    id: player.userId,
    name: player.username,
    score: player.score,
    avatar: buildAvatar(player.username),
  }));
});

const contentColumnClass = computed(() => (
  sessionState.value === 'reveal'
    ? 'col-12 col-xl-10'
    : 'col-sm-10 col-md-8 col-lg-6'
));

const getTimeRemaining = () => {
  if (!questionEndTime) return 0;
  return Math.max(0, Math.ceil((questionEndTime - Date.now()) / 1000));
};

// Methods
const refreshQuizState = async () => {
  try {
    const state = await getQuizSessionState(sessionId);
    if (state.state === 'finished') {
      router.push({ path: '/leaderboard', query: { sessionId, isFinal: true } });
      return;
    }
    updateQuizState(state);
  } catch (error) {
    console.error('Failed to load session state:', error);
  }
};

const connectWebSocket = () => {
  try {
    setupWebSocketListeners();
    connect();
    console.log('WebSocket connecting for session:', sessionId);

    if (getIsConnected() && quizRole.value) {
      if (quizRole.value === 'spectator') {
        spectateQuizSession(sessionId);
      } else {
        joinQuizSession(sessionId);
      }
    }
  } catch (error) {
    console.error('Failed to connect WebSocket:', error);
    sessionState.value = 'error';
  }
};

const setupWebSocketListeners = () => {
  cleanupWebSocketListeners();

  wsUnsubscribers.push(onWs('ws:connected', () => {
    console.log('WebSocket connected, joining session:', sessionId);
    if (quizRole.value === 'spectator') {
      spectateQuizSession(sessionId);
      return
    }
    if (quizRole.value === 'player') {
      joinQuizSession(sessionId);
    }
  }));

  wsUnsubscribers.push(onWs('quiz:join:ok', (data) => {
    if (Number(data.sessionId) !== Number(sessionId)) return;
    quizRole.value = 'player'
    void refreshQuizState();
  }));

  wsUnsubscribers.push(onWs('quiz:spectate:ok', (data) => {
    if (Number(data.sessionId) !== Number(sessionId)) return;
    quizRole.value = 'spectator'
    void refreshQuizState();
  }));

  wsUnsubscribers.push(onWs('quiz:state', (data) => {
    if (Number(data.sessionId) !== Number(sessionId)) return;
    console.log('Quiz state:', data);
    updateQuizState(data);
  }));

  wsUnsubscribers.push(onWs('quiz:started', (data) => {
    if (Number(data.sessionId) !== Number(sessionId)) return;
    console.log('Quiz started:', data);
    sessionState.value = 'started';
  }));

  wsUnsubscribers.push(onWs('quiz:question:start', (data) => {
    if (Number(data.sessionId) !== Number(sessionId)) return;
    console.log('Question started:', data);
    handleQuestionStart(data);
  }));

  wsUnsubscribers.push(onWs('quiz:question:closed', (data) => {
    if (Number(data.sessionId) !== Number(sessionId)) return;
    console.log('Question closed:', data);
    handleQuestionClosed(data);
  }));

  wsUnsubscribers.push(onWs('quiz:question:reveal', (data) => {
    if (Number(data.sessionId) !== Number(sessionId)) return;
    console.log('Question reveal:', data);
    handleQuestionReveal(data);
  }));

  wsUnsubscribers.push(onWs('quiz:leaderboard', (data) => {
    if (Number(data.sessionId) !== Number(sessionId)) return;
    console.log('Leaderboard:', data);
    standings.value = data.standings;
  }));

  wsUnsubscribers.push(onWs('quiz:finished', (data) => {
    if (Number(data.sessionId) !== Number(sessionId)) return;
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
  if (transitionTimeout) {
    clearTimeout(transitionTimeout);
    transitionTimeout = null;
  }

  sessionState.value = data.state;
  if (data.role) {
    quizRole.value = data.role;
  }
  currentQuestion.value = normalizeQuestion(data.question);
  alreadyAnswered.value = quizRole.value === 'spectator' || (quizRole.value === 'player' && (data.alreadyAnswered ?? false));
  isLoadingNextQuestion.value = false;
  isFlipped.value = data.state === 'reveal';

  if (data.state !== 'reveal') {
    correctAnswer.value = null;
  }

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
  if (transitionTimeout) {
    clearTimeout(transitionTimeout);
    transitionTimeout = null;
  }

  sessionState.value = 'question';
  currentQuestion.value = normalizeQuestion(data.question);
  selectedAnswer.value = null;
  isFlipped.value = false;
  alreadyAnswered.value = quizRole.value === 'spectator' || (quizRole.value === 'player' && false); // Reset for new question
  isLoadingNextQuestion.value = false;
  questionEndTime = new Date(data.endsAt).getTime();
  startTimer();
};

const handleQuestionClosed = (data) => {
  clearInterval(timerInterval);
  timeLeft.value = 0;
  sessionState.value = 'reveal';
};

const handleQuestionReveal = (data) => {
  sessionState.value = 'reveal';
  if (data.question) {
    currentQuestion.value = normalizeQuestion(data.question);
  }
  isFlipped.value = true;
  correctAnswer.value = data.correctAnswer;
  standings.value = data.standings;

  // Auto-advance after reveal period
  const revealEndTime = new Date(data.revealEndsAt).getTime();
  const delay = revealEndTime - Date.now();
  transitionTimeout = setTimeout(() => {
    isFlipped.value = false;
    correctAnswer.value = null;
    isLoadingNextQuestion.value = true;
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
  if (quizRole.value === 'spectator' || isFlipped.value || alreadyAnswered.value || !currentQuestion.value) return;

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

  await refreshQuizState();

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
