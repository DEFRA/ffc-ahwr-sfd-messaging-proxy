describe('Logger test', () => {
  test('configures', async () => {
    process.env.NODE_ENV = 'test'
    process.env.USE_PRETTY_PRINT = 'true'

    const logger = require('../../../../app/logger')

    expect(logger).toBeDefined()
  })
})
