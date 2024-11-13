import { validateMessageRequest } from '../../../../app/messaging/message-request-schema'

const mockErrorLogger = jest.fn()

const mockedLogger = {
  warn: jest.fn(),
  error: mockErrorLogger,
  info: jest.fn()
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
    expect(mockErrorLogger).toHaveBeenCalledTimes(0)
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
    expect(mockErrorLogger).toHaveBeenCalledTimes(1)
    expect(mockErrorLogger).toHaveBeenCalledWith('Message request validation error, message: ValidationError: "crn" must be greater than or equal to 1050000000')
  })
})
