import { client } from './client.js'

export const listQuizzes = async () => {
  const res = await client.get('/quizzes')
  return res.data
}

export const getQuiz = async (id) => {
  const res = await client.get(`/quiz/${id}`)
  return res.data
}

export const getQuizAdmin = async (id) => {
  const res = await client.get(`/admin/quiz/${id}`)
  return res.data
}

export const importCsv = async (file) => {
  const formData = new FormData()
  formData.append('csv', file)

  const res = await client.post('/quizzes/import-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data
}

export const importJson = async (file) => {
  const formData = new FormData()
  formData.append('json', file)
  const res = await client.post('/quizzes/import-json', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export const exportQuizJson = async (id) => {
  const res = await client.get(`/admin/quiz/${id}/export`, { params: { format: 'json' } })
  return res.data
}

export const exportQuizCsv = async (id) => {
  const res = await client.get(`/admin/quiz/${id}/export`, {
    params: { format: 'csv' },
    responseType: 'blob',
  })
  return res.data
}
