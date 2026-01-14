import Testuser from '#models/testuser'
import { testuserUpdateValidator, testuserValidator } from '#validators/testuser'
import type { HttpContext } from '@adonisjs/core/http'

export default class TestusersController {
  /**
   * @index
   * @tag testuser
   * @description Display a list of resource
   */
  async index({}: HttpContext) {
    return Testuser.all()
  }

  /**
   * @store
   * @tag testuser
   * @description Store a record
   * @requestBody <testuserValidator>
   */
  async store({ request }: HttpContext) {
    const data = request.only(['email', 'password'])
    const validatedData = await testuserValidator.validate(data)
    return Testuser.create(validatedData)
  }

  /**
   * @show
   * @tag testuser
   * @description Show individual record
   * @param recordId
   */
  async show({ params }: HttpContext) {
    return Testuser.query().where({ id: params.id })
  }

  /**
   * @update
   * @tag testuser
   * @description Handle form submission for the edit action
   * @requestBody <testuserUpdateValidator>
   */
  async update({ request }: HttpContext) {
    // extract body
    const data = request.only(['id', 'email', 'password'])

    // validate form
    const validatedData = await testuserUpdateValidator.validate(data)

    // find current testuser
    const user = await Testuser.findOrFail(validatedData.id)

    // update data
    user.id = validatedData.id
    user.email = validatedData.email
    user.password = validatedData.password

    // save updated user
    return await user.save()
  }

  /**
   * @destroy
   * @tag testuser
   * @description Delete record
   * @param recordId
   */
  async destroy({ params }: HttpContext) {
    const user = await Testuser.findOrFail(params.id)
    if (user !== null) await user.delete()
  }
}
