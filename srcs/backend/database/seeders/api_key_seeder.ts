import ApiKey from '#models/api_key'
import { hashApiKey } from '#services/api_key_service'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

// This is the one seeded demo key for the public API module.
// It is intentionally fixed so evaluators and teammates can use it after seeding.
const DEMO_API_KEY_NAME = 'evaluation-demo'
export const DEMO_PUBLIC_API_KEY = 'transc-public-demo-key-2026'

export default class extends BaseSeeder {
  async run() {
    await ApiKey.updateOrCreate(
      { name: DEMO_API_KEY_NAME },
      {
        name: DEMO_API_KEY_NAME,
        keyHash: hashApiKey(DEMO_PUBLIC_API_KEY),
        isActive: true,
      }
    )
  }
}
