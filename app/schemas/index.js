const joi = require('joi')

const nineDigitId = joi.number().min(105000000).max(999999999)
const email = joi
  .string()
  .pattern(/^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  .min(1)
  .max(320)

const outboundMessageSchema = joi.object({
  id: joi.string().guid({ version: 'uuidv4' }).required(),
  source: joi.string().min(1).max(100).required(),
  specversion: joi.string().min(3).max(10).required(),
  type: joi.string().min(3).max(250).required(),
  datacontenttype: joi.string(),
  time: joi.date(),
  data: joi
    .object({
      crn: nineDigitId.required(),
      sbi: nineDigitId.required(),
      sourceSystem: joi
        .string()
        .min(3)
        .max(100)
        .pattern(/^[a-z0-9-_]+$/)
        .required(),
      notifyTemplateId: joi.string().guid({ version: 'uuidv4' }).required(),
      commsType: 'email',
      commsAddress: joi.alternatives().try(email, joi.array().items(email)),
      personalisation: joi.object().required(),
      reference: joi.string().min(1).max(100).required(),
      oneClickUnsubscribeUrl: joi.string().min(1),
      emailReplyToId: joi.string().guid({ version: 'uuidv4' })
    })
    .required()
})

const messageLogTableSchema = joi.object({
  id: joi.string().guid({ version: 'uuidv4' }).required(),
  agreementReference: joi.string().max(14).required(),
  claimReference: joi.string().max(14),
  templateId: joi.string().max(50).required(),
  data: outboundMessageSchema.required(),
  status: joi.string().max(50)
})

const inboundMessageSchema = joi.object({
  crn: nineDigitId.required(),
  sbi: nineDigitId.required(),
  agreementReference: joi.string().required(),
  claimReference: joi.string().max(14),
  notifyTemplateId: joi.string().guid({ version: 'uuidv4' }).required(),
  emailAddresses: joi.alternatives().try(email, joi.array().items(email)).required(),
  customParams: joi.array().required()
})

module.exports = {
  inboundMessageSchema,
  messageLogTableSchema,
  outboundMessageSchema,
  nineDigitId
}
