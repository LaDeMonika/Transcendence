import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when
 * a new user registers.
 */
export const userRegisterValidator = vine.compile(
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
    userName: vine.string().optional(),
  })
)

/**
 * Validator to validate the payload when
 * user signs in.
 */
export const userLoginValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .exists(async (db, value, _field) => {
        const result = await db.from('testusers').select('id').where('email', value)
        return result.length ? false : true
      }),
    password: vine.string().minLength(7),
  })
)

/**
 * Validator to change password the payload when
 * user wants to change password.
 */
export const userChangePasswordValidator = vine.compile(
  vine.object({
    oldPassword: vine.string().minLength(7),
    newPassword: vine.string().minLength(7),
  })
)
