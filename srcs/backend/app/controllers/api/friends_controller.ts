import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

/*
    await user.related('friends').attach({
        [friendId]: {
            status: 'accepted',
        }
    })
*/

export default class FriendsController {
  async index({ auth }: HttpContext) {
    const user = auth.user as User
    const friends = await user.related('friends').query()
    // const userWithFriends = await User.query()
    //   .preload('friends')
    //   .where('id', user.id)
    //   .where('friends.status', 'pending')
    //   .first()
    // return userWithFriends?.serialize().friends
    return friends
  }

  /**
   * @addFriend
   * @tag friends
   * @description Add a friend
   * @requestBody <{ "friendId": "1" }>
   */
  async addFriend({ request, response, auth }: HttpContext) {
    const data = request.only(['friendId'])
    console.log(data, typeof data.friendId)
    const authenticatedUser = auth.user as User
    const user = await User.find(authenticatedUser.id)
    const friendCheck = await user
      ?.related('friends')
      .query()
      .where('friend_id', data.friendId)
      .first()
    if (!user) return response.status(318).send({ errors: [{ messages: 'User not found' }] })
    if (friendCheck) return response.status(333).send({ errors: [{ messages: 'Already friends' }] })
    const friend = await User.find(data.friendId)
    if (!friend) return response.status(333).send({ errors: [{ messages: 'Friend not found' }] })
    user.related('friends').attach({
      [Number(data.friendId)]: {
        status: 'pending',
      },
    })
    friend.related('friends').attach([user.id])
    return user.related('friends').query()
  }

  /**
   * @removeFriend
   * @tag friends
   * @description Remove a user from friends list
   * @requestBody <{ "friendId": "1" }>
   */
  async removeFriend({ request, response, auth }: HttpContext) {
    const data = request.params()
    const authenticatedUser = auth.user as User
    const user = await User.find(authenticatedUser.id)
    const friend = await user
      ?.related('friends')
      .query()
      .where('friend_id', Number(data.friendId))
      .first()
    if (!user || !friend)
      return response.status(318).send({ errors: [{ messages: 'Users are not friends' }] })
    await user.related('friends').detach([Number(data.friendId)])
    await friend.related('friends').detach([user.id])
    return friend.serialize()
  }
}
