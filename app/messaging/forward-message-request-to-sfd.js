import { MessageSender } from 'ffc-messaging'
import config from '../config/index.js'

export const sendSfdMessageRequest = async (sfdMessageRequest) => {
  console.log('here')
  const { sfdMessageTopic, sfdMessageRequestMsgType } = config.messageQueueConfig
  console.log('here2')
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
