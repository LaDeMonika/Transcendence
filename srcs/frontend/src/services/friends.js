import { client } from './client.js'

export const getFriends = async () => {
  const res = await client.get('/friends/')
  return res.data
}

export const getFriendsPivot = async () => {
  const res = await client.get('/friends/pivot')
  return res.data
}

export const addFriend = async (friendId) => {
  const res = await client.get(`/friends/add/${friendId}`)
  return res.data
}

export const acceptFriend = async (friendId) => {
  const res = await client.get(`/friends/accept/${friendId}`)
  return res.data
}

export const removeFriend = async (friendId) => {
  const res = await client.delete(`/friends/${friendId}`)
  return res.data
}
