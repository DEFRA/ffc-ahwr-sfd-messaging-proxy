import { REDACT_PII_VALUES } from 'ffc-ahwr-common-library'
import dataModeller from '../data/index.js'
import { Sequelize, Op } from 'sequelize'

export const set = async (data) => {
  const { models } = dataModeller
  await models.messageLog.create(data)
}

export const update = async (id, data) => {
  const { models } = dataModeller
  return models.messageLog.update(data,
    { where: { id } })
}

export const redactPII = async (agreementReference, redactedSbi, logger) => {
  const { models } = dataModeller

  const redactedValueByJSONPath = {
    'inboundMessage,emailAddress': REDACT_PII_VALUES.REDACTED_EMAIL,
    'inboundMessage,sbi': redactedSbi,
    'outboundMessage,data,commsAddresses': REDACT_PII_VALUES.REDACTED_EMAIL,
    'outboundMessage,data,sbi': redactedSbi
  }

  let totalUpdates = 0

  for (const [jsonPath, redactedValue] of Object.entries(redactedValueByJSONPath)) {
    const jsonPathSql = jsonPath.split(',').map(key => `->'${key}'`).join('')

    const [affectedCount] = await models.messageLog.update(
      {
        data: Sequelize.fn(
          'jsonb_set',
          Sequelize.col('data'),
          Sequelize.literal(`'{${jsonPath}}'`),
          Sequelize.literal(`'"${redactedValue}"'`)
        )
      },
      {
        where: {
          agreementReference,
          [Op.and]: Sequelize.literal(`data${jsonPathSql} IS NOT NULL`)
        }
      }
    )

    totalUpdates += affectedCount
    logger.info(`Redacted field at path '${jsonPath}' in ${affectedCount} message(s) for agreementReference: ${agreementReference}`)
  }

  if (totalUpdates > 0) {
    logger.info(`Total redacted fields across messages: ${totalUpdates} for agreementReference: ${agreementReference}`)
  } else {
    logger.info(`No messages updated for agreementReference: ${agreementReference}`)
  }
}
