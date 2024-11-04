const { MessageSender } = require('ffc-messaging')
const { sfdMessageTopic, sfdMessageRequestMsgType } = require('../config/index').messageQueueConfig

const sendSfdMessageRequest = async (sfdMessageRequest) => {
  const sender = new MessageSender(sfdMessageTopic)
  const message = createMessage(sfdMessageRequest, sfdMessageRequestMsgType)

  await sender.sendMessage(message)
  await sender.closeConnection()
}

const createMessage = (body, type) => {
  return {
    body,
    type,
    source: 'ffc-ahwr-sfd-messaging-proxy',
    options: {}
  }
}

module.exports = {
  sendSfdMessageRequest
}
