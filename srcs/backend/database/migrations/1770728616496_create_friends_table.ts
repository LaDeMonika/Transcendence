import { BaseSchema } from '@adonisjs/lucid/schema'
import FriendStatus from '../../app/enums/friend_status.js'

export default class extends BaseSchema {
  protected tableName = 'friends'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_id').references('users.id')
      table.integer('friend_id').references('users.id')
      table.unique(['user_id', 'friend_id'])
      table
        // user1 requested (user1.status: requested) to be friend with user2 (status: pending)
        // if user2 accepts, user2.status: accepted, user1.status: accepted
        .enum('status', Object.values(FriendStatus))
        .defaultTo(FriendStatus.PENDING)
        .notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
