import axios from 'axios'

export const client = axios.create({
  baseURL: 'http://localhost:3333',
})

export function setAuthToken(token) {
  try {
    if (token) {
      client.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('token', token)
    } else {
      delete client.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
    }
  } catch (e) {
    console.error(e)
  }
}

// Initialize client with stored token if available
try {
  const stored = localStorage.getItem('token')
  if (stored) setAuthToken(stored)
} catch (e) {
  console.error(e)
}

let unauthorizedHandler = null
export function setUnauthorizedHandler(cb) { unauthorizedHandler = cb }

client.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      if (error && error.response && error.response.status === 401) {
        setAuthToken(null)
        unauthorizedHandler()
      }
    } catch (e) {
      console.error(e)
    }
    return Promise.reject(error)
  }
)
