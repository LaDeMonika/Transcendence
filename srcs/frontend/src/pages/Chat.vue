<template>
  <div class="row w-100">
    <div class="col-3">
      <div class="p-3">
        <BButton class="mb-3" @click="showCreateModal = true">
          New Chat
        </BButton>
        <ChatList />
      </div>
    </div>
    <div class="col-9">
      <MessageList />
      <MessageForm />
    </div>
  </div>

  <ChatCreateModal v-if="showCreateModal" @close="showCreateModal = false" />
</template>

<script setup>
import { ref } from 'vue'
import ChatCreateModal from "@/components/chat/ChatCreateModal.vue";
import ChatEditModal from "@/components/chat/ChatEditModal.vue";
import ChatList from "@/components/chat/ChatList.vue";
import MessageForm from "@/components/chat/MessageForm.vue";
import MessageList from "@/components/chat/MessageList.vue";

const showCreateModal = ref(false)
</script>
<style scoped>

</style>