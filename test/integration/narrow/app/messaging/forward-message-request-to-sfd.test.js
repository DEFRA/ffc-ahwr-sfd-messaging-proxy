import { sendSfdMessageRequest } from '../../../../../app/messaging/forward-message-request-to-sfd'

const mockSendMessage = jest.fn()
const mockCloseConnection = jest.fn()

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
    specversion: '1.0.2',
    datacontenttype: 'application/json',
    type: 'uk.gov.ffc.ahwr.comms.request',
    time: '2024-11-08T16:54:03.210Z',
    data: {
      crn: 1234567890,
      sbi: 123456789,
      sourceSystem: 'ffc-ahwr',
      notifyTemplateId: '123456fc-9999-40c1-a11d-85f55aff4d99',
      commsType: 'email',
      commsAddress: 'an@email.com',
      personalisation: {
        reference: 'IAHW-ABC1-5899'
      },
      reference: 'ffc-ahwr-AAA123'
    }
  }

  beforeAll(() => {
    jest.clearAllMocks()
  })

  test('it sends a message to SFD', async () => {
    console.log('in')
    await sendSfdMessageRequest(outboundMessage)

    expect(mockSendMessage).toHaveBeenCalledWith('')
    expect(mockCloseConnection).toHaveBeenCalledTimes(1)
  })
})
