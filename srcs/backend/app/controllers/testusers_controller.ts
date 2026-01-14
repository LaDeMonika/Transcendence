import Testuser from '#models/testuser'
import { testuserValidator } from '#validators/testuser'
import type { HttpContext } from '@adonisjs/core/http'

export default class TestusersController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    return Testuser.all()
  }

  /**
   * @store
   * @requestBody <testuserValidator>
   */
  async store({ request }: HttpContext) {
    const data = request.only(['email', 'password'])
    const validatedData = await testuserValidator.validate(data)
    return Testuser.create(validatedData)
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return Testuser.query().where({ id: params.id })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {
    const user = await Testuser.findOrFail(params.id)
    if (user !== null) await user.delete()
  }
}
