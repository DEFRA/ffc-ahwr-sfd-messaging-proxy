describe('App config', () => {
  const originalProcessEnv = process.env

  beforeEach(() => {
    process.env = {}
  })

  afterAll(() => {
    process.env = originalProcessEnv
  })

  test('Should pass validation for all fields populated', async () => {
    const testData = {
      port: '1111',
      nodeEnv: 'test',
      termsAndConditionsUrl: 'termsandconditions.com',
      applyServiceUri: 'applyserviceuri',
      claimServiceUri: 'claimserviceuri',
      endemicsEnabled: 'true'
    }
    process.env.PORT = testData.port
    process.env.NODE_ENV = testData.nodeEnv
    process.env.TERMS_AND_CONDITIONS_URL = testData.termsAndConditionsUrl
    process.env.APPLY_SERVICE_URI = testData.applyServiceUri
    process.env.CLAIM_SERVICE_URI = testData.claimServiceUri
    process.env.ENDEMICS_ENABLED = testData.endemicsEnabled

    const config = jest.requireActual('../../../../../app/config/index.js')

    expect(config.default).toEqual({
      messageQueueConfig: expect.any(Object), // These 2 pieces of config are pulled in from other files, so we dont want to test them here
      dbConfig: expect.any(Object),
      applyServiceUri: testData.applyServiceUri,
      claimServiceUri: testData.claimServiceUri,
      endemics: { enabled: true },
      env: testData.nodeEnv,
      isDev: false,
      port: Number(testData.port),
      termsAndConditionsUrl: testData.termsAndConditionsUrl
    })
  })
})
