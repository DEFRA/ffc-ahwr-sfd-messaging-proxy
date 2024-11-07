const { sendMessageToSingleFrontDoor } = require('../../../../../app/services/message-service')

describe('sendMessageToSingleFrontDoor', () => {
  const inboundMessageQueueId = '298293c75b734f2195c9d1478ccb3dca'
  const validInboundMessage = {
    crn: 123456789,
    sbi: 123456789,
    agreementReference: 'IAHW-C3A1-5899',
    notifyTemplateId: '183565fc-5684-40c1-a11d-85f55aff4d45',
    emailAddresses: ['an@email.com'],
    customParams: []
  }
  const emptyInboundMessage = {}
  const inboundMessageNoAgreementRef = {
    crn: 123456789,
    sbi: 123456789,
    notifyTemplateId: '183565fc-5684-40c1-a11d-85f55aff4d45',
    emailAddresses: ['an@email.com'],
    customParams: []
  }

  let mockedLogger

  beforeEach(() => {
    jest.resetAllMocks()

    mockedLogger = jest.fn(() => ({
      warn: jest.fn(),
      error: jest.fn()
    }))()
  })

  test('returns message with id when processing is successful', async () => {
    const outboundMessage = await sendMessageToSingleFrontDoor(mockedLogger, inboundMessageQueueId, validInboundMessage)
    expect(outboundMessage).not.toBeNull()
    expect(outboundMessage).toHaveProperty('id')
  })

  test('throws an error when inbound message is invalid', async () => {
    await expect(sendMessageToSingleFrontDoor(mockedLogger, inboundMessageQueueId, emptyInboundMessage)).rejects.toThrow('The inbound message is invalid. "crn" is required')
    expect(mockedLogger.error).toHaveBeenCalledWith('The inbound message is invalid. "crn" is required. "sbi" is required. "agreementReference" is required. "notifyTemplateId" is required. "emailAddresses" is required. "customParams" is required')
  })

  // TODO AHWR-183 is this possible now we have inbound message validation?
  test.skip('throws an error when message log database item is invalid', async () => {
    await expect(sendMessageToSingleFrontDoor(mockedLogger, inboundMessageQueueId, inboundMessageNoAgreementRef)).rejects.toThrow('The message log database item is invalid. "agreementReference" is required')
    expect(mockedLogger.error).toHaveBeenCalledWith('The message log database item is invalid. "agreementReference" is required')
  })

  test('throws an error when fail to store message log database item', async () => {
    const { set } = require('../../../../../app/repositories/message-log-repository')
    set.mockImplementation(() => {
      throw new Error('Faked data persistence error')
    })

    await expect(sendMessageToSingleFrontDoor(mockedLogger, inboundMessageQueueId, validInboundMessage)).rejects.toThrow('Failed to save single front door message. Faked data persistence error')
    expect(mockedLogger.error).toHaveBeenCalledWith('Failed to save single front door message. Faked data persistence error')
  })

  test('throws an error when fail to send outbound message to single front door', async () => {
    const { sendSfdMessageRequest } = require('../../../../../app/messaging/forward-message-request-to-sfd')
    sendSfdMessageRequest.mockImplementation(() => {
      throw new Error('Faked message send error')
    })

    await expect(sendMessageToSingleFrontDoor(mockedLogger, inboundMessageQueueId, validInboundMessage)).rejects.toThrow('Failed to send outbound message to single front door. Faked message send error')
    expect(mockedLogger.error).toHaveBeenCalledWith('Failed to send outbound message to single front door. Faked message send error')
  })
})

describe('buildOutboundMessage', () => {
  test.skip('TODO', async () => {
  })
  // TODO AHWR-183 Min and Max populated inbound message for the following:
  // Farmer Apply - confirm existing user V3.0
  // Farmer Apply - confirm new user V3.0
  // Farmer Claim - Complete
  // Farmer Claim - Endemics Follow-up
  // Farmer Claim - Endemics Review
})
