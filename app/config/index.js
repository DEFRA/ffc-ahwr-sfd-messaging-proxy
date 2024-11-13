import joi from 'joi'
import dbConfig from './db.js'
import messageQueueConfig from './message-queue.js'

const schema = joi.object({
  port: joi.number(),
  env: joi.string().valid('development', 'test', 'production').default('development'),
  isDev: joi.boolean().default(false),
  termsAndConditionsUrl: joi.string().default('#'),
  applyServiceUri: joi.string().default('#'),
  claimServiceUri: joi.string().default('#')
})

const baseConfig = {
  port: process.env.PORT ? Number(process.env.PORT) : undefined,
  env: process.env.NODE_ENV,
  isDev: process.env.NODE_ENV === 'development',
  termsAndConditionsUrl: process.env.TERMS_AND_CONDITIONS_URL,
  applyServiceUri: process.env.APPLY_SERVICE_URI,
  claimServiceUri: process.env.CLAIM_SERVICE_URI
}

const { error } = schema.validate(baseConfig, { abortEarly: false })

if (error) {
  throw new Error(`The server config is invalid. ${error.message}`)
}

export const config = { ...baseConfig, dbConfig, messageQueueConfig }
