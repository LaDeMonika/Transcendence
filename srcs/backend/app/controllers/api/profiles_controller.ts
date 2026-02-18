import User from '#models/user'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export default class ProfilesController {
    async privateProfile({ auth }: HttpContext) {
        const authenticatedUser = auth.user as User
        const user = await User.find(authenticatedUser.id)
        await user!.load('profile')
        return user!.profile.serialize()
    }

    userProfile(ctx: HttpContext) {
        return ctx.response.ok({ message: "request got public profile" })
    }
    
    update(ctx: HttpContext) {
        return ctx.response.ok({ message: "request got update profile" })
    }

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
        await file.move(app.makePath('public/avatars'), {
            name: `${cuid()}.${file.extname}`
        })

        if (!file.fileName) return response.status(500).send({ message: 'Can not save file' })

        await user.load('profile')
        user.profile.avatarUrl = file.fileName
        await user.profile.save()
        return response.ok({ message: 'Avatar url updated' })
    }

    async getAvatar({ response, auth }: HttpContext){
        const authenticatedUser = auth.user as User
        const user = await User.find(authenticatedUser.id)
        if (!user) return response.badRequest({ message: 'User not found' })
        await user.load('profile')
        console.log(user.profile.avatarUrl)
        const absolutePath = app.makePath('public/avatars', user.profile.avatarUrl)
        console.log(absolutePath)
        return response.download(absolutePath)
    }
}
