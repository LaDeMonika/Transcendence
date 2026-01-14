import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new testuser.
 */
export const testuserValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .unique(async (db, value, _field) => {
        const result = await db.from('testusers').select('id').where('email', value)
        return result.length ? false : true
      }),
    password: vine.string().minLength(7),
  })
)

/**
 * Validator to validate the payload when creating
 * a new testuser.
 */
export const testuserUpdateValidator = vine.compile(
  vine.object({
    id: vine.number().exists(async (db, value) => {
      const result = await db.from('testusers').select('id').where('id', value)
      return result.length ? true : false
    }),
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .unique(async (db, value, _field) => {
        const result = await db.from('testusers').select('id').where('email', value)
        return result.length ? false : true
      }),
    password: vine.string().minLength(7),
  })
)
