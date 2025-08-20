import joi from 'joi'
import { config as dbConfig } from './db.js'
import { config as messageQueueConfig } from './message-queue.js'

export const buildConfig = () => {
  const schema = joi.object({
    port: joi.number(),
    env: joi.string().valid('development', 'test', 'production').default('development'),
    isDev: joi.boolean().default(false),
    sfdEmailReplyToId: joi.string().guid({ version: 'uuidv4' }).required()
  })

  const baseConfig = {
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    env: process.env.NODE_ENV,
    isDev: process.env.NODE_ENV === 'development',
    sfdEmailReplyToId: process.env.SFD_EMAIL_REPLYTO_ID
  }

  const { error } = schema.validate(baseConfig, { abortEarly: false })

  if (error) {
    throw new Error(`The server config is invalid. ${error.message}`)
  }

  return { ...baseConfig, dbConfig, messageQueueConfig }
}

export const config = buildConfig()
