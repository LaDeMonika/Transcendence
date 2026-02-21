import vine from '@vinejs/vine'

export const createConversationValidator = vine.compile(
  vine.object({
    otherUserId: vine.number(),
  })
)
