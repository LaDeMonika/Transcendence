import Testuser from '#models/testuser'
import type { HttpContext } from '@adonisjs/core/http'

export default class TestusersController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    return Testuser.all()
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {
    return Testuser.create(request.body())
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
