describe('message-queue config', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('should throw an error for an invalid environment', () => {
    process.env.MESSAGE_QUEUE_HOST = 22

    expect(() => {
      console.log('before')
      require('../../../../app/config/message-queue')
      console.log('after')
    }).toThrowError('The message queue config is invalid. "sfdMessageRequestQueue.host" must be a string. "sfdMessageTopic.host" must be a string')
  })
})
