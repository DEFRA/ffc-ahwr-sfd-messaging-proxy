const joi = require('joi')

const crn = joi.number().min(1050000000).max(9999999999)
const sbi = joi.number().min(105000000).max(999999999).required()
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
      crn,
      sbi,
      sourceSystem: joi
        .string()
        .min(3)
        .max(100)
        .pattern(/^[a-z0-9-_]+$/)
        .required(),
      notifyTemplateId: joi.string().guid({ version: 'uuidv4' }).required(),
      commsType: 'email',
      commsAddress: email.required(),
      personalisation: joi.object().required(),
      reference: joi.string().min(1).max(100).required(),
      oneClickUnsubscribeUrl: joi.string().min(1),
      emailReplyToId: joi.string().guid({ version: 'uuidv4' })
    })
    .required()
})

const inboundMessageSchema = joi.object({
  crn,
  sbi,
  agreementReference: joi.string().required(),
  claimReference: joi.string().max(14),
  notifyTemplateId: joi.string().guid({ version: 'uuidv4' }).required(),
  emailAddress: email,
  customParams: joi.object().required(),
  dateTime: joi.date().required()
})

const messageLogTableSchema = joi.object({
  id: joi.string().guid({ version: 'uuidv4' }).required(),
  agreementReference: joi.string().max(14).required(),
  claimReference: joi.string().max(14),
  templateId: joi.string().guid({ version: 'uuidv4' }).required(),
  data: joi.object({
    inboundMessageQueueId: joi.string().required(),
    inboundMessage: inboundMessageSchema.required(),
    outboundMessage: outboundMessageSchema.required()
  }).required(),
  status: joi.string().max(50).required()
})

module.exports = {
  inboundMessageSchema,
  messageLogTableSchema,
  outboundMessageSchema
}
