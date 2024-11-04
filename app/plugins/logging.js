const HapiPino = require('hapi-pino')

const plugin = {
  plugin: HapiPino,
  options: {
    logPayload: true,
    level: 'warn'
  }
}

module.exports = plugin
