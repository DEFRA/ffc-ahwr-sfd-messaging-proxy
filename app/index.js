import { setup } from './insights.js'
import { startSfdMessageReceiver, stopSfdMessageReceiver } from './messaging/index.js'
import { startServer } from './server.js'

const init = async () => {
  const appInsightsRunning = setup()
  const server = await startServer()
  await server.start()

  server.logger.setBindings({ appInsightsRunning })
  await startSfdMessageReceiver(server.logger)

  server.logger.info(`Server running on ${server.info.uri}`)
  server.logger.info(`Application insights ${appInsightsRunning ? '' : 'not '}running`)

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
}

init()
