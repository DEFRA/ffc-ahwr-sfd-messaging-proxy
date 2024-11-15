describe('App config', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('Should pass validation for all fields populated', async () => {
    const testData = {
      port: '1111',
      nodeEnv: 'test'
    }

    process.env.PORT = testData.port
    process.env.NODE_ENV = testData.nodeEnv

    const { config } = require('../../../../app/config/index.js') // This style of dynamic import is needed to get the process.env setting to work properly

    expect(config).toEqual({
      messageQueueConfig: expect.any(Object), // This...
      dbConfig: expect.any(Object), // ...and this is pulled in from other files, so we dont want to test them here
      env: testData.nodeEnv,
      isDev: false,
      port: Number(testData.port)
    })
  })

  test('should throw an error for an invalid environment', () => {
    process.env.PORT = '1111'
    process.env.NODE_ENV = 'foo'

    expect(() => {
      require('../../../../app/config/index.js')
    }).toThrowError('The server config is invalid. "env" must be one of [development, test, production]')
  })
})
