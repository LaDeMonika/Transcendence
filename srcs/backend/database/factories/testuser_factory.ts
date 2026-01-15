import factory from '@adonisjs/lucid/factories'
import Testuser from '#models/testuser'

export const TestuserFactory = factory
  .define(Testuser, async ({ faker }) => {
    return {}
  })
  .build()
