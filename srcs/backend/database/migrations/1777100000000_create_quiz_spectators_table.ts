import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quiz_spectators'

  async up() {
    const hasTable = await this.db.schema.hasTable(this.tableName)

    if (hasTable) {
      return
    }

    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table
        .integer('session_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('quiz_sessions')
        .onDelete('CASCADE')

      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      table.unique(['session_id', 'user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
