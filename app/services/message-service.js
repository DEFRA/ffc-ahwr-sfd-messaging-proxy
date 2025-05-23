import { set, update } from '../repositories/message-log-repository.js'
import { v4 as uuidv4 } from 'uuid'
import { sendSfdMessageRequest } from '../messaging/forward-message-request-to-sfd.js'
import { messageLogTableSchema, outboundMessageSchema } from '../schemas/index.js'
import { MESSAGE_RESULT_MAP, SOURCE_SYSTEM } from '../constants/index.js'
import { config } from '../config/index.js'

export const sendMessageToSingleFrontDoor = async (
  logger,
  inboundMessageQueueId,
  inboundMessage
) => {
  const outboundMessageId = uuidv4()
  logger.setBindings({ outboundMessageId })
  const outboundMessage = buildOutboundMessage(outboundMessageId, inboundMessage)

  await storeMessage(
    logger,
    inboundMessageQueueId,
    inboundMessage,
    outboundMessage
  )

  const { success } = await sendMessageToSfd(logger, outboundMessage)

  await updateMessageLog(outboundMessageId, success)

  if (!success) {
    throw Error('Failed to send outbound message to SFD')
  }

  return outboundMessage
}

export const buildOutboundMessage = (messageId, inboundMessage) => {
  const service = SOURCE_SYSTEM
  const defaultSfdEmailReplyToId = config.sfdEmailReplyToId

  const outboundMessage = {
    id: messageId,
    source: service,
    specversion: '2.0.0',
    type: 'uk.gov.ffc.ahwr.comms.request',
    datacontenttype: 'application/json',
    time: inboundMessage.dateTime.toString(),
    data: {
      crn: inboundMessage.crn,
      sbi: inboundMessage.sbi,
      sourceSystem: service,
      notifyTemplateId: inboundMessage.notifyTemplateId,
      commsType: 'email',
      commsAddresses: inboundMessage.emailAddress,
      personalisation: inboundMessage.customParams,
      reference: `${service}-${messageId}`,
      emailReplyToId: inboundMessage.emailReplyToId ?? defaultSfdEmailReplyToId
    }
  }

  const { error } = outboundMessageSchema.validate(outboundMessage, { abortEarly: false })
  if (error) {
    throw new Error(`The outbound message is invalid. ${error.message}`)
  }

  return outboundMessage
}

const sendMessageToSfd = async (logger, outboundMessage) => {
  try {
    await sendSfdMessageRequest(outboundMessage)
    return { success: true }
  } catch (error) {
    logger.setBindings({ sfdCommunicationError: error })
    return { success: false }
  }
}

const storeMessage = async (
  logger,
  inboundMessageQueueId,
  inboundMessage,
  outboundMessage
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
    status: MESSAGE_RESULT_MAP.unknown,
    ...(inboundMessage.claimReference
      ? { claimReference: inboundMessage.claimReference }
      : {})
  }

  messageLogTableSchema.validate(databaseMessage, {
    abortEarly: false
  })

  try {
    await set(databaseMessage)
    logger.setBindings({ messageLogCreatedWithId: databaseMessage.id })
  } catch (error) {
    throw new Error(`Failed to save message log. ${error.message}`)
  }
}

const updateMessageLog = async (messageId, outboundMessageSuccessful) => {
  try {
    await update(messageId, {
      status: outboundMessageSuccessful
        ? MESSAGE_RESULT_MAP.requested
        : MESSAGE_RESULT_MAP.unsent
    })
  } catch (error) {
    throw new Error(`Failed to update message log. ${error.message}`)
  }
}
