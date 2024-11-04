const { sendMessageToSingleFrontDoor } = require('../../../../../app/services/message-service')

describe('sendMessageToSingleFrontDoor', () => {
  const validApplicationMessage = { crn: '1234567', sbi: '1234' }
  const emptyApplicationMessage = {}
  const applicationMessageMissingSbi = { crn: '1234567' }

  let mockedLogger

  beforeEach(() => {
    jest.clearAllMocks()

    mockedLogger = jest.fn(() => ({
      warn: jest.fn(),
      error: jest.fn()
    }))()
  })

  test('returns message with id when processing is successful', async () => {
    const sfdMessage = await sendMessageToSingleFrontDoor(mockedLogger, validApplicationMessage)
    expect(sfdMessage).not.toBeNull()
    expect(sfdMessage).toHaveProperty('id')
  })

  test('throws an error when message from application is invalid', async () => {
    await expect(sendMessageToSingleFrontDoor(mockedLogger, emptyApplicationMessage)).rejects.toThrow('The application message is invalid. "crn" is required')
    expect(mockedLogger.error).toHaveBeenCalledWith('The application message is invalid. "crn" is required')
  })

  test('throws an error when fail to map application message to sfd message', async () => {
    await expect(sendMessageToSingleFrontDoor(mockedLogger, applicationMessageMissingSbi)).rejects.toThrow('The single front door message is invalid. "data" is required')
    expect(mockedLogger.error).toHaveBeenCalledWith('The single front door message is invalid. "data" is required')
  })

  test('throws an error when fail to store messages', async () => {
    const { set } = require('../../../../../app/repositories/message-log-repository')
    set.mockImplementation(() => {
      throw new Error('Faked data persistence error')
    })

    await expect(sendMessageToSingleFrontDoor(mockedLogger, validApplicationMessage)).rejects.toThrow('Failed to save single front door message. Faked data persistence error')
    expect(mockedLogger.error).toHaveBeenCalledWith('Failed to save single front door message. Faked data persistence error')
  })

  test.skip('throws an error when fail to send message to single front door', async () => {
    const sfdMessage = await sendMessageToSingleFrontDoor(mockedLogger, validApplicationMessage)
    expect(sfdMessage).toBeNull()
  })
})
