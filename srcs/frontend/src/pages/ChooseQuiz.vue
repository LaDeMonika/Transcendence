<template>
  <div class="container d-flex flex-column" style="min-height: 100%">

    <!-- TITLE -->
    <div class="row align-items-center justify-content-center border">
      <div class="col-sm d-flex justify-content-center">
        <h1>Choose Quiz!</h1>
      </div>
    </div>

    <ScrollBoxSelectQuiz :items="quizzes" @update:selectedItems="updateSelectedItems"/>

    <div class="row align-items-center justify-content-center border">
      <div class="col-sm d-flex flex-wrap justify-content-center gap-2 py-3">
        <BButton variant="outline-secondary" @click="showImportModal = true">
          Import Quiz
        </BButton>
        <BButton
          variant="outline-primary"
          :disabled="selectedItems.length !== 1"
          @click="doExportJson"
        >
          Export JSON
        </BButton>
        <BButton
          variant="outline-primary"
          :disabled="selectedItems.length !== 1"
          @click="doExportCsv"
        >
          Export CSV
        </BButton>
      </div>
    </div>

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

    <div class="row align-items-center justify-content-center border">
      <div class="back-start-buttons d-flex justify-content-center">
        <button class="btn btn-primary mx-3" @click="goBack('/home')">Back</button>
        <button class="btn btn-primary mx-3" @click="startGame" :disabled="!canStart">Start</button>
      </div>
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

<style>
.back-start-buttons {
  padding: 25px;
}
</style>
