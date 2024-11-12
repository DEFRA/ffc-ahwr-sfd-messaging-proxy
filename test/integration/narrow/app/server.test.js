import server from '../../../../app/server.js'

describe('Server test', () => {
  test('createServer returns server', async () => {
    await server.initialize()
    expect(server).toBeDefined()
  })
})
