import { MessageReceiver } from 'ffc-messaging'
import { config } from '../config/index.js'
import { processMessageRequest } from './process-message-request.js'

let sfdMessageReceiver

export const startSfdMessageReceiver = async (logger) => {
  const sfdMessageAction = (message) => processMessageRequest(logger, message, sfdMessageReceiver)

  sfdMessageReceiver = new MessageReceiver(
    config.messageQueueConfig.sfdMessageRequestQueue,
    sfdMessageAction
  )

  await sfdMessageReceiver.subscribe()
  logger.warn('Ready to receive messages')
}

export const stopSfdMessageReceiver = async () => {
  await sfdMessageReceiver.closeConnection()
}
