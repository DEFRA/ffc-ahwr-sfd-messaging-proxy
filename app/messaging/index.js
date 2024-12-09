import { MessageReceiver } from 'ffc-messaging'
import { config } from '../config/index.js'
import { processMessageRequest } from './process-message-request.js'

let sfdMessageReceiver

export const startSfdMessageReceiver = async (logger) => {
  const sfdMessageAction = (message) => {
    const childLogger = logger.child({}) // reset context
    processMessageRequest(childLogger, message, sfdMessageReceiver)
  }

  sfdMessageReceiver = new MessageReceiver(
    config.messageQueueConfig.sfdMessageRequestQueue,
    sfdMessageAction
  )

  await sfdMessageReceiver.subscribe()
  logger.setBindings({ sfdMessageReceiverReady: true })
}

export const stopSfdMessageReceiver = async () => {
  await sfdMessageReceiver.closeConnection()
}
