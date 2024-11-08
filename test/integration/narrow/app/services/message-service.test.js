const {
  sendMessageToSingleFrontDoor
} = require('../../../../../app/services/message-service')

const now = new Date()

describe('sendMessageToSingleFrontDoor', () => {
  const inboundMessageQueueId = '298293c75b734f2195c9d1478ccb3dca'
  const validInboundMessage = {
    crn: 1234567890,
    sbi: 123456789,
    agreementReference: 'IAHW-C3A1-5899',
    notifyTemplateId: '183565fc-5684-40c1-a11d-85f55aff4d45',
    emailAddress: 'an@email.com',
    customParams: {},
    dateTime: now
  }
  const emptyInboundMessage = {}
  const inboundMessageNoAgreementRef = {
    crn: 1234567890,
    sbi: 123456789,
    notifyTemplateId: '183565fc-5684-40c1-a11d-85f55aff4d45',
    emailAddress: 'an@email.com',
    customParams: {}
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
    const outboundMessage = await sendMessageToSingleFrontDoor(
      mockedLogger,
      inboundMessageQueueId,
      validInboundMessage
    )
    expect(outboundMessage).not.toBeNull()
    expect(outboundMessage).toHaveProperty('id')
  })

  test('throws an error when inbound message is invalid', async () => {
    await expect(
      sendMessageToSingleFrontDoor(
        mockedLogger,
        inboundMessageQueueId,
        emptyInboundMessage
      )
    ).rejects.toThrow('The inbound message is invalid. "crn" is required')
    expect(mockedLogger.error).toHaveBeenCalledWith(
      'The inbound message is invalid. "crn" is required. "sbi" is required. "agreementReference" is required. "notifyTemplateId" is required. "customParams" is required. "dateTime" is required'
    )
  })

  // TODO AHWR-183 is this possible now we have inbound message validation?
  test.skip('throws an error when message log database item is invalid', async () => {
    await expect(
      sendMessageToSingleFrontDoor(
        mockedLogger,
        inboundMessageQueueId,
        inboundMessageNoAgreementRef
      )
    ).rejects.toThrow(
      'The message log database item is invalid. "agreementReference" is required'
    )
    expect(mockedLogger.error).toHaveBeenCalledWith(
      'The message log database item is invalid. "agreementReference" is required'
    )
  })

  test('throws an error when fail to store message log database item', async () => {
    const {
      set
    } = require('../../../../../app/repositories/message-log-repository')
    set.mockImplementation(() => {
      throw new Error('Faked data persistence error')
    })

    await expect(
      sendMessageToSingleFrontDoor(
        mockedLogger,
        inboundMessageQueueId,
        validInboundMessage
      )
    ).rejects.toThrow(
      'Failed to save single front door message. Faked data persistence error'
    )
    expect(mockedLogger.error).toHaveBeenCalledWith(
      'Failed to save single front door message. Faked data persistence error'
    )
  })

  test('stores that the message was not sent, if the SFD request fails', async () => {
    const {
      sendSfdMessageRequest
    } = require('../../../../../app/messaging/forward-message-request-to-sfd')
    sendSfdMessageRequest.mockImplementation(() => {
      throw new Error('Faked message send error')
    })

    const {
      set
    } = require('../../../../../app/repositories/message-log-repository')
    set.mockImplementation(jest.fn())

    await sendMessageToSingleFrontDoor(
      mockedLogger,
      inboundMessageQueueId,
      validInboundMessage
    )

    expect(set).toHaveBeenCalledWith(
      { error: expect.any(Function), warn: expect.any(Function) },
      {
        agreementReference: 'IAHW-C3A1-5899',
        claimReference: '1234567890',
        data: {
          inboundMessage: {
            agreementReference: 'IAHW-C3A1-5899',
            crn: 1234567890,
            customParams: {},
            dateTime: now,
            emailAddress: 'an@email.com',
            notifyTemplateId: '183565fc-5684-40c1-a11d-85f55aff4d45',
            sbi: 123456789
          },
          inboundMessageQueueId: '298293c75b734f2195c9d1478ccb3dca',
          outboundMessage: {
            data: {
              commsAddress: 'an@email.com',
              commsType: 'email',
              crn: 1234567890,
              notifyTemplateId: '183565fc-5684-40c1-a11d-85f55aff4d45',
              personalisation: {},
              reference: expect.any(String),
              sbi: 123456789,
              sourceSystem: 'ffc-ahwr'
            },
            datacontenttype: 'application/json',
            id: expect.any(String),
            source: 'ffc-ahwr',
            specversion: '1.0.2',
            time: now,
            type: 'uk.gov.ffc.ahwr.comms.request'
          }
        },
        id: expect.any(String),
        status: 'FAILED', // <-------- This is the important bit!
        templateId: '183565fc-5684-40c1-a11d-85f55aff4d45'
      }
    )
  })
})

describe('buildOutboundMessage', () => {
  test.skip('TODO', async () => {})
  // TODO AHWR-183 Min and Max populated inbound message for the following:
  // Farmer Apply - confirm existing user V3.0
  // Farmer Apply - confirm new user V3.0
  // Farmer Claim - Complete
  // Farmer Claim - Endemics Follow-up
  // Farmer Claim - Endemics Review
})
