import axios from 'axios'
import { showError } from './notifications.js'
import { setAuthTokenValue } from '@/services/authState.js'

const baseURL = import.meta.env.VITE_BACKEND_URL

export const client = axios.create({
  baseURL,
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

    setAuthTokenValue(token)
  } catch (e) {
    showError('Failed to manage authentication token.')
  }
}

// Initialize client with stored token if available
try {
  const stored = localStorage.getItem('token')
  if (stored) setAuthToken(stored)
} catch (e) {
  showError('Failed to initialize authentication.')
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
      showError('Authentication error occurred.')
    }
    return Promise.reject(error)
  }
)
