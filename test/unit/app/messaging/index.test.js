import { config } from '../../../../app/config/index.js'
import { startSfdMessageReceiver, stopSfdMessageReceiver } from '../../../../app/messaging/index.js'
import { MessageReceiver } from 'ffc-messaging'

jest.mock('ffc-messaging')
jest.mock('../../../../app/messaging/process-message-request.js', () => ({
  processMessageRequest: jest.fn()
}))

const mockSubscribe = jest.fn().mockResolvedValue(true)
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  setBindings: jest.fn()
}

const mockClose = jest.fn()
MessageReceiver.prototype.subscribe = mockSubscribe
MessageReceiver.prototype.closeConnection = mockClose

const constructorSpy = jest.spyOn(
  require('ffc-messaging'),
  'MessageReceiver'
)

describe('messaging setup', () => {
  test('it instantiates the message receiver and subscribes to messages', async () => {
    await startSfdMessageReceiver(mockLogger)
    expect(constructorSpy).toHaveBeenCalledWith(config.messageQueueConfig.sfdMessageRequestQueue, expect.any(Function))
    expect(mockSubscribe).toHaveBeenCalled()
  })

  test('successfully stopped receivers', async () => {
    await stopSfdMessageReceiver()
    expect(mockClose).toHaveBeenCalledTimes(1)
  })
})
