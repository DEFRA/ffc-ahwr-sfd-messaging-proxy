jest.mock('../app/repositories/message-log-repository', () => ({
  set: jest.fn()
}))
