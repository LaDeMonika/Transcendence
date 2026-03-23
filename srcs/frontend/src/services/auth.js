import { client } from './client.js'

export const signin = async (email, password) => {
  const res = await client.post('/login', { email, password })
  return { value: res.data }
}

export const register = async (email, password, userName) => {
  const res = await client.post('/register', { email, password, userName })
  return { value: res.data }
}
