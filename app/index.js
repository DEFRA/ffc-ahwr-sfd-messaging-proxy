import { setup } from './insights.js'
import 'log-timestamp'
import { startSfdMessageReceiver, stopSfdMessageReceiver } from './messaging/index.js'
import server from './server.js'
import logger from './logger.js'

const init = async () => {
  await server.register([logger])
  await server.start()
  setup(server.logger)

  await startSfdMessageReceiver(server.logger)

  server.logger.info(`Server running on ${server.info.uri}`)
}

process.on('unhandledRejection', async (err) => {
  await stopSfdMessageReceiver()
  server.logger.error(err, 'unhandledRejection')
  process.exit(1)
})

process.on('SIGTERM', async () => {
  await stopSfdMessageReceiver()
  server.logger.error('SIGTERM')
  process.exit(0)
})

process.on('SIGINT', async () => {
  await stopSfdMessageReceiver()
  server.logger.error('SIGINT')
  process.exit(0)
})

init()
