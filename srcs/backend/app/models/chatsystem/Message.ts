import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { belongsTo } from '@adonisjs/lucid/orm'


import ConversationParticipant from '#models/chatsystem/ConversationParticipant'
import Conversation from '#models/chatsystem/Conversation'

export default class Message extends BaseModel {
    public static table = 'messages'

    @column({ isPrimary: true })
    public id!: number

    @column()
    public text!: string

    @column()
    public conversationId!: number

    @column()
    public senderId!: number

    @column.dateTime({ autoCreate: true })
    public createdAt!: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt!: DateTime


    // Relations
    @belongsTo(() => Conversation, { foreignKey: 'conversationId' })
    public conversation!: BelongsTo<typeof Conversation>

    @belongsTo(() => ConversationParticipant, { foreignKey: 'senderId' })
    public sender!: BelongsTo<typeof ConversationParticipant>
}