import { REDACT_PII_VALUES } from 'ffc-ahwr-common-library'
import dataModeller from '../data/index.js'
import { Sequelize } from 'sequelize'

export const set = async (data) => {
  const { models } = dataModeller
  await models.messageLog.create(data)
}

export const update = async (id, data) => {
  const { models } = dataModeller
  return models.messageLog.update(data,
    { where: { id } })
}

export const redactPII = async (agreementReference, logger) => {
  const { models } = dataModeller

  const data = Sequelize.fn(
    'jsonb_set',
    Sequelize.fn(
      'jsonb_set',
      Sequelize.col('data'),
      Sequelize.literal('\'{inboundMessage,emailAddress}\''),
      Sequelize.literal(`'"${REDACT_PII_VALUES.REDACTED_EMAIL}"'`)
    ),
    Sequelize.literal('\'{outboundMessage,data,commsAddresses}\''),
    Sequelize.literal(`'"${REDACT_PII_VALUES.REDACTED_EMAIL}"'`)
  )

  const [, updatedRows] = await models.messageLog.update(
    { data },
    {
      where: { agreementReference },
      returning: true
    }
  )

  if (updatedRows.length > 0) {
    logger.info(`Redacted PII in ${updatedRows.length} message(s) for agreementReference: ${agreementReference}`)
  } else {
    logger.info(`No messages updated for agreementReference: ${agreementReference}`)
  }
}
