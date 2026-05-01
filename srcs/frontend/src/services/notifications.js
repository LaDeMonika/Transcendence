import { reactive } from 'vue'

const notifications = reactive([])

let toastInstance = null

export function setToastInstance(instance) {
  toastInstance = instance
}

export function showError(message, title = 'Error') {
  if (toastInstance) {
    toastInstance.show({
      title,
      body: message,
      variant: 'danger',
      autoHideDelay: 5000,
    })
  } else {
    console.error('Toast instance not set:', message)
  }
}

export function showSuccess(message, title = 'Success') {
  if (toastInstance) {
    toastInstance.show({
      title,
      body: message,
      variant: 'success',
      autoHideDelay: 3000,
    })
  } else {
    console.log('Toast instance not set:', message)
  }
}

export function showInfo(message, title = 'Info') {
  if (toastInstance) {
    toastInstance.show({
      title,
      body: message,
      variant: 'info',
      autoHideDelay: 4000,
    })
  } else {
    console.log('Toast instance not set:', message)
  }
}