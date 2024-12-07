import { set } from '../../../../app/repositories/message-log-repository'
import dataModeller from '../../../../app/data/index.js'

jest.mock('../../../../app/data/index.js', () => {
  return {
    models: {
      messageLog: {
        create: jest.fn()
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
})
