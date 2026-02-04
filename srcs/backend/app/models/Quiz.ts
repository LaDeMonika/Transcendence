import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

import Question from '#models/Question'

export default class Quiz extends BaseModel {
  public static table = 'quizzes'

  @column({ isPrimary: true })
  public id!: number

  @column()
  public title!: string

  @column.dateTime({ autoCreate: true })
  public createdAt!: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt!: DateTime

  @hasMany(() => Question, {
    foreignKey: 'quizId'
  })
  public questions!: HasMany<typeof Question>
}