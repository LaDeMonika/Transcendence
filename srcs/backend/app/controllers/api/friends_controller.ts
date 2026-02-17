import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import FriendStatus from '../../enums/friend_status.js'
// import FriendStatus from '../../enums/friend_status.js'
/*
    await user.related('friends').attach({
        [friendId]: {
            status: 'accepted',
        }
    })
*/

const columnsToSerialize = ['id', 'userName']

export default class FriendsController {
  async index({ auth }: HttpContext) {
    const user = auth.user as User
    const friends = await user.related('friends').query()
    return friends.map((f) =>
      f.serialize({
        fields: {
          pick: columnsToSerialize,
        },
      })
    )
  }

  /**
   * @addFriend
   * @tag friends
   * @description Add a friend
   */
  async addFriend({ request, response, auth }: HttpContext) {
    // will be new implemented
    // check current user
    const authenticatedUser = auth.user as User
    const user = await User.find(authenticatedUser.id)
    if (!user) return response.status(400).send({ error: [{ messages: 'User not found' }] })

    // parameter validation
    const data = request.params()
    data.friendId = Number(data.friendId)
    if (Number.isNaN(data.friendId))
      return response.status(400).send({ error: [{ messages: 'Invalid friendId' }] })
    if (data.friendId === user.id)
      return response
        .status(400)
        .send({ error: [{ messages: 'You can not be friend with yourself' }] })

    // check friend status
    const isFriend = await user.related('friends').query().where('friend_id', data.friendId).first()
    if (isFriend)
      return response.status(400).send({ error: [{ messages: 'Can not add to friends list' }] })

    const friend = await User.find(data.friendId)
    if (!friend)
      return response.status(400).send({ error: [{ messages: 'Target user not found' }] })

    // ready to proceed
    await user.related('friends').attach({
      [friend.id]: {
        status: FriendStatus.REQUESTED,
      },
    })
    await friend.related('friends').attach({
      [user.id]: {
        status: FriendStatus.PENDING,
      },
    })
    await friend.refresh()
    return friend.serialize({
      fields: {
        pick: columnsToSerialize,
        omit: ['status'],
      },
    })
  }

  /**
   * @removeFriend
   * @tag friends
   * @description Remove a user from friends list
   * @requestBody <{ "friendId": "1" }>
   */
  async removeFriend({ request, response, auth }: HttpContext) {
    const authenticatedUser = auth.user as User
    const user = await User.find(authenticatedUser.id)
    if (!user) return response.status(400).send({ error: [{ messages: 'User not found' }] })

    const data = request.params()
    data.friendId = Number(data.friendId)
    if (Number.isNaN(data.friendId))
      return response.status(400).send({ error: [{ messages: 'Invalid friendId' }] })

    const friend = await user.related('friends').query().where('friend_id', data.friendId).first()
    if (!friend) return response.status(400).send({ error: [{ messages: 'Friend not found' }] })

    await user.related('friends').detach([friend.id])
    await friend.related('friends').detach([user.id])
    await friend.refresh()
    return friend.serialize({
      fields: {
        pick: columnsToSerialize,
        omit: ['status'],
      },
    })
  }

  /**
   * @acceptFriend
   * @tag friends
   * @description Accept a friend request
   * @requestBody <{ "friendId": "1" }>
   */
  async acceptFriend({ request, response, auth }: HttpContext) {
    const authenticatedUser = auth.user as User
    const user = await User.find(authenticatedUser.id)
    if (!user) return response.status(400).send({ error: [{ messages: 'User not found' }] })

    const data = request.params()
    data.friendId = Number(data.friendId)
    if (Number.isNaN(data.friendId))
      return response.status(400).send({ error: [{ messages: 'Invalid friendId' }] })

    const friend = await user
      .related('friends')
      .query()
      .where('friend_id', data.friendId)
      .andWhere('status', 'pending')
      .first()
    if (!friend)
      return response.status(400).send({ error: [{ messages: 'Friend request not found' }] })
    await user
      .related('friends')
      .pivotQuery()
      .where('friend_id', friend.id)
      .update({ status: FriendStatus.ACCEPTED })
    await friend
      .related('friends')
      .pivotQuery()
      .where('friend_id', user.id)
      .update({ status: FriendStatus.ACCEPTED })
    return friend.serialize({
      fields: {
        pick: columnsToSerialize,
        omit: ['status'],
      },
    })
  }

  // for testing
  async indexPivot({ auth }: HttpContext) {
    const authenticatedUser = auth.user as User
    const user = await User.find(authenticatedUser.id)

    const friendsTable = await user?.related('friends').pivotQuery()
    return friendsTable
  }
}
