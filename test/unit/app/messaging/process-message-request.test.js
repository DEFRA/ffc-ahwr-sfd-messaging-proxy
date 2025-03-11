import { processMessageRequest } from '../../../../app/messaging/process-message-request'
import { sendMessageToSingleFrontDoor } from '../../../../app/services/message-service'

jest.mock('../../../../app/services/message-service.js', () => ({
  sendMessageToSingleFrontDoor: jest.fn()
}))

const mockErrorLogger = jest.fn()

const mockedLogger = {
  warn: jest.fn(),
  error: mockErrorLogger,
  info: jest.fn(),
  setBindings: jest.fn()
}

const mockSubscribe = jest.fn()
const mockCloseConnection = jest.fn()
const mockCompleteMessage = jest.fn()
const mockDeadLetterMessage = jest.fn()

const mockMessageReceiver = {
  closeConnection: mockCloseConnection,
  subscribe: mockSubscribe,
  completeMessage: mockCompleteMessage,
  deadLetterMessage: mockDeadLetterMessage
}

describe('processMessageRequest', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('processes the message if it is valid', async () => {
    const event = {
      body: {
        crn: 1050000003,
        sbi: 105000003,
        agreementReference: 'somereference',
        claimReference: 'somereference',
        notifyTemplateId: '123456fc-9999-40c1-a11d-85f55aff4d99',
        emailAddress: 'someEmail@email.com',
        customParams: {},
        dateTime: new Date()
      },
      messageId: 1
    }
    await processMessageRequest(mockedLogger, event, mockMessageReceiver)

    expect(sendMessageToSingleFrontDoor).toHaveBeenCalledWith(mockedLogger, event.messageId, event.body)
    expect(mockCompleteMessage).toHaveBeenCalledTimes(1)
    expect(mockErrorLogger).toHaveBeenCalledTimes(0)
    expect(mockDeadLetterMessage).toHaveBeenCalledTimes(0)
  })

  test('processes the message if it is valid with optional reply to ID', async () => {
    const event = {
      body: {
        crn: 1050000003,
        sbi: 105000003,
        agreementReference: 'somereference',
        claimReference: 'somereference',
        notifyTemplateId: '123456fc-9999-40c1-a11d-85f55aff4d99',
        emailReplyToId: '123456fc-9999-40c1-a11d-85f55aff5599',
        emailAddress: 'someEmail@email.com',
        customParams: {},
        dateTime: new Date()
      },
      messageId: 1
    }
    await processMessageRequest(mockedLogger, event, mockMessageReceiver)

    expect(sendMessageToSingleFrontDoor).toHaveBeenCalledWith(mockedLogger, event.messageId, event.body)
    expect(mockCompleteMessage).toHaveBeenCalledTimes(1)
    expect(mockErrorLogger).toHaveBeenCalledTimes(0)
    expect(mockDeadLetterMessage).toHaveBeenCalledTimes(0)
  })

  test('dead letter the message if it is invalid according to the schema, also does not send it to SFD', async () => {
    const invalidEvent = {
      body: {
        crn: 105,
        sbi: 105000003,
        agreementReference: 'somereference',
        claimReference: 'somereference',
        notifyTemplateId: '123456fc-9999-40c1-a11d-85f55aff4d99',
        emailAddress: 'someEmail@email.com',
        customParams: {},
        dateTime: new Date()
      }
    }
    await processMessageRequest(mockedLogger, invalidEvent, mockMessageReceiver)

    expect(mockErrorLogger).toHaveBeenCalledTimes(1)
    expect(mockDeadLetterMessage).toHaveBeenCalledTimes(1)
    expect(sendMessageToSingleFrontDoor).toHaveBeenCalledTimes(0)
    expect(mockCompleteMessage).toHaveBeenCalledTimes(0)
  })

  test('dead letter the message if it is valid but an error is thrown in sending it to SFD', async () => {
    const event = {
      body: {
        crn: 1050000003,
        sbi: 105000003,
        agreementReference: 'somereference',
        claimReference: 'somereference',
        notifyTemplateId: '123456fc-9999-40c1-a11d-85f55aff4d99',
        emailAddress: 'someEmail@email.com',
        customParams: {},
        dateTime: new Date()
      },
      messageId: 1
    }

    sendMessageToSingleFrontDoor.mockImplementation(() => { throw new Error('I wont send the message to SFD') })

    await processMessageRequest(mockedLogger, event, mockMessageReceiver)

    expect(mockErrorLogger).toHaveBeenCalledTimes(1)
    expect(mockDeadLetterMessage).toHaveBeenCalledTimes(1)
    expect(sendMessageToSingleFrontDoor).toHaveBeenCalledTimes(1)
    expect(mockCompleteMessage).toHaveBeenCalledTimes(0)
  })
})
