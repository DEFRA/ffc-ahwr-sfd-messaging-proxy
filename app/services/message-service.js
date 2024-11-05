const { v4: uuidv4 } = require('uuid')
const { inboundMessageSchema } = require('../messaging/message-request-schema')
const { set } = require('../repositories/message-log-repository')
const {
  sendSfdMessageRequest
} = require('../messaging/forward-message-request-to-sfd')
const { logAndThrowError } = require('../logging/index')
const { messageLogTableSchema } = require('../schemas/index')

const sendMessageToSingleFrontDoor = async (logger, appMessage) => {
  validateInboundMessage(logger, appMessage)

  const messageId = uuidv4()
  const sfdMessage = buildSfdMessageFrom(messageId, appMessage)

  await storeMessages(logger, appMessage, sfdMessage)

  await sendMessageToSfd(logger, sfdMessage)

  return sfdMessage
}

const validateInboundMessage = (logger, appMessage) => {
  const { error } = inboundMessageSchema.validate(appMessage, {
    abortEarly: false
  })

  if (error) {
    const errorMessage = `The application message is invalid. ${error.message}`
    logAndThrowError(errorMessage, logger)
  }
}

const buildSfdMessageFrom = (messageId, appMessage) => {
  const data = {
    crn: appMessage.crn,
    sbi: appMessage.sbi,
    sourceSystem: 'SOMEWHERE'
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
  const { error } = messageLogTableSchema.validate(sfdMessage, {
    abortEarly: false
  })
  if (error) {
    const errorMessage = `The single front door message is invalid. ${error.message}`
    logAndThrowError(errorMessage, logger)
  }

  try {
    await set(logger, sfdMessage)
  } catch (error) {
    const errorMessage = `Failed to save single front door message. ${error.message}`
    logAndThrowError(errorMessage, logger)
  }
}

const sendMessageToSfd = async (logger, sfdMessage) => {
  try {
    sendSfdMessageRequest(sfdMessage)
  } catch (error) {
    const errorMessage = `Failed to send message to single front door. ${error.message}`
    logAndThrowError(errorMessage, logger)
  }
}

module.exports = {
  sendMessageToSingleFrontDoor
}
