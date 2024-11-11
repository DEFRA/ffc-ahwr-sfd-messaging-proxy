const { v4: uuidv4 } = require('uuid')
const {
  sendMessageToSingleFrontDoor,
  buildOutboundMessage
} = require('../../../../../app/services/message-service')

const now = new Date().toISOString()

describe('sendMessageToSingleFrontDoor', () => {
  const inboundMessageQueueId = '298293c75b734f2195c9d1478ccb3dca'
  const validInboundMessage = {
    crn: 1234567890,
    sbi: 123456789,
    agreementReference: 'IAHW-ABC1-5899',
    claimReference: 'RESH-F99F-E09F',
    notifyTemplateId: '123456fc-9999-40c1-a11d-85f55aff4d99',
    emailAddress: 'an@email.com',
    customParams: {},
    dateTime: now
  }
  const emptyInboundMessage = {}

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
        agreementReference: 'IAHW-ABC1-5899',
        claimReference: 'RESH-F99F-E09F',
        data: {
          inboundMessage: {
            agreementReference: 'IAHW-ABC1-5899',
            claimReference: 'RESH-F99F-E09F',
            crn: 1234567890,
            customParams: {},
            dateTime: now,
            emailAddress: 'an@email.com',
            notifyTemplateId: '123456fc-9999-40c1-a11d-85f55aff4d99',
            sbi: 123456789
          },
          inboundMessageQueueId: '298293c75b734f2195c9d1478ccb3dca',
          outboundMessage: {
            data: {
              commsAddress: 'an@email.com',
              commsType: 'email',
              crn: 1234567890,
              notifyTemplateId: '123456fc-9999-40c1-a11d-85f55aff4d99',
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
        status: 'UNSENT', // <-------- This is the important bit!
        templateId: '123456fc-9999-40c1-a11d-85f55aff4d99'
      }
    )
  })
})

describe('buildOutboundMessage', () => {
  test('verify input and output for: Farmer Apply - confirm existing user V3.0', async () => {
    const messageId = uuidv4()
    const inputApplyExisting = {
      crn: 1234567890,
      sbi: 123456789,
      agreementReference: 'IAHW-ABC1-5899',
      notifyTemplateId: '123456fc-9999-40c1-a11d-85f55aff4d99',
      emailAddress: 'an@email.com',
      customParams: { reference: 'IAHW-ABC1-5899' },
      dateTime: '2024-11-08T16:54:03.210Z'
    }
    const expectedOutput = {
      id: messageId,
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
        reference: `ffc-ahwr-${messageId}`
      }
    }

    expect(buildOutboundMessage(messageId, inputApplyExisting)).toStrictEqual(expectedOutput)
  })

  test('verify input and output for: Farmer Apply - confirm new user V3.0', async () => {
    const messageId = uuidv4()
    const inputApplyNew = {
      crn: 1234567890,
      sbi: 123456789,
      agreementReference: 'IAHW-ABC1-5898',
      notifyTemplateId: '123456fc-9999-40c1-a11d-85f55aff4d98',
      emailAddress: 'an@email.com',
      customParams: { reference: 'IAHW-ABC1-5898' },
      dateTime: '2024-11-08T16:54:03.210Z'
    }
    const expectedOutput = {
      id: messageId,
      source: 'ffc-ahwr',
      specversion: '1.0.2',
      datacontenttype: 'application/json',
      type: 'uk.gov.ffc.ahwr.comms.request',
      time: '2024-11-08T16:54:03.210Z',
      data: {
        crn: 1234567890,
        sbi: 123456789,
        sourceSystem: 'ffc-ahwr',
        notifyTemplateId: '123456fc-9999-40c1-a11d-85f55aff4d98',
        commsType: 'email',
        commsAddress: 'an@email.com',
        personalisation: {
          reference: 'IAHW-ABC1-5898'
        },
        reference: `ffc-ahwr-${messageId}`
      }
    }

    expect(buildOutboundMessage(messageId, inputApplyNew)).toStrictEqual(expectedOutput)
  })

  test('verify input and output for: Farmer Claim - Complete', async () => {
    const messageId = uuidv4()
    const inputClaimOldWorld = {
      crn: 1234567890,
      sbi: 123456789,
      agreementReference: 'IAHW-ABC1-5897',
      claimReference: 'RESH-F99F-E09F',
      notifyTemplateId: '123456fc-9999-40c1-a11d-85f55aff4d97',
      emailAddress: 'an@email.com',
      customParams: { reference: 'IAHW-ABC1-5897' },
      dateTime: '2024-11-08T16:54:03.210Z'
    }
    const expectedOutput = {
      id: messageId,
      source: 'ffc-ahwr',
      specversion: '1.0.2',
      datacontenttype: 'application/json',
      type: 'uk.gov.ffc.ahwr.comms.request',
      time: '2024-11-08T16:54:03.210Z',
      data: {
        crn: 1234567890,
        sbi: 123456789,
        sourceSystem: 'ffc-ahwr',
        notifyTemplateId: '123456fc-9999-40c1-a11d-85f55aff4d97',
        commsType: 'email',
        commsAddress: 'an@email.com',
        personalisation: {
          reference: 'IAHW-ABC1-5897'
        },
        reference: `ffc-ahwr-${messageId}`
      }
    }

    expect(buildOutboundMessage(messageId, inputClaimOldWorld)).toStrictEqual(expectedOutput)
  })

  test('verify input and output for: Farmer Claim - Endemics Follow-up', async () => {
    const messageId = uuidv4()
    const inputClaimEndemicFollowup = {
      crn: 1234567890,
      sbi: 123456789,
      agreementReference: 'IAHW-ABC1-5896',
      claimReference: 'RESH-F99F-E09F',
      notifyTemplateId: '123456fc-9999-40c1-a11d-85f55aff4d96',
      emailAddress: 'an@email.com',
      customParams: {
        reference: 'RESH-F99F-E09F',
        applicationReference: 'IAHW-ABC1-5896',
        amount: '123.45'
      },
      dateTime: '2024-11-08T16:54:03.210Z'
    }
    const expectedOutput = {
      id: messageId,
      source: 'ffc-ahwr',
      specversion: '1.0.2',
      datacontenttype: 'application/json',
      type: 'uk.gov.ffc.ahwr.comms.request',
      time: '2024-11-08T16:54:03.210Z',
      data: {
        crn: 1234567890,
        sbi: 123456789,
        sourceSystem: 'ffc-ahwr',
        notifyTemplateId: '123456fc-9999-40c1-a11d-85f55aff4d96',
        commsType: 'email',
        commsAddress: 'an@email.com',
        personalisation: {
          reference: 'RESH-F99F-E09F',
          applicationReference: 'IAHW-ABC1-5896',
          amount: '123.45'
        },
        reference: `ffc-ahwr-${messageId}`
      }
    }

    expect(buildOutboundMessage(messageId, inputClaimEndemicFollowup)).toStrictEqual(expectedOutput)
  })

  test('verify input and output for: Farmer Claim - Endemics Review', async () => {
    const messageId = uuidv4()
    const inputClaimEndemicFollowup = {
      crn: 1234567890,
      sbi: 123456789,
      agreementReference: 'IAHW-ABC1-5895',
      claimReference: 'RESH-F99F-E09F',
      notifyTemplateId: '123456fc-9999-40c1-a11d-85f55aff4d95',
      emailAddress: 'an@email.com',
      customParams: {
        reference: 'RESH-F99F-E09F',
        applicationReference: 'IAHW-ABC1-5895',
        amount: '123.45'
      },
      dateTime: '2024-11-08T16:54:03.210Z'
    }
    const expectedOutput = {
      id: messageId,
      source: 'ffc-ahwr',
      specversion: '1.0.2',
      datacontenttype: 'application/json',
      type: 'uk.gov.ffc.ahwr.comms.request',
      time: '2024-11-08T16:54:03.210Z',
      data: {
        crn: 1234567890,
        sbi: 123456789,
        sourceSystem: 'ffc-ahwr',
        notifyTemplateId: '123456fc-9999-40c1-a11d-85f55aff4d95',
        commsType: 'email',
        commsAddress: 'an@email.com',
        personalisation: {
          reference: 'RESH-F99F-E09F',
          applicationReference: 'IAHW-ABC1-5895',
          amount: '123.45'
        },
        reference: `ffc-ahwr-${messageId}`
      }
    }

    expect(buildOutboundMessage(messageId, inputClaimEndemicFollowup)).toStrictEqual(expectedOutput)
  })
})
