const { inboundMessageSchema } = require('../schemas/index')

const validateMessageRequest = (logger, event) => {
  const validate = inboundMessageSchema.validate(event)
  if (validate.error) {
    logger.error(
      'Message request validation error',
      JSON.stringify(validate.error)
    )
    return false
  }
  return true
}

module.exports = {
  validateMessageRequest
}
