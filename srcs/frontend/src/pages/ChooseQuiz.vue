<template>
  <div class="choose-quiz-page">

    <!-- Hero Header -->
    <div class="hero-header">
      <div class="hero-badge">🧠 SELECT QUIZ</div>
      <h1 class="hero-title">Choose Your Quiz</h1>
      <p class="hero-subtitle">Pick a quiz to start the session</p>
    </div>

    <!-- Quiz Scroll List -->
    <ScrollBoxSelectQuiz :items="quizzes" @update:selectedItems="updateSelectedItems" />

    <!-- Import / Export Actions -->
    <div class="action-bar">
      <button class="btn-action btn-action--secondary" @click="showImportModal = true">
        📥 Import Quiz
      </button>
      <button
        class="btn-action btn-action--outline"
        :disabled="selectedItems.length !== 1"
        @click="doExportJson"
      >
        📤 Export JSON
      </button>
      <button
        class="btn-action btn-action--outline"
        :disabled="selectedItems.length !== 1"
        @click="doExportCsv"
      >
        📊 Export CSV
      </button>
    </div>

    <!-- Import Modal -->
    <BModal
      v-model="showImportModal"
      title="Import Quiz"
      @hidden="onModalHidden"
      :hide-footer="false"
    >
      <div class="mb-3">
        <label class="form-label text-muted">Format</label>
        <select v-model="importFormat" class="form-select">
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
      </div>
      <div v-if="importFormat === 'csv'">
        <p class="text-muted mb-2">Select a <code>.csv</code> file to import as a new quiz.</p>
        <input type="file" ref="csvFile" accept=".csv" class="form-control" />
      </div>
      <div v-else>
        <p class="text-muted mb-2">Select a <code>.json</code> export file to import as a new quiz.</p>
        <input type="file" ref="jsonFile" accept=".json" class="form-control" />
      </div>
      <div v-if="importMessage" class="mt-3 alert mb-0" :class="importSuccess ? 'alert-success' : 'alert-danger'">
        {{ importMessage }}
      </div>
      <template #footer>
        <BButton variant="secondary" @click="showImportModal = false">Cancel</BButton>
        <BButton variant="primary" :disabled="isImporting" @click="doImport">
          <span v-if="isImporting">
            <span class="spinner-border spinner-border-sm me-1" role="status"></span>
            Importing…
          </span>
          <span v-else>Import</span>
        </BButton>
      </template>
    </BModal>

    <!-- Export JSON preview modal -->
    <BModal v-model="showExportModal" title="Quiz JSON Export" size="lg" :hide-footer="true">
      <pre class="bg-dark text-light rounded p-3" style="white-space: pre-wrap; word-break: break-word; max-height: 60vh; overflow: auto;">{{ exportPreview }}</pre>
    </BModal>

    <!-- Back / Start -->
    <div class="nav-buttons">
      <button class="btn-game btn-game--back" @click="goBack('/home')">← Back</button>
      <button class="btn-game btn-game--start" @click="startGame" :disabled="!canStart">
        Start →
      </button>
    </div>

  </div>
</template>

<script>
import ScrollBoxSelectQuiz from '@/components/ScrollBox-SelectQuiz.vue'
import { listQuizzes, importCsv, importJson, exportQuizJson, exportQuizCsv } from '@/services/quizzes.js'
import { createQuizSession } from '@/services/quizSessionService.js'

export default {
  data() {
    return {
      quizzes: [],
      selectedItems: [],
      showImportModal: false,
      isImporting: false,
      importMessage: '',
      importSuccess: false,
      importFormat: 'csv',
      showExportModal: false,
      exportPreview: '',
    }
  },
  async mounted() {
    await this.fetchQuizzes()
  },
  methods: {
    goBack(path) {
      this.$router.push(path)
    },
    startGame() {
      if (!this.canStart) return
      this.createAndStartSession(this.selectedItems[0].id)
    },
    updateSelectedItems(items) {
      this.selectedItems = items
    },
    async fetchQuizzes() {
      try {
        this.quizzes = await listQuizzes()
      } catch (error) {
        console.error('Failed to load quizzes', error)
        this.quizzes = []
      }
    },
    onModalHidden() {
      this.importMessage = ''
      this.importSuccess = false
      if (this.$refs.csvFile) this.$refs.csvFile.value = ''
      if (this.$refs.jsonFile) this.$refs.jsonFile.value = ''
    },
    async doImport() {
      if (this.importFormat === 'csv') {
        await this.runImport(this.$refs.csvFile?.files[0], 'CSV', importCsv)
      } else {
        await this.runImport(this.$refs.jsonFile?.files[0], 'JSON', importJson)
      }
    },
    async runImport(file, label, importFn) {
      if (!file) {
        this.importMessage = `Please select a ${label} file`
        this.importSuccess = false
        return
      }
      this.isImporting = true
      this.importMessage = ''
      try {
        const result = await importFn(file)
        this.importMessage = result.message
        this.importSuccess = true
        await this.fetchQuizzes()
        setTimeout(() => { this.showImportModal = false }, 1200)
      } catch (error) {
        console.error(`Failed to import ${label}`, error)
        this.importMessage = error.response?.data?.message || error.response?.data?.error || `Failed to import ${label}`
        this.importSuccess = false
      } finally {
        this.isImporting = false
      }
    },
    async doExportJson() {
      const id = this.selectedItems[0]?.id
      if (!id) return
      try {
        const data = await exportQuizJson(id)
        this.exportPreview = JSON.stringify(data, null, 2)
        this.showExportModal = true
      } catch (error) {
        console.error('Failed to export JSON', error)
      }
    },
    async doExportCsv() {
      const id = this.selectedItems[0]?.id
      if (!id) return
      try {
        const blob = await exportQuizCsv(id)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `quiz-${id}.csv`
        a.click()
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Failed to export CSV', error)
      }
    },
    async createAndStartSession(quizId) {
      try {
        const session = await createQuizSession(quizId)
        const query = { isHost: 'true' }
        if (this.$route.query.mode) query.mode = this.$route.query.mode
        this.$router.push({ name: 'Lobby', params: { sessionId: session.id }, query })
      } catch (error) {
        console.error('Failed to create quiz session', error)
      }
    },
  },
  computed: {
    canStart() {
      return this.selectedItems.length > 0
    },
  },
}
</script>

<style scoped>
/* ─── Page Shell ─────────────────────────────────────────── */
.choose-quiz-page {
  flex: 1;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #24243e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 1.25rem;
  padding: 1.5rem;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ─── Hero Header ─────────────────────────────────────────── */
.hero-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.hero-badge {
  display: inline-block;
  background: linear-gradient(90deg, #ff6fd8, #3813c2);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 0.35rem 1.1rem;
  border-radius: 100px;
  box-shadow: 0 0 18px rgba(255, 111, 216, 0.5);
}

.hero-title {
  font-size: clamp(1.6rem, 4vw, 2.5rem);
  font-weight: 900;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
}

.hero-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* ─── Action Bar ──────────────────────────────────────────── */
.action-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.btn-action {
  padding: 0.5rem 1.4rem;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  transition: transform 0.15s ease, filter 0.15s ease, opacity 0.15s ease;
}

.btn-action:hover:not(:disabled) {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.btn-action:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-action--secondary {
  background: linear-gradient(90deg, #ff6fd8, #3813c2);
  color: #fff;
  box-shadow: 0 4px 16px rgba(255, 111, 216, 0.4);
}

.btn-action--outline {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
}

/* ─── Nav Buttons (Back / Start) ─────────────────────────── */
.nav-buttons {
  display: flex;
  gap: 1.25rem;
  justify-content: center;
}

.btn-game {
  padding: 0.7rem 2.2rem;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: none;
  border-radius: 100px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease, opacity 0.15s ease;
}

.btn-game:hover:not(:disabled) {
  transform: scale(1.07);
  filter: brightness(1.12);
}

.btn-game:active:not(:disabled) {
  transform: scale(0.96);
}

.btn-game:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-game--back {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
}

.btn-game--start {
  background: linear-gradient(90deg, #f43f5e, #fb923c, #fbbf24);
  color: #fff;
  box-shadow: 0 4px 20px rgba(244, 63, 94, 0.6);
}
</style>
