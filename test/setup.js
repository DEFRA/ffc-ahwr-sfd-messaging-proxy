jest.mock('../app/repositories/message-log-repository', () => ({
  set: jest.fn()
}))

jest.mock('../app/messaging/forward-message-request-to-sfd', () => ({
  sendSfdMessageRequest: jest.fn()
}))
