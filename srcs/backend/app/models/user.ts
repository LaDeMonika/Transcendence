import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, manyToMany } from '@adonisjs/lucid/orm'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import type { HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import Profile from '#models/profile'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  // serialize other related columns of related tables
  serializeExtras() {
    return {
      status: this.$extras.pivot_status,
    }
  }

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare userName: string

  @manyToMany(() => User, {
    pivotTable: 'friends',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'friend_id',
    pivotTimestamps: true,
    pivotColumns: ['status'],
  })
  declare friends: ManyToMany<typeof User>

  @hasOne(() => Profile)
  declare profile: HasOne<typeof Profile>

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
}
