import hapi from '@hapi/hapi'
import joi from 'joi'
import { config } from './config.js'
import { healthRoutes } from './routes/health.js'

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

export default server
