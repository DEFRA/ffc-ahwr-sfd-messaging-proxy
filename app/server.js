import hapi from '@hapi/hapi'
import joi from 'joi'
import blipp from 'blipp'
import config from './config.js'
import { healthRoutes } from './routes/health.js'
import logger from './logger.js'

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

server.route([...healthRoutes])

const plugins = [logger]

if (config.get('isDev')) {
  plugins.push(blipp)
}

server.register(plugins)

export default server
