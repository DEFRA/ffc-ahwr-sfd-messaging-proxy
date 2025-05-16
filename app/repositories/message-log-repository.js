import dataModeller from '../data/index.js'

export const set = async (data) => {
  const { models } = dataModeller
  await models.messageLog.create(data)
}

export const update = async (id, data) => {
  const { models } = dataModeller
  return models.messageLog.update(data,
    { where: { id } })
}
