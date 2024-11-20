import { sendMessageToSingleFrontDoor } from '../services/message-service.js'
import { validateMessageRequest } from './message-request-schema.js'

export const processMessageRequest = async (logger, message, receiver) => {
  try {
    logger.warn(`Received sfd message request with id: ${message.messageId}`)

    if (!validateMessageRequest(logger, message.body)) {
      await receiver.deadLetterMessage(message) // not worth retrying, invalid input
      return
    }

    await sendMessageToSingleFrontDoor(logger, message.messageId, message.body)
    await receiver.completeMessage(message)
  } catch (error) {
    logger.error({ err: error }, 'Message processing failed')
    await receiver.deadLetterMessage(message) // worth retrying, abandonMessage in future?
  }
}
