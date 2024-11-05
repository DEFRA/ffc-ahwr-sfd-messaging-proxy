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
  const outboundMessage = buildOutboundMessage(messageId, appMessage)

  const databaseMessage = {
    id: messageId,
    agreementReference: appMessage.crn,
    claimReference: 'fake-claim-1',
    templateId: 'fake-template-1',
    data: outboundMessage
  }

  await storeMessages(logger, appMessage, databaseMessage)

  await sendMessageToSfd(logger, outboundMessage)

  return outboundMessage // does this function need to return anything?
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

const buildOutboundMessage = (messageId, appMessage) => {
  const service = 'ffc-ahwr' // maybe ffc-ahwp?

  const data = {
    id: messageId,
    source: service,
    specversion: '1.0',
    type: 'uk.gov.ffc.ahwr.comms.request', // maybe ffc-ahwp?
    datacontenttype: 'application/json',
    time: new Date(),
    data: {
      crn: appMessage.crn,
      sbi: appMessage.sbi,
      sourceSystem: service, // Does this need to be in the data as well as in the root level object?
      notifyTemplateId: 'uuid',
      commsType: 'email',
      commsAddress: 'an@email.com', // This should maybe always be an array, rather than optionally being an array
      personalisation: {},
      reference: `${service}-${messageId}`,
      oneClickUnsubscribeUrl: 'https://unsubscribe.example.com',
      emailReplyToId: uuidv4()
    }
  }

  return data
}

const storeMessages = async (logger, appMessage, databaseMessage) => {
  const { error } = messageLogTableSchema.validate(databaseMessage, {
    abortEarly: false
  })

  if (error) {
    const errorMessage = `The single front door message is invalid. ${error.message}`
    logAndThrowError(errorMessage, logger)
  }

  try {
    await set(logger, databaseMessage)
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
