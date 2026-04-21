import { client } from './client.js'

export const createQuizSession = async (quizId) => {
  const res = await client.post('/quiz-sessions', { quizId })
  return res.data
}

export const getQuizSession = async (id) => {
  const res = await client.get(`/quiz-sessions/${id}`)
  return res.data
}

export const joinQuizSession = async (id, playerData) => {
  const res = await client.post(`/quiz-sessions/${id}/join`, playerData)
  return res.data
}

export const startQuizSession = async (id) => {
  const res = await client.post(`/quiz-sessions/${id}/start`)
  return res.data
}

export const getQuizSessionState = async (id) => {
  const res = await client.get(`/quiz-sessions/${id}/state`)
  return res.data
}

export const getQuizSessionStandings = async (id) => {
  const res = await client.get(`/quiz-sessions/${id}/standings`)
  return res.data
}
