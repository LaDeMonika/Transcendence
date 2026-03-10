import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await User.createMany([
      {
        email: 'user1@test.com',
        userName: 'Guest 1',
        password: 'password',
      },
      {
        email: 'user2@test.com',
        userName: 'Guest 2',
        password: 'password',
      },
      {
        email: 'user3@test.com',
        userName: 'Guest 3',
        password: 'password',
      },
    ])
    const user1 = await User.query().where('email', 'user1@test.com').first()
    // await user1?.load('profile')
    await user1?.related('profile').create({
      avatarUrl: 'default.png'
    })
    const user2 = await User.query().where('email', 'user2@test.com').first()
    // await user1?.load('profile')
    await user2?.related('profile').create({
      avatarUrl: 'default.png'
    })
    const user3 = await User.query().where('email', 'user3@test.com').first()
    // await user1?.load('profile')
    await user3?.related('profile').create({
      avatarUrl: 'default.png'
    })
  }
}
