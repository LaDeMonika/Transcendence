import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'questions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id') // auto ID

      table
        .integer('quiz_id')
        .unsigned()
        .references('id')
        .inTable('quizzes')
        .onDelete('CASCADE') // wenn Quiz gelöscht wird → Fragen auch

      table.string('question').notNullable()
      table.string('answer_a').notNullable()
      table.string('answer_b').notNullable()
      table.string('answer_c').notNullable()
      table.string('answer_d').notNullable()

      table.string('correct_answer').notNullable()

      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
