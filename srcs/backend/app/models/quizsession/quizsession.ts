import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import QuizPlayer from '#models/quizsession/quiz_player'
import QuizSpectator from '#models/quizsession/quiz_spectator'

export default class Session extends BaseModel {
  public static table = 'quiz_sessions'

  @column({ isPrimary: true })
  public id!: number

  @column({ columnName: 'quiz_id' })
  public quizId!: number

  @column()
  public state!: string

  @column({ columnName: 'current_question_id' })
  declare currentQuestionId: number

  @column({ columnName: 'host_user_id' })
  declare hostId: number

  @column({ columnName: 'conversation_id' })
  declare conversationId: number | null

  @column.dateTime({ columnName: 'started_at' })
  declare startedAt: DateTime | null

  @column.dateTime({ columnName: 'finished_at' })
  declare finishedAt: DateTime | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  public createdAt!: DateTime
  
  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  public updatedAt!: DateTime

    //QUIZ TIMING
  @column.dateTime({ columnName: 'question_started_at' })
  declare questionStartedAt: DateTime | null

  @column.dateTime({ columnName: 'question_ends_at' })
  declare questionEndsAt: DateTime | null

  @column.dateTime({ columnName: 'reveal_ends_at' })
  declare revealEndsAt: DateTime | null

  @hasMany(() => QuizPlayer, {
    foreignKey: 'sessionId',
  })
  declare players: HasMany<typeof QuizPlayer>

  @hasMany(() => QuizSpectator, {
    foreignKey: 'sessionId',
  })
  declare spectators: HasMany<typeof QuizSpectator>
}
