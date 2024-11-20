import { set } from '../repositories/message-log-repository.js'
import { v4 as uuidv4 } from 'uuid'
import { sendSfdMessageRequest } from '../messaging/forward-message-request-to-sfd.js'
import { messageLogTableSchema } from '../schemas/index.js'
import { MESSAGE_RESULT_MAP, SOURCE_SYSTEM } from '../constants/index.js'

export const sendMessageToSingleFrontDoor = async (
  logger,
  inboundMessageQueueId,
  inboundMessage
) => {
  // inboundMessage validated prior to this

  const outboundMessage = buildOutboundMessage(uuidv4(), inboundMessage)

  const { success } = await sendMessageToSfd(logger, outboundMessage)

  await storeMessages(
    logger,
    inboundMessageQueueId,
    inboundMessage,
    outboundMessage,
    success
  )

  if (!success) {
    throw Error('See earlier error.')
  }

  return outboundMessage
}

export const buildOutboundMessage = (messageId, inboundMessage) => {
  const service = SOURCE_SYSTEM

  return {
    id: messageId,
    source: service,
    specversion: '1.0.2',
    type: 'uk.gov.ffc.ahwr.comms.request',
    datacontenttype: 'application/json',
    time: inboundMessage.dateTime.toString(),
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

const sendMessageToSfd = async (logger, outboundMessage) => {
  try {
    await sendSfdMessageRequest(outboundMessage)
    return { success: true }
  } catch (error) {
    logger.error(`Failed to send outbound message to single front door. ${error.message}`)
    return { success: false }
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
    templateId: inboundMessage.notifyTemplateId,
    data: {
      inboundMessageQueueId,
      inboundMessage,
      outboundMessage
    },
    status: outboundMessageSuccessful
      ? MESSAGE_RESULT_MAP.unknown
      : MESSAGE_RESULT_MAP.unsent,
    ...(inboundMessage.claimReference
      ? { claimReference: inboundMessage.claimReference }
      : {})
  }

  messageLogTableSchema.validate(databaseMessage, {
    abortEarly: false
  })

  try {
    await set(logger, databaseMessage)
    logger.info('Successfully stored message to database.')
  } catch (error) {
    const errorMessage = `Failed to save single front door message. ${error.message}`
    logger.error(errorMessage)
    throw new Error(errorMessage)
  }
}
