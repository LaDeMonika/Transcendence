import ConversationParticipant from '#models/chatsystem/ConversationParticipant'
import Message from '#models/chatsystem/Message'
import { chatRooms } from '#services/chatroom'
import { CHAT_MESSAGE_MAX_LENGTH, getChatMessageLengthError } from '#services/chat_message'
import User from '#models/user'

function sendChatError(ws: any, conversationId: number | null, error: string, code: string) {
    ws.send(JSON.stringify({
        type: 'chat:error',
        conversationId,
        code,
        error,
    }))
}

export async function handleWsChatMessage(ws: any, user: User, payload: any){
    // Leave a conversation room
    if (payload.type === 'chat:leave') {
        const conversationId = Number(payload.conversationId)
        chatRooms.leave(conversationId, ws)
        ws.send(JSON.stringify({ type: 'leave:ok', conversationId }))
        return true
    }

    // Join a conversation room (client can also auto-join on connect, but this allows joining others)
    if (payload.type === 'chat:join') {
        const conversationId = Number(payload.conversationId)
        
        // Check if user is a participant, if not, add them back (allows rejoining after leaving)
        const existingParticipant = await ConversationParticipant.query()
            .where('conversationId', conversationId)
            .where('userId', user.id)
            .first()
        
        if (!existingParticipant) {
            await ConversationParticipant.create({
                conversationId,
                userId: user.id,
            })
        }
        
        chatRooms.join(conversationId, ws)
        ws.send(JSON.stringify({ type: 'join:ok', conversationId }))
        return true
    }

    // CREATE a new message (persist then broadcast)
    if (payload.type === 'chat:message:new') {
        const conversationId = Number(payload.conversationId)
        const body = String(payload.body ?? '').trim()

        // Check basic validity
        if (!body) {
            sendChatError(ws, conversationId, 'Empty message', 'CHAT_MESSAGE_EMPTY')
            return true
        }
        if (body.length > CHAT_MESSAGE_MAX_LENGTH) {
            sendChatError(
                ws,
                conversationId,
                getChatMessageLengthError(),
                'CHAT_MESSAGE_TOO_LONG'
            )
            return true
        }
        if (!chatRooms.isInConversation(conversationId, ws)) {
            sendChatError(ws, conversationId, 'Not joined to conversation', 'CHAT_NOT_JOINED')
            return true
        }

        // Check with DB if user is part of the conversation
        const allowed = await ConversationParticipant.query()
            .where('conversationId', conversationId)
            .where('userId', user.id)
            .first()
        if (!allowed) {
            sendChatError(ws, conversationId, 'Not a participant', 'CHAT_NOT_PARTICIPANT')
            return true
        }

        // Create the message in DB
        const msg = await Message.create({
            conversationId,
            senderId: user.id,
            text: body,
        })
        if (!msg) {
            sendChatError(ws, conversationId, 'Failed to create message', 'CHAT_MESSAGE_CREATE_FAILED')
            return true
        }

        // Broadcast the new message to everyone in the conversation room
        chatRooms.broadcastToConversation(conversationId, {
            type: 'chat:message:created',
            conversationId,
            message: msg,
        })

        // Acknowledge to sender with the new message ID
        ws.send(
            JSON.stringify({
                type: 'chat:message:ack',
                conversationId,
                messageId: msg.id,
            })
        )
        return true
    }

      // Unknown event
      return false
    }
