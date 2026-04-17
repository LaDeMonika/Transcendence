import { client } from './client.js'

export const getRandomQuestion = async () => {
  const res = await client.get('/random-question')
  return res.data
}

export const getNextQuestion = async (quizId, questionId) => {
  const res = await client.get(`/${quizId}/${questionId}/next-question`)
  return res.data
}

export const submitAnswer = async (answerData) => {
  const res = await client.post('/submit-answer', answerData)
  return res.data
}
