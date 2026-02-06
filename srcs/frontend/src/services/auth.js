import { client } from './client.js'

export const signin = async (email, password) => {
  const res = await client.post('/login', { email, password })
  return { value: res.data }
}

export const register = async (email, password, firstName, lastName) => {
  const res = await client.post('/register', { email, password, firstName, lastName })
  return { value: res.data }
}
