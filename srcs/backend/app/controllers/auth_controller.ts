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
    return User.create(body)
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

    // const body = request.only(['email', 'password'])
    // const validatedData = await userLoginValidator.validate(body)
    // // generate token and send it to user
    // const user = await User.query()
    //   .where('email', validatedData.email)
    //   .where('password', validatedData.password)
    //   .first()
    // if (!user) return { message: 'user not found' }
    // const token = await User.accessTokens.create(user)
    // console.log(token)
    // return token
    // // return {
    // //   type: 'Bearer',
    // //   value: token.value!.release(),
    // // }
  }
  /**
   * @index
   * @tag auth
   * @description List all users
   */
  async index() {
    return User.query()
  }
}
