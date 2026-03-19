import ConversationParticipant from '#models/chatsystem/ConversationParticipant'
import Message from '#models/chatsystem/Message'
import { chatRooms } from '#services/chatroom'
import User from '#models/user'

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
            ws.send(JSON.stringify({ type: 'error', error: 'Empty message' }))
            return true
        }
        if (!chatRooms.isInConversation(conversationId, ws)) {
            ws.send(JSON.stringify({ type: 'error', error: 'Not joined to conversation' }))
            return true
        }

        // Check with DB if user is part of the conversation
        const allowed = await ConversationParticipant.query()
            .where('conversationId', conversationId)
            .where('userId', user.id)
            .first()
        if (!allowed) {
            ws.send(JSON.stringify({ type: 'error', error: 'Not a participant' }))
            return true
        }

        // Create the message in DB
        const msg = await Message.create({
            conversationId,
            senderId: user.id,
            text: body,
        })
        if (!msg) {
            ws.send(JSON.stringify({ type: 'error', error: 'Failed to create message' }))
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
