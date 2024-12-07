import { sendMessageToSingleFrontDoor } from '../services/message-service.js'
import { validateMessageRequest } from './message-request-schema.js'

export const processMessageRequest = async (logger, message, receiver) => {
  try {
    logger.setBindings({ inboundMessageId: message.messageId })

    const persistentErrorOccurred = !validateMessageRequest(logger, message.body)
    if (persistentErrorOccurred) {
      await receiver.deadLetterMessage(message)
      logger.error('Message validation failed')
      return
    }

    await sendMessageToSingleFrontDoor(logger, message.messageId, message.body)

    await receiver.completeMessage(message)
    logger.info('Message processing successful')
  } catch (error) {
    logger.setBindings({ processingError: `${error}` })
    logger.error('Message processing failed')
    await receiver.deadLetterMessage(message)
  }
}
