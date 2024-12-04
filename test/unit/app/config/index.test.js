describe('App config', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  const testData = {
    port: '1111',
    nodeEnv: 'test',
    sfdEmailReplyToId: 'c3e9149b-9490-4321-808c-72e709d9d814'
  }

  test('Should pass validation for all fields populated', async () => {
    process.env.PORT = testData.port
    process.env.NODE_ENV = testData.nodeEnv
    process.env.SFD_EMAIL_REPLYTO_ID = testData.sfdEmailReplyToId

    const { config } = require('../../../../app/config/index.js') // This style of dynamic import is needed to get the process.env setting to work properly

    expect(config).toEqual({
      messageQueueConfig: expect.any(Object), // This...
      dbConfig: expect.any(Object), // ...and this is pulled in from other files, so we dont want to test them here
      env: testData.nodeEnv,
      isDev: false,
      port: Number(testData.port),
      sfdEmailReplyToId: testData.sfdEmailReplyToId
    })
  })

  test('should throw an error for an invalid environment', () => {
    process.env.PORT = testData.port
    process.env.NODE_ENV = 'foo'
    process.env.SFD_EMAIL_REPLYTO_ID = testData.sfdEmailReplyToId

    expect(() => {
      require('../../../../app/config/index.js')
    }).toThrowError('The server config is invalid. "env" must be one of [development, test, production]')
  })
})
