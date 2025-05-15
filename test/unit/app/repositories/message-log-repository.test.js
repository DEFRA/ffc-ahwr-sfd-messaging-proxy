import { set, update } from '../../../../app/repositories/message-log-repository'
import dataModeller from '../../../../app/data/index.js'

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
})
