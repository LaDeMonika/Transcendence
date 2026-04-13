import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const users = [
      {
        email: 'user1@test.com',
        password: 'password',
        userName: 'user1',
      },
      {
        email: 'user2@test.com',
        password: 'password',
        userName: 'user2',
      },
      {
        email: 'user3@test.com',
        password: 'password',
        userName: 'user3',
      },
    ]

    for (const user of users) {
      await User.updateOrCreate({ email: user.email }, user)
    }
  }
}
