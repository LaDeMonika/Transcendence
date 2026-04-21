import type { HttpContext } from '@adonisjs/core/http'
import { hashApiKey } from '#services/api_key_service'

type Bucket = {
  count: number
  resetAt: number
}

// currently one per minute to keep it simple, but this could be extended
const buckets = new Map<string, Bucket>()
const WINDOW_MS = 60 * 1000
const LIMIT = 1

export default class PublicApiRateLimitMiddleware {
  async handle({ request, response }: HttpContext, next: () => Promise<void>) {
    const rawKey = request.header('x-api-key')

    if (!rawKey) {
      return response.unauthorized({ error: 'Missing API key' })
    }

    const bucketKey = hashApiKey(rawKey)
    const now = Date.now()
    const existing = buckets.get(bucketKey)

    if (!existing || existing.resetAt <= now) {
      buckets.set(bucketKey, { count: 1, resetAt: now + WINDOW_MS })
      response.header('X-RateLimit-Limit', String(LIMIT))
      response.header('X-RateLimit-Remaining', String(LIMIT - 1))
      return next()
    }

    if (existing.count >= LIMIT) {
      response.header('X-RateLimit-Limit', String(LIMIT))
      response.header('X-RateLimit-Remaining', '0')
      response.header('Retry-After', String(Math.ceil((existing.resetAt - now) / 1000)))
      return response.status(429).send({ error: 'Rate limit exceeded' })
    }

    existing.count += 1
    response.header('X-RateLimit-Limit', String(LIMIT))
    response.header('X-RateLimit-Remaining', String(Math.max(LIMIT - existing.count, 0)))

    await next()
  }
}
