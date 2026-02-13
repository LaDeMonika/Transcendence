import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'


import ConversationParticipant from '#models/chatsystem/ConversationParticipant'
import Message from '#models/chatsystem/Message'

export default class Conversation extends BaseModel {
  public static table = 'conversations'

  @column({ isPrimary: true })
  public id!: number

  @column.dateTime({ autoCreate: true })
  public createdAt!: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt!: DateTime


  // Relations
  @hasMany(() => ConversationParticipant, { foreignKey: 'conversationId' })
  public users!: HasMany<typeof ConversationParticipant>

  @hasMany(() => Message, { foreignKey: 'conversationId' })
  public messages!: HasMany<typeof Message>
}