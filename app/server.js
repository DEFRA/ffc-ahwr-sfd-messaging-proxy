const Hapi = require('@hapi/hapi')
const Joi = require('joi')
const { registerPlugins } = require('./plugins/index.js')
const config = require('./config.js')

async function createServer () {
  const server = Hapi.server({
    host: config.get('host'),
    port: config.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    },
    router: {
      stripTrailingSlash: true
    }
  })

  server.validator(Joi)
  await registerPlugins(server)

  return server
}

module.exports = {
  createServer
}
