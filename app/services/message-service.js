const { v4: uuidv4 } = require('uuid')
const joi = require('joi')
const { applicationMessageSchema } = require('../messaging/message-request-schema')
const { set } = require('../repositories/message-log-repository')
const { sendSfdMessageRequest } = require('../messaging/forward-message-request-to-sfd')

const messageLogSchema = joi.object({
  id: joi.string().guid({ version: 'uuidv4' }).required(),
  agreementReference: joi.string().max(14).required(),
  claimReference: joi.string().max(14),
  templateId: joi.string().max(50).required(),
  data: joi.object().required(), // TODO AHWR-183 impl
  status: joi.string().max(50)
})

const sendMessageToSingleFrontDoor = async (logger, appMessage) => {
  validateInboundMessage(logger, appMessage)

  const messageId = generateMessageId()
  const sfdMessage = buildSfdMessageFrom(messageId, appMessage)

  await storeMessages(logger, appMessage, sfdMessage)

  await sendMessageToSfd(logger, sfdMessage)
  return sfdMessage
}

const validateInboundMessage = (logger, appMessage) => {
  const { error } = applicationMessageSchema.validate(appMessage, { abortEarly: false })
  if (error) {
    logger.error(`The application message is invalid. ${error.message}`)
    throw new Error(`The application message is invalid. ${error.message}`)
  }
}

const generateMessageId = () => {
  return uuidv4()
}

const buildSfdMessageFrom = (messageId, appMessage) => {
  let data
  if (appMessage.sbi) {
    data = { ...appMessage }
  }

  return {
    id: messageId,
    agreementReference: appMessage.crn,
    claimReference: 'fake-claim-1',
    templateId: 'fake-template-1',
    data
  }
}

const storeMessages = async (logger, appMessage, sfdMessage) => {
  const { error } = messageLogSchema.validate(sfdMessage, { abortEarly: false })
  if (error) {
    logger.error(`The single front door message is invalid. ${error.message}`)
    throw new Error(`The single front door message is invalid. ${error.message}`)
  }

  try {
    await set(logger, sfdMessage)
  } catch (error) {
    logger.error(`Failed to save single front door message. ${error.message}`)
    throw new Error(`Failed to save single front door message. ${error.message}`)
  }
}

const sendMessageToSfd = async (logger, sfdMessage) => {
  try {
    sendSfdMessageRequest(sfdMessage)
  } catch (error) {
    logger.error(`Failed to send message to single front door. ${error.message}`)
    throw new Error(`Failed to send message to single front door. ${error.message}`)
  }
}

module.exports = {
  sendMessageToSingleFrontDoor
}
