import User from '#models/user'
import {
  userRegisterValidator,
  userLoginValidator,
  userChangePasswordValidator,
} from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

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
   * @changePassword
   * @tag auth
   * @description changes password
   * @requestBody <userChangePasswordValidator>
   */
  async changePassword({ request, response, auth }: HttpContext) {
    const data = request.only(['oldPassword', 'newPassword'])
    const validatedData = await userChangePasswordValidator.validate(data)
    const authenticatedUser = auth.user as User
    const isMatched = await hash.verify(authenticatedUser.password, validatedData.oldPassword)
    console.log(isMatched)
    if (!isMatched) return response.badRequest({ errors: [{ message: 'Password did not match' }] })
    authenticatedUser.password = validatedData.newPassword
    await authenticatedUser.save()
    return response.ok({ message: 'Password changed successfully' })
  }

  /**
   * @logout
   * @tag auth
   * @description remove current access token
   */
  async logout({ response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    return response.ok({ message: 'Logged out successfully' })
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
