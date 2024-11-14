import joi from 'joi'
import appInsights from 'applicationinsights'

const msgTypePrefix = 'uk.gov.ffc.ahwr'

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
  },
  sfdMessageTopic: {
    address: joi.string(),
    ...sharedConfigSchema
  },
  sfdMessageRequestMsgType: joi.string()
})

const sharedConfig = {
  appInsights,
  host: process.env.MESSAGE_QUEUE_HOST,
  password: process.env.MESSAGE_QUEUE_PASSWORD,
  username: process.env.MESSAGE_QUEUE_USER,
  useCredentialChain: process.env.NODE_ENV === 'production'
}

const combinedConfig = {
  sfdMessageRequestQueue: {
    address: process.env.SFDMESSAGEREQUEST_QUEUE_ADDRESS,
    type: 'queue',
    ...sharedConfig
  },
  sfdMessageTopic: {
    address: process.env.SFDMESSAGE_TOPIC_ADDRESS,
    ...sharedConfig
  },
  sfdMessageRequestMsgType: `${msgTypePrefix}.submit.sfd.message.request`
}

const { error } = schema.validate(combinedConfig, { abortEarly: false })

if (error) {
  throw new Error(`The message queue config is invalid. ${error.message}`)
}

export const config = combinedConfig
