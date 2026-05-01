import { ref, computed } from 'vue'

export const authToken = ref(null)
export const isAuthenticated = computed(() => !!authToken.value)

export function setAuthTokenValue(token) {
  authToken.value = token
}

export function initAuthState() {
  try {
    authToken.value = localStorage.getItem('token')
  } catch (e) {
    authToken.value = null
  }
}
