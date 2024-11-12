import dataModeller from '../data/index.js'

export const set = async (logger, data) => {
  logger.warn(`Creating message log with id: ${data.id}`)
  const { models } = dataModeller
  return models.messageLog.create(data)
}
