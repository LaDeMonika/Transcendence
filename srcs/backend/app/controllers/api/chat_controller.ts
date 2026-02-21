import { HttpContext } from '@adonisjs/core/http'
import Conversation from '#models/chatsystem/Conversation'
import Message from '#models/chatsystem/Message'
import User from '#models/user'
import ConversationParticipant from '#models/chatsystem/ConversationParticipant'
import { createConversationValidator } from '#validators/conversation'
import '#validators/conversation' // Ensure the validator is registered

export default class ChatController {
    // GET /api/chat/me
    public async me({ auth }: HttpContext) {
        const user = await auth.authenticate()
        return user
    }

    // GET /api/chat/conversations
    // returns a list of conversations the user is part of, with the last message and other participant(s) info
    public async indexConversations({ auth }: HttpContext) {
        // Placeholder for listing conversations
        const user = auth.user! as User
        const userId = user.id

        const conversations = await Conversation.query()
            .whereHas('participants', (q) => {
                q.where('userId', userId)
            })
            .preload('participants')
            .preload('messages', (q) => {
                q.orderBy('id', 'desc').limit(1)
            })
            .orderBy('updatedAt', 'desc')

            return conversations.map((conversation) => {
                const lastMessage = conversation.messages[0] || null
                const otherParticipants = conversation.participants
                    .filter((p) => p.userId !== userId)
                    .map((p) => ({
                        id: p.user.id,
                        email: p.user.email,
                    }))

                return {
                    id: conversation.id,
                    otherParticipants: otherParticipants,
                    lastMessage: lastMessage ? {
                        id: lastMessage.id,
                        text: lastMessage.text,
                        senderId: lastMessage.senderId,
                        createdAt: lastMessage.createdAt,
                    } : null,
                    updatedAt: conversation.updatedAt,
                }
            })
    }

    /**
    * @createOrGetConversation
    * @tag chat
    * @description fucking create or get conversation between two users
    * @requestBody <createConversationValidator>
    */
    public async createOrGetConversation({ auth, request }: HttpContext) {
        const payload = await request.validateUsing(createConversationValidator)
        const user = auth.user! as User
        const userId = user.id
        const otherUserId = payload.otherUserId


        if (!otherUserId || Number(otherUserId) === userId) {
        return { error: 'Invalid otherUserId' }
        }



        const conversations = await Conversation.query()
        .whereHas('participants', (q) => q.where('userId', userId))
        .whereHas('participants', (q) => q.where('userId', otherUserId))
        .preload('participants')

        // If a conversation with exactly these two participants exists, return it
        for (const conversation of conversations) {
            if (conversation.participants.length === 2) {
                return conversation
            }
        }

        // If no conversation exists, create a new one
        const newConversation = await Conversation.create({})

        await ConversationParticipant.create({
            conversationId: newConversation.id,
            userId: userId,
        })
        await ConversationParticipant.create({
            conversationId: newConversation.id,
            userId: otherUserId,
        })
        
        return newConversation
    }

    // GET /api/chat/conversations/:id/messages
    public async listMessages({ params }: HttpContext) {
        const conversationId = params.id
        const messages = await Message.query().where('conversationId', conversationId).orderBy('createdAt', 'asc')
        return messages
    }

    // POST /api/chat/conversations/:id/messages
    public async sendMessage({ params, request, auth }: HttpContext) {
        const conversationId = params.id
        const user = auth.user! as User
        const userId = user.id
        const text = request.input('text')  

        const message = await Message.create({
            conversationId,
            senderId: userId,
            text,
        })

        return message
    }
  }