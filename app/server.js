import hapi from '@hapi/hapi'
import joi from 'joi'
import { config } from './config.js'
import { healthRoutes } from './routes/health.js'
import { redactPiiRequestHandlers } from './routes/redact-pii.js'
import logger from './logger.js'

const startServer = async () => {
  const server = hapi.server({
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

  server.validator(joi)

  await server.register([logger])

  server.route([...healthRoutes, ...redactPiiRequestHandlers])

  return server
}

export default startServer
