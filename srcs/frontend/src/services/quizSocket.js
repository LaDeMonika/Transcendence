import { sendWs } from './wsConnection.js'

export function joinQuizSession(sessionId) {
  sendWs({ type: 'quiz:join', sessionId })
}

export function spectateQuizSession(sessionId) {
  sendWs({ type: 'quiz:spectate', sessionId })
}

export function leaveQuizSession(sessionId) {
  sendWs({ type: 'quiz:leave', sessionId })
}

export function startQuiz(sessionId) {
  sendWs({ type: 'quiz:start', sessionId })
}

export function submitAnswer(sessionId, questionId, answer) {
  sendWs({ type: 'quiz:answerSubmit', sessionId, questionId, answer })
}
