const joi = require('joi')

const nineDigitId = joi.string().min(105000000).max(999999999).required()
const email = joi
  .string()
  .pattern(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(\\.[a-zA-Z]{2,})?$/
  )
  .min(1)
  .max(320)

const outboundSfdMessageSchema = joi.object({
  id: joi.string().guid({ version: 'uuidv4' }).required(),
  source: joi.string().min(1).max(100).required(),
  specversion: joi.string().min(3).max(10).required(),
  type: joi.string.min(3).max(250).required(),
  datacontenttype: joi.string(),
  time: joi.date(),
  data: joi
    .object({
      crn: nineDigitId,
      sbi: nineDigitId,
      sourceSystem: joi
        .string()
        .min(3)
        .max(100)
        .pattern(/^[a-z0-9-_]+$/)
        .required(),
      notifyTemplateId: joi.string().guid({ version: 'uuidv4' }).required(),
      commsType: 'email',
      commsAddress: joi.alternatives().try(email, joi.array().items(email))
    })
    .required()
})

const messageLogTableSchema = joi.object({
  id: joi.string().guid({ version: 'uuidv4' }).required(),
  agreementReference: joi.string().max(14).required(),
  claimReference: joi.string().max(14),
  templateId: joi.string().max(50).required(),
  data: outboundSfdMessageSchema.required(),
  status: joi.string().max(50)
})

const inboundMessageSchema = joi.object({
  crn: nineDigitId,
  sbi: nineDigitId
})

module.exports = {
  inboundMessageSchema,
  messageLogTableSchema,
  outboundSfdMessageSchema,
  nineDigitId
}
