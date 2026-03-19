import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quiz_sessions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table
        .integer('quiz_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('quizzes')
        .onDelete('CASCADE')

      table
        .integer('host_user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table
        .integer('conversation_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('conversations')
        .onDelete('SET NULL')

      table
        .enum('state', ['lobby', 'question', 'reveal', 'finished'])
        .notNullable()
        .defaultTo('lobby')

      table.integer('current_question_index').defaultTo(0)

      table.timestamp('started_at', { useTz: true }).nullable()
      table.timestamp('finished_at', { useTz: true }).nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}