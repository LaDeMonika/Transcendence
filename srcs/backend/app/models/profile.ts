import { DateTime } from 'luxon'
import { BaseModel, beforeFetch, beforeFind, belongsTo, column, computed } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class Profile extends BaseModel {
  serialize() {
    return {
      ...this.serializeAttributes(),
      username: this.username
    }
  }
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column()
  declare avatarUrl: string

  /**
   * Automatic Preloading Hooks
   */
  @beforeFind()
  static async preloadUserFind(query: ModelQueryBuilderContract<typeof Profile>) {
    query.preload('user')
  }
  @beforeFetch()
  static async preloadUserFetch(query: ModelQueryBuilderContract<typeof Profile>) {
    query.preload('user')
  }
  @computed()
  get username() {
    return this.user?.userName || null
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
