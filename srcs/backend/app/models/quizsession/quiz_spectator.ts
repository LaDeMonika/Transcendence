import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Session from '#models/quizsession/quizsession'
import User from '#models/user'

export default class QuizSpectator extends BaseModel {
  public static table = 'quiz_spectators'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'session_id' })
  declare sessionId: number

  @column({ columnName: 'user_id' })
  declare userId: number

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => Session, { foreignKey: 'sessionId' })
  declare session: BelongsTo<typeof Session>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
