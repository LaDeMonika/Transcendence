// Mainly for joining users and conversations, but can also store per-user conversation set
import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import Conversation from '#models/chatsystem/Conversation'
import User from '#models/user'

export default class ConversationParticipant extends BaseModel {
  public static table = 'conversation_participants'

    @column({ isPrimary: true })
    public id!: number

    @column()
    public conversationId!: number

    @column()
    public userId!: number

    @column.dateTime({ autoCreate: true })
    public createdAt!: DateTime
    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt!: DateTime

    // Relations
    @belongsTo(() => Conversation, { foreignKey: 'conversationId' })
    public conversation!: BelongsTo<typeof Conversation>

    @belongsTo(() => User, { foreignKey: 'userId' })
    public user!: BelongsTo<typeof User>
}