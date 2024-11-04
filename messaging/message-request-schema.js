const joi = require('joi')

const applicationMessageSchema = joi.object({
  crn: joi.string().max(14).required(),
  sbi: joi.string().max(14)
})

const validateMessageRequest = (logger, event) => {
  const validate = applicationMessageSchema.validate(event)
  if (validate.error) {
    logger.error('Message request validation error', JSON.stringify(validate.error))
    return false
  }
  return true
}

module.exports = {
  applicationMessageSchema,
  validateMessageRequest
}
