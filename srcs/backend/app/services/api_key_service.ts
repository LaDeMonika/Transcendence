import crypto from 'node:crypto'

export function generateApiKey() {
  return crypto.randomBytes(32).toString('hex')
}

export function hashApiKey(rawKey: string) {
  return crypto.createHash('sha256').update(rawKey).digest('hex')
}
