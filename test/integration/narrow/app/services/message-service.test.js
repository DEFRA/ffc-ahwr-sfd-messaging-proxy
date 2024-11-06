const { sendMessageToSingleFrontDoor } = require('../../../../../app/services/message-service')

describe('sendMessageToSingleFrontDoor', () => {
  const validInboundMessage = { crn: 123456789, sbi: 123456789, agreementReference: 'IAHW-C3A1-5899' }
  const emptyInboundMessage = {}
  const inboundMessageNoAgreementRef = { crn: 123456789, sbi: 123456789 }

  let mockedLogger

  beforeEach(() => {
    jest.resetAllMocks()

    mockedLogger = jest.fn(() => ({
      warn: jest.fn(),
      error: jest.fn()
    }))()
  })

  test('returns message with id when processing is successful', async () => {
    const outboundMessage = await sendMessageToSingleFrontDoor(mockedLogger, validInboundMessage)
    expect(outboundMessage).not.toBeNull()
    expect(outboundMessage).toHaveProperty('id')
  })

  test('throws an error when inbound message is invalid', async () => {
    await expect(sendMessageToSingleFrontDoor(mockedLogger, emptyInboundMessage)).rejects.toThrow('The inbound message is invalid. "crn" is required')
    expect(mockedLogger.error).toHaveBeenCalledWith('The inbound message is invalid. "crn" is required. "sbi" is required')
  })

  test('throws an error when message log database item is invalid', async () => {
    await expect(sendMessageToSingleFrontDoor(mockedLogger, inboundMessageNoAgreementRef)).rejects.toThrow('The message log database item is invalid. "agreementReference" is required')
    expect(mockedLogger.error).toHaveBeenCalledWith('The message log database item is invalid. "agreementReference" is required')
  })

  test('throws an error when fail to store message log database item', async () => {
    const { set } = require('../../../../../app/repositories/message-log-repository')
    set.mockImplementation(() => {
      throw new Error('Faked data persistence error')
    })

    await expect(sendMessageToSingleFrontDoor(mockedLogger, validInboundMessage)).rejects.toThrow('Failed to save single front door message. Faked data persistence error')
    expect(mockedLogger.error).toHaveBeenCalledWith('Failed to save single front door message. Faked data persistence error')
  })

  test('throws an error when fail to send outbound message to single front door', async () => {
    const { sendSfdMessageRequest } = require('../../../../../app/messaging/forward-message-request-to-sfd')
    sendSfdMessageRequest.mockImplementation(() => {
      throw new Error('Faked message send error')
    })

    await expect(sendMessageToSingleFrontDoor(mockedLogger, validInboundMessage)).rejects.toThrow('Failed to send outbound message to single front door. Faked message send error')
    expect(mockedLogger.error).toHaveBeenCalledWith('Failed to send outbound message to single front door. Faked message send error')
  })
})

describe('buildOutboundMessage', () => {
  test.skip('TODO', async () => {
  })
})
