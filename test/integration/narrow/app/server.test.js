import startServer from '../../../../app/server.js'

describe('Server test', () => {
  let server

  beforeEach(async () => {
    server = await startServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  test('createServer returns server', async () => {
    await server.initialize()
    expect(server).toBeDefined()
  })
})
