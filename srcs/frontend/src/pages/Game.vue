<template>
  <div class="game-page">
    <!-- Header Status -->
    <div class="game-header">
      <div class="header-main">
        <div class="status-badge" :class="{ 'status-badge--reveal': sessionState === 'reveal' }">
          {{ sessionState === 'finished' ? '🏁 Quiz Complete' : currentQuestion ? '❓ Question' : '⏳ Waiting...' }}
        </div>
        
        <div v-if="sessionState === 'question'" class="timer-display" :class="{ 'timer-display--urgent': timeLeft <= 5 }">
          <span class="timer-icon">⏱️</span>
          <span class="timer-value">{{ timeLeft }}s</span>
        </div>
      </div>
      
      <div class="header-meta">
        <span class="role-badge" :class="quizRole === 'spectator' ? 'role-badge--spectator' : 'role-badge--player'">
          {{ quizRole === 'spectator' ? '👁️ Spectator Mode' : '🎮 Player Mode' }}
        </span>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="game-content">
      <div v-if="sessionState === 'connecting'" class="loader-view">
        <div class="spinner-game"></div>
        <h3>Connecting to quiz...</h3>
      </div>

      <div v-else-if="sessionState === 'lobby'" class="loader-view">
        <div class="spinner-game"></div>
        <h3>Waiting for host to start...</h3>
      </div>

      <div v-else-if="isLoadingNextQuestion" class="loader-view">
        <div class="spinner-game spinner-game--next"></div>
        <h3>Loading next question...</h3>
      </div>

      <!-- Reveal State -->
      <div v-else-if="sessionState === 'reveal' && currentQuestion" class="reveal-view">
        <div class="reveal-card" :class="isCorrect ? 'reveal-card--correct' : 'reveal-card--wrong'">
          <div class="card-glow"></div>
          <div class="reveal-icon">{{ isCorrect ? '✅' : '❌' }}</div>
          <h2 class="reveal-headline">{{ revealHeadline }}</h2>
          <p class="reveal-sub">
            The correct answer was:<br />
            <span class="reveal-answer">{{ correctAnswerText }}</span>
          </p>
        </div>

        <div class="leaderboard-panel">
          <div class="panel-header">
            <h3>Leaderboard</h3>
          </div>
          <div class="panel-body">
            <div v-if="rankedStandings.length === 0" class="empty-standings">
              No standings available yet.
            </div>
            <div v-else class="leaderboard-list">
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

      <!-- Question State -->
      <div v-else class="question-view" :class="{ 'is-flipped': isFlipped }">
        <div v-if="currentQuestion" class="question-card">
          <div class="card-glow"></div>
          <h2 class="question-text">{{ currentQuestion.text }}</h2>
          
          <div class="options-grid">
            <button
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              @click="selectAnswer(index)"
              class="option-btn"
              :class="{ 
                'option-btn--selected': selectedAnswer === index,
                'option-btn--disabled': alreadyAnswered || quizRole === 'spectator'
              }"
              :disabled="alreadyAnswered || quizRole === 'spectator'"
            >
              <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
              <span class="option-text">{{ option }}</span>
            </button>
          </div>

          <div v-if="alreadyAnswered && quizRole === 'player'" class="status-footer">
            <span class="status-icon">🚀</span> Answer submitted! Wait for the reveal...
          </div>
          <div v-else-if="quizRole === 'spectator'" class="status-footer">
            <span class="status-icon">👁️</span> Spectating live...
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
import { showError } from '@/services/notifications.js'

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
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="#6366f1"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" fill="#ffffff">${initial}</text></svg>`;
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
    showError('Failed to load quiz session state.')
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
    showError('Failed to connect to quiz session.')
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
    showError('WebSocket error occurred.')
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
    showError('No session ID provided.')
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

<style scoped>
/* ─── Page Shell ─────────────────────────────────────────── */
.game-page {
  flex: 1;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #24243e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  font-family: 'Segoe UI', system-ui, sans-serif;
  overflow-x: hidden;
}

/* ─── Game Header ────────────────────────────────────────── */
.game-header {
  width: 100%;
  max-width: 1000px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.status-badge {
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 100px;
  padding: 0.4rem 1.2rem;
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
}

.status-badge--reveal {
  background: rgba(251, 191, 36, 0.2);
  border-color: #fbbf24;
  color: #fbbf24;
}

.timer-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(99, 102, 241, 0.15);
  border: 1.5px solid rgba(99, 102, 241, 0.3);
  border-radius: 100px;
  padding: 0.4rem 1.2rem;
  color: #818cf8;
  font-weight: 800;
  transition: all 0.3s ease;
}

.timer-display--urgent {
  background: rgba(244, 63, 94, 0.2);
  border-color: #f43f5e;
  color: #f43f5e;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.role-badge {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.3rem 0.9rem;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-badge--player {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.role-badge--spectator {
  background: rgba(6, 182, 212, 0.15);
  color: #22d3ee;
  border: 1px solid rgba(6, 182, 212, 0.3);
}

/* ─── Content Area ───────────────────────────────────────── */
.game-content {
  flex: 1;
  width: 100%;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.loader-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  color: #fff;
}

.spinner-game {
  width: 4rem;
  height: 4rem;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ─── Question Card ──────────────────────────────────────── */
.question-view {
  width: 100%;
  max-width: 800px;
  perspective: 1000px;
}

.question-card {
  position: relative;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.2), transparent 70%);
  pointer-events: none;
}

.question-text {
  font-size: clamp(1.5rem, 4vw, 2.2rem);
  font-weight: 800;
  color: #fff;
  text-align: center;
  margin: 0;
  line-height: 1.3;
  z-index: 1;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  z-index: 1;
}

@media (min-width: 768px) {
  .options-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-btn:hover:not(.option-btn--disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.option-btn--selected {
  background: rgba(99, 102, 241, 0.25) !important;
  border-color: #6366f1 !important;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.3) !important;
}

.option-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.option-btn--selected .option-letter {
  background: #6366f1;
  color: #fff;
}

.status-footer {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  font-size: 0.95rem;
}

/* ─── Reveal View ────────────────────────────────────────── */
.reveal-view {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  align-items: stretch;
}

.reveal-card {
  position: relative;
  flex: 1 1 400px;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1.5rem;
  overflow: hidden;
}

.reveal-card--correct {
  border-color: #22c55e;
  box-shadow: 0 20px 50px rgba(34, 197, 94, 0.2);
}

.reveal-card--correct .card-glow {
  background: radial-gradient(circle at 50% 0%, rgba(34, 197, 94, 0.3), transparent 70%);
}

.reveal-card--wrong {
  border-color: #f43f5e;
  box-shadow: 0 20px 50px rgba(244, 63, 94, 0.2);
}

.reveal-card--wrong .card-glow {
  background: radial-gradient(circle at 50% 0%, rgba(244, 63, 94, 0.3), transparent 70%);
}

.reveal-icon {
  font-size: 4rem;
  line-height: 1;
}

.reveal-headline {
  font-size: 3rem;
  font-weight: 900;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.reveal-card--correct .reveal-headline { color: #4ade80; }
.reveal-card--wrong .reveal-headline { color: #fb7185; }

.reveal-sub {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.2rem;
  margin: 0;
}

.reveal-answer {
  display: block;
  margin-top: 0.5rem;
  color: #fff;
  font-weight: 800;
  font-size: 1.5rem;
}

.leaderboard-panel {
  flex: 1 1 400px;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.06);
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.panel-header h3 {
  color: #fff;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.panel-body {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  max-height: 400px;
}

.empty-standings {
  padding: 3rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}
</style>
