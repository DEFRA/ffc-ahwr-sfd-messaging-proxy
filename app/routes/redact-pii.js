import HttpStatus from "http-status-codes";

export const redactPiiRequestHandlers = [
  {
    method: 'POST',
    path: '/api/redact/pii',
    handler: async (request, h) => {
      request.logger.info(`Request for redact PII received, agreementsToRedact: ${request.body}`)
      return h.response().code(HttpStatus.OK)
    }
  }
]
