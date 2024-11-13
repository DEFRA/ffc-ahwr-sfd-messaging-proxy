describe('App config', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules() // Most important - it clears the cache
    process.env = { ...OLD_ENV } // Make a copy
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
  })

  test('Should pass validation for all fields populated', async () => {
    const testData = {
      port: '1111',
      nodeEnv: 'test',
      termsAndConditionsUrl: 'termsandconditions.com',
      applyServiceUri: 'applyserviceuri',
      claimServiceUri: 'claimserviceuri'
    }

    process.env.PORT = testData.port
    process.env.NODE_ENV = testData.nodeEnv
    process.env.TERMS_AND_CONDITIONS_URL = testData.termsAndConditionsUrl
    process.env.APPLY_SERVICE_URI = testData.applyServiceUri
    process.env.CLAIM_SERVICE_URI = testData.claimServiceUri

    const { config } = require('../../../../app/config/index.js')

    expect(config).toEqual({
      messageQueueConfig: expect.any(Object), // These 2 pieces of config are pulled in from other files, so we dont want to test them here
      dbConfig: expect.any(Object),
      applyServiceUri: testData.applyServiceUri,
      claimServiceUri: testData.claimServiceUri,
      env: testData.nodeEnv,
      isDev: false,
      port: Number(testData.port),
      termsAndConditionsUrl: testData.termsAndConditionsUrl
    })
  })
})
