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
      <div class="col-sm d-flex justify-content-center py-3">
        <BButton variant="outline-secondary" @click="showImportModal = true">
          Import Quiz from CSV
        </BButton>
      </div>
    </div>

    <BModal
      v-model="showImportModal"
      title="Import Quiz from CSV"
      @hidden="onModalHidden"
      :hide-footer="false"
    >
      <p class="text-muted mb-3">Select a <code>.csv</code> file to import as a new quiz.</p>
      <input type="file" ref="csvFile" accept=".csv" class="form-control">
      <div v-if="importMessage" class="mt-3 alert mb-0" :class="importSuccess ? 'alert-success' : 'alert-danger'">
        {{ importMessage }}
      </div>
      <template #footer>
        <BButton variant="secondary" @click="showImportModal = false">Cancel</BButton>
        <BButton variant="primary" :disabled="isImporting" @click="importCsv">
          <span v-if="isImporting">
            <span class="spinner-border spinner-border-sm me-1" role="status"></span>
            Importing…
          </span>
          <span v-else>Import</span>
        </BButton>
      </template>
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
import { listQuizzes, importCsv } from '@/services/quizzes.js'
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

      const selectedQuiz = this.selectedItems[0]
      this.createAndStartSession(selectedQuiz.id)
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
    },
    async importCsv() {
      const file = this.$refs.csvFile?.files[0]
      if (!file) {
        this.importMessage = 'Please select a CSV file'
        this.importSuccess = false
        return
      }

      this.isImporting = true
      this.importMessage = ''

      try {
        const result = await importCsv(file)
        this.importMessage = result.message
        this.importSuccess = true
        await this.fetchQuizzes()
        setTimeout(() => { this.showImportModal = false }, 1200)
      } catch (error) {
        console.error('Failed to import CSV', error)
        this.importMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to import CSV'
        this.importSuccess = false
      } finally {
        this.isImporting = false
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
