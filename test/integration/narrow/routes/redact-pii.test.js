import { startServer } from '../../../../app/server.js'
import HttpStatus from 'http-status-codes'
import { redactPII } from '../../../../app/repositories/message-log-repository.js'

jest.mock('../../../../app/repositories/message-log-repository.js')

const mockAgreementsToRedact = [
  { reference: 'FAKE-REF-1' },
  { reference: 'FAKE-REF-2' }
]

describe('redact-pii', () => {
  let server

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await startServer()
    await server.initialize()
  })

  describe('POST /api/redact/pii', () => {
    test('should return OK status when called with agreementsToRedact in payload', async () => {
      const res = await server.inject({ method: 'POST', url: '/api/redact/pii', payload: { agreementsToRedact: mockAgreementsToRedact } })

      expect(redactPII).toHaveBeenCalledTimes(2)
      expect(redactPII).toHaveBeenCalledWith('FAKE-REF-1', expect.any(Object))
      expect(redactPII).toHaveBeenCalledWith('FAKE-REF-2', expect.any(Object))
      expect(res.statusCode).toBe(HttpStatus.OK)
    })
  })
})
