import { inboundMessageSchema } from '../schemas/index.js'

export const validateMessageRequest = (logger, event) => {
  const { error } = inboundMessageSchema.validate(event, { abortEarly: false })
  if (error) {
    logger.setBindings({ validationError: { details: error.details } })
    return false
  }
  return true
}
