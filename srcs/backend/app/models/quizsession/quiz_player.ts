import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Session from '#models/quizsession/quizsession'
import User from '#models/user'

export default class QuizPlayer extends BaseModel {
  public static table = 'quiz_players'

  @column({ isPrimary: true})
  declare id: number
  
  @column()
  declare sessionId: number

  @column()
  declare userId: number
  
  @column()
  declare score: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  //relationships
  @belongsTo(() => Session, { foreignKey: 'sessionId' })
  declare session: BelongsTo<typeof Session>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}