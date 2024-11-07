const { v4: uuidv4 } = require('uuid')
const { set } = require('../repositories/message-log-repository')
const { sendSfdMessageRequest } = require('../messaging/forward-message-request-to-sfd')
const { logAndThrowError } = require('../logging/index')
const { inboundMessageSchema, messageLogTableSchema } = require('../schemas/index')
const { sourceSystem } = require('../constants/index')

const sendMessageToSingleFrontDoor = async (logger, inboundMessageQueueId, inboundMessage) => {
  validateInboundMessage(logger, inboundMessage)

  const outboundMessage = buildOutboundMessage(inboundMessage)

  await storeMessages(logger, inboundMessageQueueId, inboundMessage, outboundMessage)

  await sendMessageToSfd(logger, outboundMessage)

  return outboundMessage // does this function need to return anything?
}

const validateInboundMessage = (logger, inboundMessage) => {
  const { error } = inboundMessageSchema.validate(inboundMessage, {
    abortEarly: false
  })

  if (error) {
    const errorMessage = `The inbound message is invalid. ${error.message}`
    logAndThrowError(errorMessage, logger)
  }
}

const buildOutboundMessage = (inboundMessage) => {
  const service = sourceSystem
  const messageId = uuidv4()

  return {
    id: messageId,
    source: service,
    specversion: '1.0.2',
    type: 'uk.gov.ffc.ahwr.comms.request', // maybe ffc-ahwp?
    datacontenttype: 'application/json',
    time: new Date(),
    data: {
      crn: inboundMessage.crn,
      sbi: inboundMessage.sbi,
      sourceSystem: service, // Does this need to be in the data as well as in the root level object?
      notifyTemplateId: uuidv4(),
      commsType: 'email',
      commsAddress: 'an@email.com', // This should maybe always be an array, rather than optionally being an array
      personalisation: {},
      reference: `${service}-${messageId}`
    }
  }
}

const storeMessages = async (logger, inboundMessageQueueId, inboundMessage, outboundMessage) => {
  const databaseMessage = {
    id: outboundMessage.id,
    agreementReference: inboundMessage.agreementReference,
    claimReference: inboundMessage.crn + '',
    templateId: 'fake-template-1',
    data: {
      inboundMessageQueueId,
      inboundMessage,
      outboundMessage
    }
  }

  const { error } = messageLogTableSchema.validate(databaseMessage, {
    abortEarly: false
  })

  if (error) {
    const errorMessage = `The message log database item is invalid. ${error.message}`
    logAndThrowError(errorMessage, logger)
  }

  try {
    await set(logger, databaseMessage)
  } catch (error) {
    const errorMessage = `Failed to save single front door message. ${error.message}`
    logAndThrowError(errorMessage, logger)
  }
}

const sendMessageToSfd = async (logger, outboundMessage) => {
  try {
    sendSfdMessageRequest(outboundMessage)
  } catch (error) {
    const errorMessage = `Failed to send outbound message to single front door. ${error.message}`
    logAndThrowError(errorMessage, logger)
  }
}

module.exports = {
  sendMessageToSingleFrontDoor
}
