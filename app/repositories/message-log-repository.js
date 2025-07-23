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

export const redactPII = async (agreementReference) => {
  const { models } = dataModeller

  // TODO 1067 move to shared lib
  const REDACT_PII_VALUES = {
    REDACTED_EMAIL: 'redacted.email@example.com'
  }

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

  // TODO 1067 add logging to say what was updated? 
  // eslint-disable-next-line no-unused-vars
  // const [_, updates] = await models.messageLog.update(
  await models.messageLog.update(
    { data },
    {
      where: { agreementReference },
      returning: true
    }
  )
}
