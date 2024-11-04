const { models } = require('../data')

const set = async (logger, data) => {
  logger.warn(`Creating message log with id: ${data.id}`)
  return models.messageLog.create(data)
}

module.exports = {
  set
}
