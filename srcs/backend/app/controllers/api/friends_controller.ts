import User from '#models/user'
// import type { HttpContext } from '@adonisjs/core/http'

/*
    await user.related('friends').attach({
        [friendId]: {
            status: 'accepted',
        }
    })
*/

export default class FriendsController {
  async index() {
    const user = await User.query().preload('friends').where('id', 1).first()
    console.log(user?.serialize())
    console.log('got request for friends list')
    return user?.serialize()
  }

  async addUser() {
    const user1 = await User.query().preload('friends').where('id', 1).first()
    await user1?.related('friends').detach([3])
    console.log(user1?.serialize().friends)
    // await user1?.save()
    return user1?.serialize()
  }
}
