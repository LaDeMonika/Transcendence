import { client } from './client.js'

export const chatService = {
  async getMe() {
    const res = await client.get('/me')
    return res.data
  },

  async searchUsers(query) {
    const res = await client.get('/search-users', { params: { query } })
    return res.data
  },

  async getConversations() {
    const res = await client.get('/conversations')
    return res.data
  },

  async createOrGetConversation(otherUserId) {
    const res = await client.post('/conversations', { otherUserId })
    return res.data
  },

  async addUserToConversation(conversationId, otherUserId) {
    const res = await client.post('/conversations/add-user', {
      conversationId,
      otherUserId
    })
    return res.data
  },

  async removeUserFromConversation(conversationId, otherUserId) {
    const res = await client.delete('/conversations/remove-user', {
      data: { conversationId, otherUserId }
    })
    return res.data
  },

  async getMessages(conversationId) {
    const res = await client.get(`/conversations/${conversationId}/messages`)
    return res.data
  },

  async sendMessage(conversationId, text) {
    const res = await client.post(`/conversations/${conversationId}/messages`, { text })
    return res.data
  }
}
