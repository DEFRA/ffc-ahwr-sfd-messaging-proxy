import { sendSfdMessageRequest } from '../../../../app/messaging/forward-message-request-to-sfd'

const mockSendMessage = jest.fn()
const mockCloseConnection = jest.fn()

jest.mock('../../../../app/config/index', () => ({
  config: {
    messageQueueConfig: {
      sfdMessageTopic: 'fake-topic-name',
      sfdMessageRequestMsgType: 'uk.gov.ffc.ahwr.submit.sfd.message.request'
    }
  }
}))
jest.mock('ffc-messaging', () => {
  const MockMessageSender = jest.fn().mockImplementation(() => ({
    closeConnection: mockCloseConnection,
    sendMessage: mockSendMessage
  }))

  return {
    MessageSender: MockMessageSender
  }
})

describe('sendSfdMessageRequest', () => {
  const outboundMessage = {
    id: 'AAA123',
    source: 'ffc-ahwr',
    specversion: '2.0.0',
    datacontenttype: 'application/json',
    type: 'uk.gov.ffc.ahwr.comms.request',
    time: '2024-11-08T16:54:03.210Z',
    data: {
      crn: 1234567890,
      sbi: 123456789,
      sourceSystem: 'ffc-ahwr',
      notifyTemplateId: '123456fc-9999-40c1-a11d-85f55aff4d99',
      commsType: 'email',
      commsAddresses: 'an@email.com',
      personalisation: {
        reference: 'IAHW-ABC1-5899'
      },
      reference: 'ffc-ahwr-AAA123',
      emailReplyToId: 'c3e9149b-9490-4321-808c-72e709d9d814'
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('it sends a message to SFD', async () => {
    await sendSfdMessageRequest(outboundMessage)

    expect(mockSendMessage).toHaveBeenCalledWith({
      body: {
        data: outboundMessage.data,
        datacontenttype: outboundMessage.datacontenttype,
        id: outboundMessage.id,
        source: outboundMessage.source,
        specversion: outboundMessage.specversion,
        time: outboundMessage.time,
        type: outboundMessage.type
      },
      options: {},
      source: 'ffc-ahwr-sfd-messaging-proxy',
      type: 'uk.gov.ffc.ahwr.submit.sfd.message.request'
    })
    expect(mockCloseConnection).toHaveBeenCalledTimes(1)
  })

  test('throws error and closes connection when message to SFD fails', async () => {
    mockSendMessage.mockImplementation(() => {
      throw new Error('Failed to send message to the SFD')
    })

    await expect(sendSfdMessageRequest(outboundMessage)).rejects.toThrow(
      'Failed to send message to the SFD'
    )

    expect(mockSendMessage).toHaveBeenCalledTimes(1)
    expect(mockCloseConnection).toHaveBeenCalledTimes(1)
  })
})
