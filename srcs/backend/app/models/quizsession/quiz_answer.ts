import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class QuizAnswer extends BaseModel {
  public static table = 'quiz_answers'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'session_id' })
  declare sessionId: number

  @column({ columnName: 'question_id' })
  declare questionId: number

  @column({ columnName: 'user_id' })
  declare userId: number

  @column({ columnName: 'selected_option' })
  declare selectedOption: string

  @column({ columnName: 'is_correct' })
  declare isCorrect: boolean

  @column()
  declare points: number

  @column.dateTime({ columnName: 'answered_at' })
  declare answeredAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}

