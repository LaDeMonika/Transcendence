// User Controller
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class UserController {
    // GET /api/users
    public async index() {
        const users = await User.query().select('id', 'userName')
        return users
    }

    // GET /api/user/:id
    public async show({ params }: HttpContext) {
        const { id } = params
        const user = await User.query().where('id', id).select('id', 'userName').firstOrFail()
        return user
    }

    // GET /api/search-users?query=someName
    public async search({ request }: HttpContext) {
        const { query } = request.only(['query'])
        const users = await User.query().select('id', 'userName').where('userName', 'like', `%${query}%`)
        return users
    }

    // POST /api/update-username
    public async updateUsername({ request, auth, response }: HttpContext) {
        const { newUsername } = request.only(['newUsername'])
        const user = await auth.authenticate() as User

        // Check if the new username is already taken
        const existingUser = await User.query().where('userName', newUsername).first()
        if (existingUser) {
            return response.badRequest({ error: 'Username is already taken' })
        }

        user.userName = newUsername
        await user.save()
        return { id: user.id, userName: user.userName }
    }

    // DELETE /api/user
    public async destroy({ auth }: HttpContext) {
        const user = await auth.authenticate() as User
        await user.delete()
        return { message: 'User deleted successfully' }
    }
}