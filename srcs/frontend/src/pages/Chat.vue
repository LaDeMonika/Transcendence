<template>
  <div class="chat-page">
    <div class="chat-container">
      
      <!-- Mobile View -->
      <div v-if="isMobile" class="mobile-chat">
        <div v-if="!activeConversation" class="chat-list-view">
          <div class="header-main">
            <h5 class="mb-0">Chats</h5>
            <button class="btn-game btn-game--start btn-sm" @click="showCreateModal = true">
              + New Chat
            </button>
          </div>
          <div class="list-wrapper">
            <ChatList ref="chatListRef" :selected-id="activeConversation?.id" @select="openConversation" />
          </div>
        </div>

        <div v-else class="chat-active-view">
          <div class="chat-header">
            <button class="btn-back" @click="closeConversation">
              <span class="icon">⬅️</span>
            </button>
            <div class="header-info">
              <h6>{{ activeConversation.otherParticipants?.map(p => p.userName).join(', ') || activeConversation.id }}</h6>
            </div>
            <div class="header-actions">
              <button class="action-icon" @click="showMembersModal = true">⚙️</button>
              <button class="action-icon danger" :disabled="leaving" @click="leaveConversation">🚪</button>
            </div>
          </div>
          <div class="message-area">
            <MessageList :conversation-id="activeConversation?.id" :conversation="activeConversation" :key="activeConversation?.id" />
            <MessageForm :conversation-id="activeConversation?.id" />
          </div>
        </div>
      </div>

      <!-- Desktop View -->
      <div v-else class="desktop-chat">
        <!-- Sidebar -->
        <div class="chat-sidebar">
          <div class="sidebar-header">
            <h5 class="mb-0">Chats</h5>
            <button class="btn-game btn-game--start btn-sm" @click="showCreateModal = true">
              New
            </button>
          </div>
          <div class="sidebar-content">
            <ChatList ref="chatListRef" :selected-id="activeConversation?.id" @select="openConversation" />
          </div>
        </div>

        <!-- Chat Window -->
        <div class="chat-window">
          <template v-if="activeConversation">
            <div class="window-header">
              <div class="participant-info">
                <span class="status-dot online"></span>
                <h6 class="mb-0">{{ activeConversation.otherParticipants?.map(p => p.userName).join(', ') || activeConversation.id }}</h6>
              </div>
              <div class="window-actions">
                <button class="btn-game btn-game--secondary btn-sm" @click="showMembersModal = true">
                  Users
                </button>
                <button class="btn-game btn-game--danger btn-sm" :disabled="leaving" @click="leaveConversation">
                  Leave
                </button>
                <button class="close-btn" @click="closeConversation">
                  <BiX />
                </button>
              </div>
            </div>

            <div class="window-content">
              <MessageList :conversation-id="activeConversation?.id" :conversation="activeConversation" :key="activeConversation?.id" />
              <MessageForm :conversation-id="activeConversation?.id" />
            </div>
          </template>

          <div v-else class="empty-window">
            <div class="empty-content">
              <span class="empty-icon">💬</span>
              <h4>{{ chatListRef?.conversations?.length === 0 ? 'Start your first conversation' : 'Select a chat to begin' }}</h4>
              <p class="empty-desc">Chat with friends and other players in real-time.</p>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Modals -->
    <ChatCreateModal v-model="showCreateModal" @close="showCreateModal = false" @conversation-created="handleConversationCreated" />
    <ChatMembersModal v-model="showMembersModal" :conversation="activeConversation" @conversation-updated="handleConversationUpdated" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import BiX from 'virtual:icons/bi/x'
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
  
  // CRITICAL: Disable parent scrolling for the chat page
  document.body.style.overflow = 'hidden'
  const scrollableContent = document.querySelector('.scrollable-content')
  if (scrollableContent) scrollableContent.style.overflow = 'hidden'
})

onUnmounted(() => {
  disconnectSocket()
  window.removeEventListener('resize', updateIsMobile)
  
  // Re-enable parent scrolling
  document.body.style.overflow = ''
  const scrollableContent = document.querySelector('.scrollable-content')
  if (scrollableContent) scrollableContent.style.overflow = ''
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

const handleConversationCreated = (conversation) => {
  chatListRef.value?.loadConversations()
}

const handleConversationUpdated = (otherParticipants) => {
  if (activeConversation.value) {
    activeConversation.value = {
      ...activeConversation.value,
      otherParticipants,
    }
  }
  chatListRef.value?.loadConversations()
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
/* ─── Page Shell ─────────────────────────────────────────── */
.chat-page {
  flex: 1;
  width: 100%;
  /* We use height: 100% since we're disabling parent scroll */
  height: 100%;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #24243e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Segoe UI', system-ui, sans-serif;
  overflow: hidden;
}

.chat-container {
  width: 100%;
  height: 100%;
  display: flex;
}

/* ─── Desktop View ───────────────────────────────────────── */
.desktop-chat {
  display: flex;
  width: 100%;
  height: 100%;
}

.chat-sidebar {
  width: 320px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border-right: 1.5px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
}

.sidebar-header h5 {
  color: #fff;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background: rgba(0, 0, 0, 0.1);
}

.window-header {
  padding: 1rem 1.5rem;
  background: rgba(15, 12, 41, 0.6);
  backdrop-filter: blur(10px);
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.participant-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.participant-info h6 {
  color: #fff;
  font-weight: 700;
  margin: 0;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.status-dot.online { background: #22c55e; box-shadow: 0 0 10px rgba(34, 197, 94, 0.5); }

.window-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.window-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Important to contain MessageList scrolling */
}

/* ─── Mobile View ────────────────────────────────────────── */
.mobile-chat {
  width: 100%;
  height: 100%;
}

.chat-list-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header-main {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-main h5 { color: #fff; font-weight: 800; margin: 0; }

.list-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.chat-active-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-info {
  flex: 1;
  overflow: hidden;
}

.header-info h6 {
  color: #fff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-icon {
  background: none;
  border: none;
  font-size: 1.25rem;
  padding: 0.5rem;
  cursor: pointer;
}

.message-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ─── Empty State ─────────────────────────────────────────── */
.empty-window {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 5rem;
  position: relative;
  overflow: hidden;
}

.empty-content {
  text-align: center;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-content h4 {
  color: #fff;
  font-weight: 800;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.empty-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  max-width: 300px;
  line-height: 1.4;
}

.empty-icon {
  font-size: 4.5rem;
  display: block;
}

/* ─── Buttons ─────────────────────────────────────────────── */
.btn-game {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
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
.btn-game--danger { background: #f43f5e; color: #fff; }
.btn-game--secondary { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: #fff; }

.btn-sm { padding: 0.4rem 1rem; font-size: 0.75rem; }

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
}

.close-btn:hover { color: #fff; }

.btn-back {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.25rem;
  cursor: pointer;
}
</style>
