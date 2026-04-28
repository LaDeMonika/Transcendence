import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quiz_sessions'

  async up() {
    const hasColumn = await this.db.schema.hasColumn(this.tableName, 'current_question_id')

    if (hasColumn) {
      return
    }

    this.schema.alterTable(this.tableName, (table) => {
      table.integer('current_question_id').notNullable().defaultTo(0)
    })
  }

  async down() {
    const hasColumn = await this.db.schema.hasColumn(this.tableName, 'current_question_id')

    if (!hasColumn) {
      return
    }

    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('current_question_id')
    })
  }
}
