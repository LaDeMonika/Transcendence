import axios from 'axios'
import { logRecoverable } from './logger.js'

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
  } catch (e) {
    logRecoverable('Failed to persist auth token', e)
  }
}

// Initialize client with stored token if available
try {
  const stored = localStorage.getItem('token')
  if (stored) setAuthToken(stored)
} catch (e) {
  logRecoverable('Failed to restore stored auth token', e)
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
      logRecoverable('Unauthorized handler failed', e)
    }
    return Promise.reject(error)
  }
)
