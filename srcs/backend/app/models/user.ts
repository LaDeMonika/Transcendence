import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import ConversationParticipant from '#models/chatsystem/ConversationParticipant'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column()
  declare password: string

  @column()
  declare userName: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    // Options are optional
    expiresIn: '42 days',
    prefix: 'trancendenceAT_',
    table: 'auth_access_tokens',
    type: 'auth_token',
    tokenSecretLength: 42,
  })

  //for Conversations 
  @hasMany(() => ConversationParticipant, {
    foreignKey: 'userId'
  })
  public conversations!: HasMany<typeof ConversationParticipant>
}
