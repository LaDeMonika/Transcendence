import User from '#models/user'
import { userRegisterValidator, userLoginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  /**
   * @register
   * @tag auth
   * @description register new user
   * @requestBody <userRegisterValidator>
   */
  async register({ request }: HttpContext) {
    const body = request.only(['email', 'password', 'userName'])
    const validatedData = await userRegisterValidator.validate(body)
    if (!validatedData.userName) validatedData.userName = 'Guest'
    const user = await User.create(validatedData)
    const profile = await user.related('profile').create({
      avatarUrl: 'default.png'
    })
    console.log(profile.userId === user.id)
    return user.serializeAttributes(['id', 'email', 'userName'])
  }

  /**
   * @login
   * @tag auth
   * @description authenticate user and provide a access token
   * @requestBody <userLoginValidator>
   */
  async login({ request }: HttpContext) {
    const body = request.only(['email', 'password'])
    const validatedData = await userLoginValidator.validate(body)

    const user = await User.verifyCredentials(validatedData.email, validatedData.password)

    const token = await User.accessTokens.create(user)
    return token
  }

  /**
   * @index
   * @tag auth
   * @description List all users
   */
  async index() {
    return User.query().select(['id', 'email', 'user_name'])
  }
}
