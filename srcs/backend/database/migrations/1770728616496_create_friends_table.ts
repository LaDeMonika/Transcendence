import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'friends'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_id').references('users.id')
      table.integer('friend_id').references('users.id')
      table.unique(['user_id', 'friend_id'])
      table.enum('status', ['pending', 'accepted']).defaultTo('pending').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
