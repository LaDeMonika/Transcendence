import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import Quiz from '#models/Quiz'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Question extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column()
  public quizId!: number   // foreign key (quiz this question belongs to)

  @column()
  public question!: string     // the question itself

  @column()
  public answerA!: string

  @column()
  public answerB!: string

  @column()
  public answerC!: string

  @column()
  public answerD!: string

  @column()
  public correctAnswer!: string //"A" | "B" | "C" | "D"

  // @column()
  // public points!: number

  @column.dateTime({ autoCreate: true })
  public createdAt!: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt!: DateTime

  @belongsTo(() => Quiz)
  public quiz!: BelongsTo<typeof Quiz>
}
