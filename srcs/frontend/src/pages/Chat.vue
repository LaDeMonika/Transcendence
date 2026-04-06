<template>
  <div v-if="isMobile" class="w-100">
    <div v-if="!activeConversation" class="p-3">
      <BButton class="mb-3" @click="showCreateModal = true">
        New Chat
      </BButton>
      <ChatList ref="chatListRef" :selected-id="activeConversation?.id" @select="openConversation" />
    </div>

    <div v-else class="p-3 d-flex flex-column">
      <div class="mb-2 d-flex justify-content-between align-items-center">
        <BButton size="sm" variant="outline-primary" @click="closeConversation">
          Back
        </BButton>
        <div class="d-flex gap-2">
          <BButton size="sm" variant="outline-secondary" @click="showMembersModal = true">
            Manage Users
          </BButton>
          <BButton size="sm" variant="outline-danger" :disabled="leaving" @click="leaveConversation">
            Leave
          </BButton>
        </div>
      </div>
      <MessageList :conversation-id="activeConversation?.id" :conversation="activeConversation" :key="activeConversation?.id" />
      <MessageForm :conversation-id="activeConversation?.id" />
    </div>
  </div>

  <div v-else class="row w-100">
    <div class="col-3">
      <div class="p-3">
        <BButton class="mb-3" @click="showCreateModal = true">
          New Chat
        </BButton>
        <ChatList ref="chatListRef" :selected-id="activeConversation?.id" @select="openConversation" />
      </div>
    </div>
    <div class="col-9 d-flex flex-column">
      <div v-if="activeConversation" class="px-3 pt-2 d-flex justify-content-end gap-2">
        <BButton size="sm" variant="outline-secondary" @click="showMembersModal = true">
          Manage Users
        </BButton>
        <BButton size="sm" variant="outline-danger" :disabled="leaving" @click="leaveConversation">
          Leave
        </BButton>

        <BButton size="sm" variant="outline-primary" @click="closeConversation">
          Close
        </BButton>
      </div>

      <div v-if="activeConversation">
        <MessageList :conversation-id="activeConversation?.id" :conversation="activeConversation" :key="activeConversation?.id" />
        <MessageForm :conversation-id="activeConversation?.id" />
      </div>
    </div>
  </div>

  <ChatCreateModal v-model="showCreateModal" @close="showCreateModal = false" />
  <ChatMembersModal v-model="showMembersModal" :conversation="activeConversation" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ChatCreateModal from "@/components/chat/ChatCreateModal.vue";
import ChatMembersModal from "@/components/chat/ChatMembersModal.vue";
import ChatList from "@/components/chat/ChatList.vue";
import MessageForm from "@/components/chat/MessageForm.vue";
import MessageList from "@/components/chat/MessageList.vue";
import { connectSocket, disconnectSocket, sendWs } from '@/services/chatSocket.js'
import { chatService } from '@/services/chat.js'

const showCreateModal = ref(false)
const showMembersModal = ref(false)
const leaving = ref(false)
const chatListRef = ref(null)
const isMobile = ref(window.innerWidth < 768)

const updateIsMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  connectSocket()
  window.addEventListener('resize', updateIsMobile)
})
onUnmounted(() => {
  disconnectSocket()
  window.removeEventListener('resize', updateIsMobile)
})

const activeConversation = ref(null)

const openConversation = (conv) => {
  if (activeConversation.value?.id) {
    sendWs({ type: 'chat:leave', conversationId: activeConversation.value.id })
  }
  activeConversation.value = conv
  if (conv?.id) {
    sendWs({ type: 'chat:join', conversationId: conv.id })
  }
}

const leaveConversation = async () => {
  const conv = activeConversation.value
  if (!conv) return
  leaving.value = true
  try {
    const me = await chatService.getMe()
    await chatService.removeUserFromConversation(conv.id, me.id)
    sendWs({ type: 'chat:leave', conversationId: conv.id })
    activeConversation.value = null
    chatListRef.value?.loadConversations()
  } finally {
    leaving.value = false
  }
}

const closeConversation = () => {
  activeConversation.value = null
}

</script>
<style scoped>

</style>
