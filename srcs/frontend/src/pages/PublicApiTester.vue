<template>
  <div class="api-tester-page">
    <div class="tester-container">
      
      <!-- Hero -->
      <div class="hero-header mb-5">
        <div class="hero-badge">🛠️ DEV TOOLS</div>
        <h1 class="hero-title">Public API Tester</h1>
        <p class="hero-subtitle text-muted">Send requests directly to the backend with automatic API key injection.</p>
        <div class="alert-info-game mt-3">
          <span class="icon">💡</span>
          <span>Rate limits are active. <strong>429 Rate limit exceeded</strong> may occur if requests are sent too rapidly.</span>
        </div>
      </div>

      <!-- Connection Panel -->
      <div class="glass-card mb-4">
        <div class="card-glow"></div>
        <h2 class="section-title">Connection Settings</h2>
        <div class="settings-grid">
          <div class="form-group">
            <label class="form-label">Base URL</label>
            <input v-model="baseUrl" type="text" class="game-input" placeholder="http://localhost:3333" />
          </div>
          <div class="form-group">
            <label class="form-label">API Key</label>
            <input v-model="apiKey" type="text" class="game-input" placeholder="your-api-key" />
          </div>
        </div>
      </div>

      <!-- Endpoints Grid -->
      <div class="endpoints-grid mb-5">
        <div class="endpoint-card">
          <div class="card-glow"></div>
          <span class="method-badge get">GET</span>
          <h3 class="endpoint-title">List Quizzes</h3>
          <p class="endpoint-desc">Returns quiz IDs and titles. Use this to verify connection.</p>
          <button class="btn-game btn-game--start w-100" @click="sendRequest('listQuizzes')">
            Send Request
          </button>
        </div>

        <div class="endpoint-card">
          <div class="card-glow"></div>
          <span class="method-badge get">GET</span>
          <h3 class="endpoint-title">Show Quiz</h3>
          <p class="endpoint-desc">Returns one quiz and its questions (without answers).</p>
          <div class="input-group mb-3">
            <label class="form-label small">Quiz ID</label>
            <input v-model.number="quizId" type="number" min="1" class="game-input" />
          </div>
          <button class="btn-game btn-game--start w-100" @click="sendRequest('showQuiz')">
            Send Request
          </button>
        </div>

        <div class="endpoint-card">
          <div class="card-glow"></div>
          <span class="method-badge get">GET</span>
          <h3 class="endpoint-title">Show User</h3>
          <p class="endpoint-desc">Returns a public user profile with basic details.</p>
          <div class="input-group mb-3">
            <label class="form-label small">User ID</label>
            <input v-model.number="userId" type="number" min="1" class="game-input" />
          </div>
          <button class="btn-game btn-game--start w-100" @click="sendRequest('showUser')">
            Send Request
          </button>
        </div>

        <div class="endpoint-card">
          <div class="card-glow"></div>
          <span class="method-badge post">POST</span>
          <h3 class="endpoint-title">Create Session</h3>
          <p class="endpoint-desc">Creates a quiz session. Requires quizId and hostId.</p>
          <div class="input-group mb-3">
            <label class="form-label small">JSON Body</label>
            <textarea v-model="createSessionBody" class="game-input game-textarea" rows="4"></textarea>
          </div>
          <button class="btn-game btn-game--post w-100" @click="sendRequest('createSession')">
            Send Request
          </button>
        </div>

        <div class="endpoint-card">
          <div class="card-glow"></div>
          <span class="method-badge put">PUT</span>
          <h3 class="endpoint-title">Update User</h3>
          <p class="endpoint-desc">Changes a username. Name must be unique.</p>
          <div class="input-group mb-3">
            <label class="form-label small">User ID</label>
            <input v-model.number="updateUserId" type="number" min="1" class="game-input" />
            <label class="form-label small mt-2">JSON Body</label>
            <textarea v-model="updateUserBody" class="game-input game-textarea" rows="3"></textarea>
          </div>
          <button class="btn-game btn-game--put w-100" @click="sendRequest('updateUser')">
            Send Request
          </button>
        </div>

        <div class="endpoint-card">
          <div class="card-glow"></div>
          <span class="method-badge delete">DELETE</span>
          <h3 class="endpoint-title">Delete Session</h3>
          <p class="endpoint-desc">Deletes an existing quiz session by ID.</p>
          <div class="input-group mb-3">
            <label class="form-label small">Session ID</label>
            <input v-model.number="deleteSessionId" type="number" min="1" class="game-input" />
          </div>
          <button class="btn-game btn-game--danger w-100" @click="sendRequest('deleteSession')">
            Send Request
          </button>
        </div>
      </div>

      <!-- Response Panel -->
      <div class="glass-card response-card">
        <div class="card-glow"></div>
        <div class="response-header d-flex justify-content-between align-items-center mb-4">
          <h2 class="section-title mb-0">Response</h2>
          <div class="response-meta">
            <span class="status-pill" :class="responseOk ? 'success' : 'error'">{{ responseStatus }}</span>
            <span class="url-pill">{{ responseUrl }}</span>
          </div>
        </div>
        <div class="code-editor">
          <div class="editor-header">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="filename">response.json</span>
          </div>
          <pre class="response-pre">{{ responseBody }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const baseUrl = ref(import.meta.env.VITE_BACKEND_URL)
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
      return { method: 'GET', url: `${base}/public/quizzes` }
    case 'showQuiz':
      return { method: 'GET', url: `${base}/public/quiz/${quizId.value || 1}` }
    case 'showUser':
      return { method: 'GET', url: `${base}/public/users/${userId.value || 1}` }
    case 'createSession':
      return {
        method: 'POST',
        url: `${base}/public/quiz-sessions`,
        headers: { 'Content-Type': 'application/json' },
        body: createSessionBody.value,
      }
    case 'updateUser':
      return {
        method: 'PUT',
        url: `${base}/public/users/${updateUserId.value || 1}`,
        headers: { 'Content-Type': 'application/json' },
        body: updateUserBody.value,
      }
    case 'deleteSession':
      return {
        method: 'DELETE',
        url: `${base}/public/quiz-sessions/${deleteSessionId.value || 1}`,
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
/* ─── Page Shell ─────────────────────────────────────────── */
.api-tester-page {
  flex: 1;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #24243e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1.5rem;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.tester-container {
  width: 100%;
  max-width: 1200px;
}

/* ─── Hero ────────────────────────────────────────────────── */
.hero-header {
  text-align: center;
}

.hero-badge {
  display: inline-block;
  background: linear-gradient(90deg, #94a3b8, #475569);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 0.4rem 1.2rem;
  border-radius: 100px;
  box-shadow: 0 0 20px rgba(148, 163, 184, 0.3);
  margin-bottom: 1rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 900;
  color: #fff;
  margin: 0;
}

.alert-info-game {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(14, 165, 233, 0.1);
  border: 1px solid rgba(14, 165, 233, 0.2);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  color: #7dd3fc;
  font-size: 0.9rem;
}

/* ─── Cards ───────────────────────────────────────────────── */
.glass-card {
  position: relative;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  overflow: hidden;
}

.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.05), transparent 70%);
  pointer-events: none;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .settings-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ─── Endpoints ────────────────────────────────────────────── */
.endpoints-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.endpoint-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
}

.method-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 900;
  width: fit-content;
}

.method-badge.get { background: #22c55e; color: #1a1a2e; }
.method-badge.post { background: #eab308; color: #1a1a2e; }
.method-badge.put { background: #8b5cf6; color: #fff; }
.method-badge.delete { background: #f43f5e; color: #fff; }

.endpoint-title {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.endpoint-desc {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  flex: 1;
}

/* ─── Form Elements ───────────────────────────────────────── */
.form-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  display: block;
}

.game-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  color: #fff !important;
  padding: 0.6rem 1rem !important;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
}

.game-textarea {
  resize: vertical;
}

/* ─── Response ────────────────────────────────────────────── */
.response-card {
  background: rgba(15, 12, 41, 0.6);
}

.response-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.status-pill {
  padding: 0.4rem 1rem;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 800;
}

.status-pill.success { background: #22c55e; color: #1a1a2e; }
.status-pill.error { background: #f43f5e; color: #fff; }

.url-pill {
  color: rgba(255, 255, 255, 0.4);
  font-family: monospace;
  font-size: 0.85rem;
}

.code-editor {
  background: #1e1e2e;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.editor-header {
  background: #313244;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot:nth-child(1) { background: #f38ba8; }
.dot:nth-child(2) { background: #f9e2af; }
.dot:nth-child(3) { background: #a6e3a1; }

.filename {
  margin-left: 0.5rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  font-family: monospace;
}

.response-pre {
  margin: 0;
  padding: 1.5rem;
  color: #cdd6f4;
  font-family: 'Fira Code', monospace;
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 500px;
  overflow-y: auto;
}

/* ─── Buttons ─────────────────────────────────────────────── */
.btn-game {
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 800;
  text-transform: uppercase;
  border: none;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-game:hover:not(:disabled) {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.btn-game--start { background: linear-gradient(90deg, #6366f1, #8b5cf6); color: #fff; }
.btn-game--post { background: #eab308; color: #1a1a2e; }
.btn-game--put { background: #8b5cf6; color: #fff; }
.btn-game--danger { background: #f43f5e; color: #fff; }
</style>
