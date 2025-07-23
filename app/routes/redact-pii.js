import HttpStatus from 'http-status-codes'
import { redactPII } from '../repositories/message-log-repository.js'

export const redactPiiRequestHandlers = [
  {
    method: 'POST',
    path: '/api/redact/pii',
    handler: async (request, h) => {
      request.logger.info('Request for redact PII received')

      request.payload.agreementsToRedact.forEach(agreementToRedact => {
        redactPII(agreementToRedact.reference)
      })

      return h.response().code(HttpStatus.OK)
    }
  }
]
