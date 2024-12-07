import { validateMessageRequest } from '../../../../app/messaging/message-request-schema'

const mockSetBindingsLogger = jest.fn()
const mockedLogger = {
  setBindings: mockSetBindingsLogger
}

describe('validateMessageRequest', () => {
  test('it returns true if the validation is successful', () => {
    const event = {
      crn: 1050000003,
      sbi: 105000003,
      agreementReference: 'somereference',
      claimReference: 'somereference',
      notifyTemplateId: '123456fc-9999-40c1-a11d-85f55aff4d99',
      emailAddress: 'someEmail@email.com',
      customParams: {},
      dateTime: new Date()
    }
    expect(validateMessageRequest(mockedLogger, event)).toBeTruthy()
    expect(mockSetBindingsLogger).toHaveBeenCalledTimes(0)
  })

  test('it returns false if the validation is unsuccessful', () => {
    const event = {
      crn: 105,
      sbi: 105000003,
      agreementReference: 'somereference',
      claimReference: 'somereference',
      notifyTemplateId: '123456fc-9999-40c1-a11d-85f55aff4d99',
      emailAddress: 'someEmail@email.com',
      customParams: {},
      dateTime: new Date()
    }
    expect(validateMessageRequest(mockedLogger, event)).toBeFalsy()
    expect(mockSetBindingsLogger).toHaveBeenCalledTimes(1)
    expect(mockSetBindingsLogger).toHaveBeenCalledWith({
      validationError: expect.any(Object)
    })
  })
})
