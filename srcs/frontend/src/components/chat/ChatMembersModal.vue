<template>
  <BModal
    v-model="show"
    title="Manage Members"
    ok-title="Done"
    :ok-only="true"
    @show="onOpen"
    @hidden="reset"
  >
    <h6>Current members</h6>
    <BListGroup class="mb-3">
      <BListGroupItem
        v-for="member in members"
        :key="member.id"
        class="d-flex justify-content-between align-items-center"
      >
        {{ member.userName }}
        <BButton
          size="sm"
          variant="outline-danger"
          :disabled="removing === member.id"
          @click="removeMember(member)"
        >
          <BSpinner v-if="removing === member.id" small />
          <span v-else>Remove</span>
        </BButton>
      </BListGroupItem>
      <BListGroupItem v-if="members.length === 0" class="text-muted">
        No members found.
      </BListGroupItem>
    </BListGroup>

    <h6>Add user</h6>
    <BFormGroup>
      <BFormInput
        v-model="query"
        placeholder="Type a username..."
        @input="onSearchInput"
        autocomplete="off"
      />
    </BFormGroup>

    <div v-if="searching" class="text-center my-2">
      <BSpinner small />
    </div>

    <BListGroup v-else-if="searchResults.length" class="mt-2">
      <BListGroupItem
        v-for="user in searchResults"
        :key="user.id"
        class="d-flex justify-content-between align-items-center"
      >
        {{ user.userName }}
        <BButton
          size="sm"
          variant="outline-success"
          :disabled="adding === user.id || isMember(user.id)"
          @click="addMember(user)"
        >
          <BSpinner v-if="adding === user.id" small />
          <span v-else-if="isMember(user.id)">Already added</span>
          <span v-else>Add</span>
        </BButton>
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
  modelValue: Boolean,
  conversation: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue'])

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const members = ref([])
const removing = ref(null)
const adding = ref(null)
const error = ref(null)

const query = ref('')
const searchResults = ref([])
const searching = ref(false)
let debounceTimer = null

const onOpen = () => {
  members.value = [...(props.conversation?.otherParticipants ?? [])]
}

const isMember = (userId) => members.value.some((m) => m.id === userId)

const removeMember = async (member) => {
  removing.value = member.id
  error.value = null
  try {
    await chatService.removeUserFromConversation(props.conversation.id, member.id)
    members.value = members.value.filter((m) => m.id !== member.id)
  } catch (err) {
    error.value = 'Failed to remove user: ' + err.message
  } finally {
    removing.value = null
  }
}

const addMember = async (user) => {
  adding.value = user.id
  error.value = null
  try {
    await chatService.addUserToConversation(props.conversation.id, user.id)
    members.value.push(user)
    searchResults.value = searchResults.value.filter((u) => u.id !== user.id)
  } catch (err) {
    error.value = 'Failed to add user: ' + err.message
  } finally {
    adding.value = null
  }
}

const onSearchInput = () => {
  clearTimeout(debounceTimer)
  if (!query.value.trim()) {
    searchResults.value = []
    return
  }
  debounceTimer = setTimeout(async () => {
    searching.value = true
    error.value = null
    try {
      searchResults.value = await chatService.searchUsers(query.value.trim())
    } catch (err) {
      error.value = 'Search failed: ' + err.message
      searchResults.value = []
    } finally {
      searching.value = false
    }
  }, 300)
}

const reset = () => {
  members.value = []
  query.value = ''
  searchResults.value = []
  searching.value = false
  removing.value = null
  adding.value = null
  error.value = null
  clearTimeout(debounceTimer)
}
</script>
