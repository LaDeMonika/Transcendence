<template>
  <div class="row w-100">
    <div class="col-3">
      <ChatList />
    </div>
    <div class="col-9">
      <MessageList />
      <MessageForm />
    </div>
  </div>
</template>

<script setup>
import ChatCreateModal from "@/components/chat/ChatCreateModal.vue";
import ChatEditModal from "@/components/chat/ChatEditModal.vue";
import ChatList from "@/components/chat/ChatList.vue";
import MessageForm from "@/components/chat/MessageForm.vue";
import MessageList from "@/components/chat/MessageList.vue";

</script>
<style scoped>

</style>