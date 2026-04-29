export const CHAT_MESSAGE_MAX_LENGTH = 255

export function getChatMessageLengthError(maxLength = CHAT_MESSAGE_MAX_LENGTH) {
  return `Message is too long. Maximum length is ${maxLength} characters.`
}
