<template>
  <div class="container d-flex flex-column" style="min-height: 100%">
    <div v-if="step === 1">
      <div class="row border">
        <div class="col-sm d-flex justify-content-center">
          <h2>Select Category</h2>
        </div>
      </div>

      <div class="row flex-grow-1 align-items-center justify-content-center border mb-5">
        <div class="col-sm d-flex justify-content-center border m-3 mb-5">
          <div class="d-flex flex-column align-items-center justify-content-center">
            <button class="m-3" @click="selectedCategory = 'science'">Science</button>
            <button class="m-3" @click="selectedCategory = 'history'">History</button>

            <div class="m-5">
              <button class="btn btn-primary" @click="nextStep" :disabled="!selectedCategory">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="step === 2">
      <div class="row border">
        <div class="col-sm d-flex justify-content-center">
          <h2>Select Difficulty</h2>
        </div>
      </div>

      <div class="row flex-grow-1 align-items-center justify-content-center border mb-5">
        <div class="col-sm d-flex justify-content-center border m-3 mb-5">
          <div class="d-flex flex-column align-items-center justify-content-center">
            <button class="m-3" @click="selectedDifficulty = 'easy'">Easy</button>
            <button class="m-3" @click="selectedDifficulty = 'moderate'">Moderate</button>
            <button class="m-3" @click="selectedDifficulty = 'hard'">Hard</button>

            <div class="m-5">
              <button class="btn btn-primary m-3" @click="prevStep">Back</button>
              <button
                class="btn btn-primary m-3"
                @click="startGame"
                :disabled="!selectedDifficulty"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const step = ref(1)
const selectedCategory = ref(null)
const selectedDifficulty = ref(null)

const nextStep = () => {
  step.value++
}

const prevStep = () => {
  step.value--
}

const startGame = () => {
  if (!selectedCategory.value || !selectedDifficulty.value) return

  router.push('/game')
}
</script>
