const { MessageReceiver } = require('ffc-messaging')
const { sfdMessageRequestQueue } = require('../config/index').messageQueueConfig
const processMessageRequest = require('./process-message-request')

let sfdMessageReceiver

const start = async (logger) => {
  const sfdMessageAction = message => processMessageRequest(logger, message, sfdMessageReceiver)
  sfdMessageReceiver = new MessageReceiver(sfdMessageRequestQueue, sfdMessageAction)
  await sfdMessageReceiver.subscribe()

  logger.warn('Ready to receive messages')
}

const stop = async () => {
  await sfdMessageReceiver.closeConnection()
}

module.exports = { start, stop }
