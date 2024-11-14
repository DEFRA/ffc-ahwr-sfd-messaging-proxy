export const healthRoutes = [{
  method: 'GET',
  path: '/healthy',
  handler: (request, h) => {
    return h.response('ok')
  }
}, {
  method: 'GET',
  path: '/healthz',
  handler: (request, h) => {
    return h.response('ok')
  }
}]
