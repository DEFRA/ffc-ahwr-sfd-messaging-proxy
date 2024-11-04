const { validateMessageRequest } = require('./message-request-schema')
const { sendMessageToSingleFrontDoor } = require('../services/message-service')

const processMessageRequest = async (logger, message, receiver) => {
  try {
    logger.warn(`Received sfd message request with id: ${message.messageId}`)
    const messageBody = message.body
    if (validateMessageRequest(logger, messageBody)) {
      await sendMessageToSingleFrontDoor(logger, messageBody)
      await receiver.completeMessage(message)
    }
  } catch (err) {
    await receiver.deadLetterMessage(message)
    logger.error(`Unable to process sfd message request: ${err.message}`)
  }
}

module.exports = processMessageRequest
