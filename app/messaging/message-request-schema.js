import { inboundMessageSchema } from '../schemas/index.js'

export const validateMessageRequest = (logger, event) => {
  const validate = inboundMessageSchema.validate(event)
  if (validate.error) {
    logger.error(
      `Message request validation error, message: ${validate.error}`
    )
    return false
  }
  return true
}
