<template>
  <div class="container-xl py-4">
    <!-- Hero -->
    <div class="card mb-4">
      <div class="card-body">
        <h1 class="h2 mb-2">Public API Tester</h1>
        <p class="text-muted mb-1">
          This page sends requests directly to the backend and includes the
          <code>x-api-key</code> header automatically.
        </p>
        <p class="text-muted mb-0">
          There is a rate limit applied to the public API. If you test several endpoints quickly,
          expect a <code>429 Rate limit exceeded</code> response.
        </p>
      </div>
    </div>

    <!-- Connection Panel -->
    <div class="card mb-4">
      <div class="card-body">
        <h2 class="h5 mb-3">Connection</h2>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label text-muted">Base URL</label>
            <input v-model="baseUrl" type="text" class="form-control" />
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted">API Key</label>
            <input v-model="apiKey" type="text" class="form-control" />
          </div>
        </div>
      </div>
    </div>

    <!-- Endpoints Grid -->
    <div class="row g-3 mb-4">
      <div class="col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <span class="badge bg-success align-self-start mb-2">GET</span>
            <h3 class="h6">List Quizzes</h3>
            <p class="text-muted small flex-grow-1">
              Returns quiz IDs and titles. Good first endpoint to confirm the API key works.
            </p>
            <button class="btn btn-dark mt-auto" @click="sendRequest('listQuizzes')">
              Send Request
            </button>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <span class="badge bg-success align-self-start mb-2">GET</span>
            <h3 class="h6">Show Quiz</h3>
            <p class="text-muted small">
              Returns one quiz and its questions, but leaves out the correct answers.
            </p>
            <div class="mb-3">
              <label class="form-label text-muted">Quiz ID</label>
              <input v-model.number="quizId" type="number" min="1" class="form-control" />
            </div>
            <button class="btn btn-dark mt-auto" @click="sendRequest('showQuiz')">
              Send Request
            </button>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <span class="badge bg-success align-self-start mb-2">GET</span>
            <h3 class="h6">Show User</h3>
            <p class="text-muted small">
              Returns a public user profile with <code>id</code>, <code>userName</code>, and
              <code>avatarUrl</code>.
            </p>
            <div class="mb-3">
              <label class="form-label text-muted">User ID</label>
              <input v-model.number="userId" type="number" min="1" class="form-control" />
            </div>
            <button class="btn btn-dark mt-auto" @click="sendRequest('showUser')">
              Send Request
            </button>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <span class="badge bg-warning text-dark align-self-start mb-2">POST</span>
            <h3 class="h6">Create Quiz Session</h3>
            <p class="text-muted small">
              Creates a quiz session. Required body fields are <code>quizId</code> and
              <code>hostId</code>.
            </p>
            <div class="mb-3">
              <label class="form-label text-muted">JSON Body</label>
              <textarea
                v-model="createSessionBody"
                class="form-control font-monospace"
                rows="4"
              ></textarea>
            </div>
            <button class="btn btn-dark mt-auto" @click="sendRequest('createSession')">
              Send Request
            </button>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <span class="badge bg-warning text-dark align-self-start mb-2">PUT</span>
            <h3 class="h6">Update User</h3>
            <p class="text-muted small">
              Changes a username. The name must be unique or the API returns a <code>400</code>.
            </p>
            <div class="mb-3">
              <label class="form-label text-muted">User ID</label>
              <input v-model.number="updateUserId" type="number" min="1" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label text-muted">JSON Body</label>
              <textarea
                v-model="updateUserBody"
                class="form-control font-monospace"
                rows="3"
              ></textarea>
            </div>
            <button class="btn btn-dark mt-auto" @click="sendRequest('updateUser')">
              Send Request
            </button>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <span class="badge bg-danger align-self-start mb-2">DELETE</span>
            <h3 class="h6">Delete Quiz Session</h3>
            <p class="text-muted small flex-grow-1">Deletes an existing quiz session by ID.</p>
            <div class="mb-3">
              <label class="form-label text-muted">Session ID</label>
              <input
                v-model.number="deleteSessionId"
                type="number"
                min="1"
                class="form-control"
              />
            </div>
            <button class="btn btn-dark mt-auto" @click="sendRequest('deleteSession')">
              Send Request
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Response Panel -->
    <div class="card">
      <div class="card-body">
        <h2 class="h5 mb-3">Response</h2>
        <div class="d-flex flex-wrap gap-2 mb-3">
          <span class="badge" :class="responseStatusClass">{{ responseStatus }}</span>
          <span class="badge bg-secondary">{{ responseUrl }}</span>
        </div>
        <pre class="bg-dark text-light rounded p-3 mb-0 response-pre">{{ responseBody }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const baseUrl = ref(import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:3333')
const apiKey = ref('transc-public-demo-key-2026')

const quizId = ref(1)
const userId = ref(1)
const createSessionBody = ref('{\n  "quizId": 1,\n  "hostId": 1,\n  "conversationId": null\n}')
const updateUserId = ref(1)
const updateUserBody = ref('{\n  "userName": "NewName"\n}')
const deleteSessionId = ref(1)

const responseStatus = ref('No request yet')
const responseUrl = ref('-')
const responseBody = ref('Use one of the endpoint cards above to send a request.')
const responseOk = ref(null)

const responseStatusClass = computed(() => {
  if (responseOk.value === null) return 'bg-secondary'
  return responseOk.value ? 'bg-success' : 'bg-danger'
})

function buildRequestConfig(endpoint) {
  const base = baseUrl.value.trim().replace(/\/$/, '')
  switch (endpoint) {
    case 'listQuizzes':
      return { method: 'GET', url: `${base}/api/public/quizzes` }
    case 'showQuiz':
      return { method: 'GET', url: `${base}/api/public/quiz/${quizId.value || 1}` }
    case 'showUser':
      return { method: 'GET', url: `${base}/api/public/users/${userId.value || 1}` }
    case 'createSession':
      return {
        method: 'POST',
        url: `${base}/api/public/quiz-sessions`,
        headers: { 'Content-Type': 'application/json' },
        body: createSessionBody.value,
      }
    case 'updateUser':
      return {
        method: 'PUT',
        url: `${base}/api/public/users/${updateUserId.value || 1}`,
        headers: { 'Content-Type': 'application/json' },
        body: updateUserBody.value,
      }
    case 'deleteSession':
      return {
        method: 'DELETE',
        url: `${base}/api/public/quiz-sessions/${deleteSessionId.value || 1}`,
      }
  }
}

async function sendRequest(endpoint) {
  if (!baseUrl.value.trim()) {
    responseOk.value = false
    responseStatus.value = 'Missing base URL'
    responseUrl.value = '-'
    responseBody.value = 'Enter a backend base URL first.'
    return
  }
  if (!apiKey.value.trim()) {
    responseOk.value = false
    responseStatus.value = 'Missing API key'
    responseUrl.value = '-'
    responseBody.value = 'Enter an API key first.'
    return
  }

  const config = buildRequestConfig(endpoint)
  responseOk.value = true
  responseStatus.value = 'Sending…'
  responseUrl.value = config.url
  responseBody.value = ''

  try {
    const response = await fetch(config.url, {
      method: config.method,
      headers: { 'x-api-key': apiKey.value.trim(), ...config.headers },
      body: config.body,
    })
    const text = await response.text()
    let parsed
    try {
      parsed = text ? JSON.stringify(JSON.parse(text), null, 2) : '(empty body)'
    } catch {
      parsed = text || '(empty body)'
    }
    responseOk.value = response.ok
    responseStatus.value = `${response.status} ${response.statusText}`
    responseUrl.value = config.url
    responseBody.value = parsed
  } catch (error) {
    responseOk.value = false
    responseStatus.value = 'Network error'
    responseUrl.value = config.url
    responseBody.value = String(error)
  }
}
</script>

<style scoped>
.response-pre {
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 80px;
  overflow: auto;
}
</style>
