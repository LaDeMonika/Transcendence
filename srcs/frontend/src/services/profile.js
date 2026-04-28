import { client } from './client.js'

export const fetchPrivateProfile = async () => {
  const res = await client.get('/profile')
  return res.data
}

export const fetchPublicProfile = async (userId) => {
  const res = await client.get(`/profile/${userId}`)
  return res.data
}

export const fetchMyQuizzes = async () => {
  const res = await client.get('/profile/myQuizs')
  return res.data
}

export const fetchOthersQuizzes = async (userId) => {
  const res = await client.get(`/profile/othersQuizs/${userId}`)
  return res.data
}

export const fetchStats = async (userId) => {
  const res = await client.get(`/profile/stats/${userId}`)
  return res.data
}

export const uploadAvatar = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await client.post('/profile/uploadAvatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data
}

export const deleteAvatar = async () => {
  const res = await client.delete('/profile/deleteAvatar')
  return res.data
}

export const changePassword = async (oldPassword, newPassword) => {
  const res = await client.post('/changePassword', { oldPassword, newPassword })
  return res.data
}

export const deleteAccount = async () => {
  const res = await client.delete('/user')
  return res.data
}
