const Joi = require('joi')
const dbConfig = require('./db')
const messageQueueConfig = require('./message-queue')

const schema = Joi.object({
  port: Joi.number().default(3005),
  env: Joi.string().valid('development', 'test', 'production').default('development'),
  isDev: Joi.boolean().default(false),
  termsAndConditionsUrl: Joi.string().default('#'),
  applyServiceUri: Joi.string().default('#'),
  claimServiceUri: Joi.string().default('#'),
  endemics: Joi.object({
    enabled: Joi.boolean().default(false)
  })
})

const config = {
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  isDev: process.env.NODE_ENV === 'development',
  termsAndConditionsUrl: process.env.TERMS_AND_CONDITIONS_URL,
  applyServiceUri: process.env.APPLY_SERVICE_URI,
  claimServiceUri: process.env.CLAIM_SERVICE_URI,
  endemics: {
    enabled: process.env.ENDEMICS_ENABLED
  }
}

const { error, value } = schema.validate(config, { abortEarly: false })

if (error) {
  throw new Error(`The server config is invalid. ${error.message}`)
}

value.dbConfig = dbConfig
value.messageQueueConfig = messageQueueConfig

module.exports = value
