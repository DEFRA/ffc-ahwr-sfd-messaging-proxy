import { inboundMessageSchema } from '../schemas/index.js'

export const validateMessageRequest = (logger, event) => {
  const { error } = inboundMessageSchema.validate(event, { abortEarly: false })
  if (error) {
    logger.error(`Inbound message validation error, with message: ${error}`)
    return false
  }
  return true
}
