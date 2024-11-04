const Blipp = require('blipp')
const logging = require('./logging.js')
const router = require('./router.js')
const config = require('../config.js')

async function registerPlugins (server) {
  const plugins = [
    logging,
    router
  ]

  if (config.get('isDev')) {
    plugins.push(Blipp)
  }

  await server.register(plugins)
}

module.exports = {
  registerPlugins
}
