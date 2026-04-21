<template>
  <BModal
    v-model="show"
    title="New Conversation"
    ok-title="Start Conversation"
    :ok-disabled="!selectedUser || creating"
    @ok.prevent="onCreate"
    @hidden="reset"
  >
    <BFormGroup label="Search user">
      <BFormInput
        v-model="query"
        placeholder="Type a username..."
        @input="onSearchInput"
        autocomplete="off"
      />
    </BFormGroup>

    <div v-if="searching" class="text-center my-3">
      <BSpinner small />
    </div>

    <BListGroup v-else-if="results.length" class="mt-2">
      <BListGroupItem
        v-for="user in results"
        :key="user.id"
        button
        :active="selectedUser?.id === user.id"
        @click="selectedUser = user"
      >
        {{ user.userName }}
      </BListGroupItem>
    </BListGroup>

    <p v-else-if="query.trim() && !searching" class="text-muted mt-2 mb-0">
      No users found.
    </p>

    <p v-if="error" class="text-danger mt-2 mb-0">{{ error }}</p>
  </BModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { chatService } from '@/services/chat.js'

const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['update:modelValue', 'conversation-created'])

const currentUser = ref(null)
chatService.getMe().then(u => currentUser.value = u).catch(() => {})

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const query = ref('')
const results = ref([])
const selectedUser = ref(null)
const searching = ref(false)
const creating = ref(false)
const error = ref(null)

let debounceTimer = null

const onSearchInput = () => {
  selectedUser.value = null
  clearTimeout(debounceTimer)
  if (!query.value.trim()) {
    results.value = []
    return
  }
  debounceTimer = setTimeout(async () => {
    searching.value = true
    error.value = null
    try {
      results.value = await chatService.searchUsers(query.value.trim())
      results.value = results.value.filter(u => u.id !== currentUser.value?.id)
    } catch (err) {
      error.value = 'Search failed: ' + err.message
      results.value = []
    } finally {
      searching.value = false
    }
  }, 300)
}

const onCreate = async () => {
  if (!selectedUser.value) return
  creating.value = true
  error.value = null
  try {
    const conversation = await chatService.createOrGetConversation(selectedUser.value.id)
    emit('conversation-created', conversation)
    show.value = false
  } catch (err) {
    error.value = 'Failed to create conversation: ' + err.message
  } finally {
    creating.value = false
  }
}

const reset = () => {
  query.value = ''
  results.value = []
  selectedUser.value = null
  searching.value = false
  creating.value = false
  error.value = null
  clearTimeout(debounceTimer)
}
</script>
