const joi = require('joi')

const sharedConfigSchema = {
  appInsights: joi.object(),
  host: joi.string(),
  password: joi.string(),
  username: joi.string(),
  useCredentialChain: joi.bool().default(false)
}

const schema = joi.object({
  sfdMessageRequestQueue: {
    address: joi.string(),
    type: joi.string(),
    ...sharedConfigSchema
  }
})

const sharedConfig = {
  appInsights: require('applicationinsights'),
  host: process.env.MESSAGE_QUEUE_HOST,
  password: process.env.MESSAGE_QUEUE_PASSWORD,
  username: process.env.MESSAGE_QUEUE_USER,
  useCredentialChain: process.env.NODE_ENV === 'production'
}

const config = {
  sfdMessageRequestQueue: {
    address: process.env.SFDMESSAGEREQUEST_QUEUE_ADDRESS,
    type: 'queue',
    ...sharedConfig
  }
}

const { error, value } = schema.validate(config, { abortEarly: false })

if (error) {
  throw new Error(`The message queue config is invalid. ${error.message}`)
}

module.exports = value
