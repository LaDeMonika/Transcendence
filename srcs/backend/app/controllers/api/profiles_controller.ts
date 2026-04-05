import User from '#models/user'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import env from '#start/env'
import fs from 'fs'

export default class ProfilesController {
    /**
     *  Use privateProfile method to retrieve all information of current user
     */
    async privateProfile({ auth }: HttpContext) {
        const authenticatedUser = auth.user as User
        const user = await User.find(authenticatedUser.id)
        return user!.serialize()
    }
    /**
     *  Use publicProfile method to retrieve information that what other users can see
     *  Can be used to see what other people see in your profile
     *  @params userId of target user
     */
    async publicProfile({ request, response }: HttpContext) {
        const data = request.params()
        data.userId = Number(data.userId)
        if (Number.isNaN(data.userId)) return response.status(400).send({ errors: [{ messages: 'Invalid userId' }] })
        const user = await User.find(data.userId)
        if (!user) return response.status(400).send({ error: [{ messages: 'User not found' }] })
        return user.serialize()
    }
    
    // update methods will be added for different parts
    // update(ctx: HttpContext) {
    //     return ctx.response.ok({ message: "request got update profile" })
    // }

  /**
   * @uploadAvatar
   * @tag profile
   * @description upload profile avatar
   * @requestFormDataBody {"file":{"type": "file"}}
   */
    async uploadAvatar({ request, response, auth } :HttpContext) {
        const user = auth.user as User
        if (!user) return response.badRequest({ message: 'user not found' })

        const file = request.file('file', {
            extnames: ['png', 'jpg'],
            size: '5mb'
        })
        if (!file) return response.badRequest({
            error: [{ messages: 'No file provided' }]
        })

        if (!file.isValid) return response.badRequest({
            error: file.errors
        })
        await file.move(app.makePath(env.get('IMAGES_PATH')), {
            name: `${cuid()}.${file.extname}`
        })

        if (!file.fileName) return response.status(500).send({ message: 'Can not save file' })

        if (user.avatarUrl)
        {
            const path = app.makePath(env.get('IMAGES_PATH'), user.avatarUrl)
            fs.unlink(path, (err) => console.log('old file deleted: ', user.avatarUrl, err))
        }
        user.avatarUrl = file.fileName
        await user.save()
        return response.ok({ message: 'Avatar url updated' })
    }

    /**
     * @getAvatar
     * @tag profile
     * @description download profile avatar
     */
    async getAvatar({ request, response }: HttpContext){
        const targetUserId = request.param('userid');
        const user = await User.find(targetUserId)
        if (!user) return response.badRequest({ message: 'User not found' })
        const absolutePath = app.makePath(env.get('IMAGES_PATH'), user.avatarUrl || 'default.png')
        return response.download(absolutePath, false)
    }

    /**
     * @deleteAvatar
     * @tag profile
     * @description download profile avatar
     */
    async deleteAvatar({ response, auth }: HttpContext){
        const user = auth.user as User
        if (!user.avatarUrl) return response.badRequest({ message: 'No custom avatar picture'})
        const absolutePath = app.makePath(env.get('IMAGES_PATH'), user.avatarUrl)
        fs.unlink(absolutePath, () => null)
        user.avatarUrl = null
        await user.save()
        return response.ok({ message: 'Avatar deleted' })
    }
}
