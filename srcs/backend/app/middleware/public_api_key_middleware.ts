import type { HttpContext } from '@adonisjs/core/http'
import ApiKey from '#models/api_key'
import { DateTime } from 'luxon'
import { hashApiKey } from '#services/api_key_service'

export default class PublicApiKeyMiddleware {
  async handle({ request, response }: HttpContext, next: () => Promise<void>) {
    const rawKey = request.header('x-api-key')

    if (!rawKey) {
      return response.unauthorized({ error: 'Missing API key' })
    }

    const apiKey = await ApiKey.query()
      .where('key_hash', hashApiKey(rawKey))
      .where('is_active', true)
      .first()

    if (!apiKey) {
      return response.unauthorized({ error: 'Invalid API key' })
    }

    apiKey.lastUsedAt = DateTime.now()
    await apiKey.save()

    await next()
  }
}
