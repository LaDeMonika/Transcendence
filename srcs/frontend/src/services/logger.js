const isDev = import.meta.env.DEV

function getErrorDetails(error) {
  if (!error) return 'Unknown error'
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return error
}

export function logRecoverable(context, error, details) {
  if (!isDev) return

  if (details !== undefined) {
    console.warn(`[${context}]`, getErrorDetails(error), details)
    return
  }

  console.warn(`[${context}]`, getErrorDetails(error))
}

