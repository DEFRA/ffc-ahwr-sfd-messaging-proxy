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

  // eslint-disable-next-line no-unused-vars
  // const [_, updates] = await models.application.update(
  await models.messageLog.update(
    { data },
    {
      where: { agreementReference },
      returning: true
    }
  )

  // TODO 1067 add later
  // const [updatedRecord] = updates
  // const { updatedAt, data: { organisation: { sbi } } } = updatedRecord.dataValues

  // const eventData = {
  //   applicationReference: reference,
  //   reference,
  //   updatedProperty,
  //   newValue,
  //   oldValue,
  //   note
  // }
  // const type = `application-${updatedProperty}`
  // await claimDataUpdateEvent(eventData, type, user, updatedAt, sbi)

  // await buildData.models.claim_update_history.create({
  //   applicationReference: reference,
  //   reference,
  //   note,
  //   updatedProperty,
  //   newValue,
  //   oldValue,
  //   eventType: type,
  //   createdBy: user
  // })
}
