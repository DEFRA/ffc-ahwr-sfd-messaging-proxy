const { v4: uuidv4 } = require('uuid')
const { set } = require('../repositories/message-log-repository')
const {
  sendSfdMessageRequest
} = require('../messaging/forward-message-request-to-sfd')
const { logAndThrowError } = require('../logging/index')
const {
  inboundMessageSchema,
  messageLogTableSchema
} = require('../schemas/index')
const { SOURCE_SYSTEM, MESSAGE_RESULT_MAP } = require('../constants/index')

const sendMessageToSingleFrontDoor = async (
  logger,
  inboundMessageQueueId,
  inboundMessage
) => {
  validateInboundMessage(logger, inboundMessage)

  const outboundMessage = buildOutboundMessage(inboundMessage)

  const { success } = await sendMessageToSfd(logger, outboundMessage)

  await storeMessages(
    logger,
    inboundMessageQueueId,
    inboundMessage,
    outboundMessage,
    success
  )

  return outboundMessage
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
  const service = SOURCE_SYSTEM
  const messageId = uuidv4()

  return {
    id: messageId,
    source: service,
    specversion: '1.0.2',
    type: 'uk.gov.ffc.ahwr.comms.request', // maybe ffc-ahwp?
    datacontenttype: 'application/json',
    time: inboundMessage.dateTime,
    data: {
      crn: inboundMessage.crn,
      sbi: inboundMessage.sbi,
      sourceSystem: service,
      notifyTemplateId: inboundMessage.notifyTemplateId,
      commsType: 'email',
      commsAddress: inboundMessage.emailAddress,
      personalisation: inboundMessage.customParams,
      reference: `${service}-${messageId}`
    }
  }
}

const storeMessages = async (
  logger,
  inboundMessageQueueId,
  inboundMessage,
  outboundMessage,
  outboundMessageSuccessful
) => {
  const databaseMessage = {
    id: outboundMessage.id,
    agreementReference: inboundMessage.agreementReference,
    claimReference: inboundMessage.crn.toString(),
    templateId: inboundMessage.notifyTemplateId,
    data: {
      inboundMessageQueueId,
      inboundMessage,
      outboundMessage
    },
    status: outboundMessageSuccessful
      ? MESSAGE_RESULT_MAP.sent
      : MESSAGE_RESULT_MAP.failed
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
    return { success: true }
  } catch (error) {
    logger.error(
      `Failed to send outbound message to single front door. ${error.message}`
    )
    return { success: false }
  }
}

module.exports = {
  sendMessageToSingleFrontDoor,
  storeMessages
}