import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const users = [
      {
        email: 'user1@test.com',
        userName: 'Guest 1',
        password: 'password',
        avatarUrl: null
      },
      {
        email: 'user2@test.com',
        userName: 'Guest 2',
        password: 'password',
        avatarUrl: null
      },
      {
        email: 'user3@test.com',
        userName: 'Guest 3',
        password: 'password',
        avatarUrl: null
      },
    ]

    for (const user of users) {
      await User.updateOrCreate({ email: user.email }, user)
    }
  }
}
