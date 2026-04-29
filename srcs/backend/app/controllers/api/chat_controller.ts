import { HttpContext } from '@adonisjs/core/http'
import Conversation from '#models/chatsystem/Conversation'
import Message from '#models/chatsystem/Message'
import User from '#models/user'
import ConversationParticipant from '#models/chatsystem/ConversationParticipant'
import { CHAT_MESSAGE_MAX_LENGTH, getChatMessageLengthError } from '#services/chat_message'
import { createConversationValidator } from '#validators/conversation'
import '#validators/conversation' // Ensure the validator is registered

/*
GET /api/me 
returns the currently authenticated user and is used by the frontend 
to confirm the access token is valid and to load the user’s identity (e.g., id, email, userName) 
for app state and UI decisions.

GET /api/conversations 
returns all conversations the authenticated user participates in, including the other participants 
(with their user info) and the most recent message for each conversation, and is typically used to 
render the conversation list/sidebar sorted by recent activity.

POST /api/conversations 
creates a new one-to-one conversation (or returns the existing one) when sent { "otherUserId": <number> }, 
letting the frontend start a chat from a profile/user list and then navigate to the returned conversation id.

POST /api/conversations/add-user 
adds another user to an existing conversation by sending { "conversationId": <number>, "otherUserId": <number> }, 
and is used for group-chat flows (invite/add member), returning an error if the caller isn’t in the conversation, 
the user doesn’t exist, or the user is already a participant.

DELETE /api/conversations/remove-user 
removes a user from a conversation by sending { "conversationId": <number>, "otherUserId": <number> }, 
enabling “remove member” or “kick” flows (and effectively “leave” if you pass your own user id), 
returning an error if the caller isn’t in the conversation or the target user isn’t a participant.

GET /api/conversations/:id/messages 
returns the full message history for the conversation identified by :id, which the frontend uses to render 
the chat thread and align messages by comparing each message’s senderId to the current user id.

POST /api/conversations/:id/messages 
sends a new message to the conversation identified by :id using { "text": "..." } in the body, 
returning the created message so the frontend can append it to the chat UI (often with optimistic updates).
*/

export default class ChatController {
    // // GET /api/me
    // public async me({ auth }: HttpContext) {
    //     const user = await auth.authenticate()
    //     return user
    // }

    // POST /api/conversations/add-user
    public async addUserToConversation({auth, request, response }: HttpContext) {
        const conversationId = request.input('conversationId')
        const otherUserId = request.input('otherUserId')
        const user = (await auth.authenticate()) as User
        const userId = user.id

        //check if the user is part of the conversation
        const isUserInConversation = await ConversationParticipant.query()
            .where('conversationId', conversationId)
            .where('userId', userId)
            .first()
        if (!isUserInConversation) {
            return response.forbidden({
                message: 'You are not part of this conversation',
            })
        }

        //check if the other user exists
        const otherUser = await User.find(otherUserId)
        if (!otherUser) {
            return response.notFound({
            message: 'User not found',
            })
        }

        // Check if the otheruser is already in the conversation
        const existingParticipant = await ConversationParticipant.query()
            .where('conversationId', conversationId)
            .where('userId', otherUserId)
            .first()
        if (existingParticipant) {
            return response.badRequest({ error: 'User is already in the conversation' })
        }

        // Add the user to the conversation
        const newParticipant = await ConversationParticipant.create({
            conversationId,
            userId: otherUserId,
        })

        return newParticipant
    }

    // DELETE /api/conversations/remove-user
    public async removeUserFromConversation({ auth, request, response }: HttpContext) {
        const user = (await auth.authenticate()) as User
        const userId = user.id
        const conversationId = request.input('conversationId')
        const otherUserId = request.input('otherUserId')
        
        //check if the user is part of the conversation
        const isUserInConversation = await ConversationParticipant.query()
            .where('conversationId', conversationId)
            .where('userId', userId)
            .first()
        if (!isUserInConversation) {
            return response.forbidden({
                message: 'You are not part of this conversation',
            })
        }

        //check if the other user is part of the conversation
        const participant = await ConversationParticipant.query()
            .where('conversationId', conversationId)
            .where('userId', otherUserId)
            .first()
        if (!participant) {
            return response.notFound({
                message: 'User is not in the conversation',
            })
        }

        await participant.delete()
        return { message: 'User removed from conversation' }
    }

    // GET /api/conversations
    // returns a list of conversations the user is part of, with the last message and other participant(s) info
    public async indexConversations({ auth }: HttpContext) {
        // Placeholder for listing conversations
        const user = (await auth.authenticate()) as User
        const userId = user.id

        const conversations = await Conversation.query()
            .whereHas('participants', (q) => {
                q.where('userId', userId)
            })
            .preload('participants', (p) => {
                p.preload('user')
            })
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
                        userName: p.user.userName,
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
    public async createOrGetConversation({ auth, request, response }: HttpContext) {
        const user = (await auth.authenticate()) as User
        const userId = user.id

        const payload = await request.validateUsing(createConversationValidator)
        const otherUserId = payload.otherUserId
    
        // const payload = await request.validateUsing(createConversationValidator)
        // const user = auth.user! as User
        // const userId = user.id
        // const otherUserId = payload.otherUserId
        if (!otherUserId || Number(otherUserId) === userId) {
            return { error: 'Invalid otherUserId' }
        }

        //check if the other user exists
        const otherUser = await User.find(otherUserId)
        if (!otherUser) {
            return response.notFound({
            message: 'User not found',
            })
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

    // GET /api/conversations/:id/messages
    public async listMessages({ params }: HttpContext) {
        const conversationId = params.id
        const messages = await Message.query().where('conversationId', conversationId).orderBy('createdAt', 'asc')
        return messages
    }

    // POST /api/conversations/:id/messages
    public async sendMessage({ params, request, auth, response }: HttpContext) {
        const conversationId = params.id
        const user = (await auth.authenticate()) as User
        const userId = user.id
        const text = String(request.input('text') ?? '').trim()

        if (!text) {
            return response.badRequest({
                error: 'Empty message',
            })
        }

        if (text.length > CHAT_MESSAGE_MAX_LENGTH) {
            return response.badRequest({
                error: getChatMessageLengthError(),
                code: 'CHAT_MESSAGE_TOO_LONG',
                maxLength: CHAT_MESSAGE_MAX_LENGTH,
            })
        }

        const message = await Message.create({
            conversationId,
            senderId: userId,
            text,
        })

        return message
    }
  }
