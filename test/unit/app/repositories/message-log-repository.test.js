import { redactPII, set, update } from '../../../../app/repositories/message-log-repository'
import dataModeller from '../../../../app/data/index.js'
import { Op } from 'sequelize'

jest.mock('../../../../app/data/index.js', () => {
  return {
    models: {
      messageLog: {
        create: jest.fn(),
        update: jest.fn()
      }
    }
  }
})

describe('message log repository', () => {
  test('it saves data to the DB', () => {
    const testData = { id: 'test-id-1', someOtherStuff: 'im-the-other-stuff ' }
    set(testData)
    expect(dataModeller.models.messageLog.create).toHaveBeenCalledTimes(1)
    expect(dataModeller.models.messageLog.create).toHaveBeenCalledWith({ id: 'test-id-1', someOtherStuff: 'im-the-other-stuff ' })
  })
  test('calls through to update the DB', () => {
    const testData = { status: 'a-status' }
    update('id1', testData)
    expect(dataModeller.models.messageLog.update).toHaveBeenCalledTimes(1)
    expect(dataModeller.models.messageLog.update).toHaveBeenCalledWith({ status: 'a-status' }, { where: { id: 'id1' } })
  })

  describe('redactPII', () => {
    const mockLogger = { info: jest.fn() }

    beforeEach(async () => {
      jest.clearAllMocks()
    })

    test('should call messageLog.update with correct parameters', async () => {
      const agreementReference = 'AHWR-123'
      const mockUpdatedRows = [{ id: 1 }, { id: 2 }]
      dataModeller.models.messageLog.update.mockResolvedValue([mockUpdatedRows.length, mockUpdatedRows])

      await redactPII(agreementReference, '103592529', mockLogger)

      expect(dataModeller.models.messageLog.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.any(Object) }),
        expect.objectContaining({
          where: {
            agreementReference: 'AHWR-123',
            [Op.and]: { val: "data->'outboundMessage'->'data'->'commsAddresses' IS NOT NULL" }
          }
        })
      )
      expect(dataModeller.models.messageLog.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.any(Object) }),
        expect.objectContaining({
          where: {
            agreementReference: 'AHWR-123',
            [Op.and]: { val: "data->'outboundMessage'->'data'->'sbi' IS NOT NULL" }
          }
        })
      )
      expect(dataModeller.models.messageLog.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.any(Object) }),
        expect.objectContaining({
          where: {
            agreementReference: 'AHWR-123',
            [Op.and]: { val: "data->'inboundMessage'->'emailAddress' IS NOT NULL" }
          }
        })
      )
      expect(dataModeller.models.messageLog.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.any(Object) }),
        expect.objectContaining({
          where: {
            agreementReference: 'AHWR-123',
            [Op.and]: { val: "data->'inboundMessage'->'sbi' IS NOT NULL" }
          }
        })
      )
      expect(mockLogger.info).toHaveBeenCalledWith("Redacted field at path 'inboundMessage,emailAddress' in 2 message(s) for agreementReference: AHWR-123")
      expect(mockLogger.info).toHaveBeenCalledWith("Redacted field at path 'inboundMessage,sbi' in 2 message(s) for agreementReference: AHWR-123")
      expect(mockLogger.info).toHaveBeenCalledWith("Redacted field at path 'outboundMessage,data,commsAddresses' in 2 message(s) for agreementReference: AHWR-123")
      expect(mockLogger.info).toHaveBeenCalledWith("Redacted field at path 'outboundMessage,data,commsAddresses' in 2 message(s) for agreementReference: AHWR-123")
      expect(mockLogger.info).toHaveBeenCalledWith('Total redacted fields across messages: 8 for agreementReference: AHWR-123')
    })

    test('should log when no messages are updated', async () => {
      const agreementReference = 'AHWR-123'
      dataModeller.models.messageLog.update.mockResolvedValue([0, []])

      await redactPII(agreementReference, '103592529', mockLogger)

      expect(mockLogger.info).toHaveBeenCalledWith(
        `No messages updated for agreementReference: ${agreementReference}`
      )
    })
  })
})
