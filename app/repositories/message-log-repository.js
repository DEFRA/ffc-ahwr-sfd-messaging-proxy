import dataModeller from '../data/index.js'

export const set = async (logger, data) => {
  logger.info(`Creating message log with id: ${data.id}`)
  const { models } = dataModeller
  models.messageLog.create(data)
}
