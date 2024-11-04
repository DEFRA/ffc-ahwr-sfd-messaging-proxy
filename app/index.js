const { setup } = require('./insights.js')
require('log-timestamp')
const messaging = require('../messaging')
const { createServer } = require('./server.js')

let serverLogger

const init = async () => {
  const server = await createServer()
  await server.start()
  serverLogger = server.logger
  serverLogger.warn(`Server running on ${server.info.uri}`)
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

process.on('SIGTERM', async () => {
  await messaging.stop()
  process.exit(0)
})

process.on('SIGINT', async () => {
  await messaging.stop()
  process.exit(0)
})

module.exports = (async function startService () {
  setup()
  await init()
  await messaging.start(serverLogger)
}())
