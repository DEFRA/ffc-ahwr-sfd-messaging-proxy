export const piiRedactRequestHandlers = [
  {
    method: 'POST',
    path: '/api/redact/pii',
    handler: async (request, h) => {
      request.logger.info('Request for PII redact received')
      return h.response().code(200)
    }
  }
]
