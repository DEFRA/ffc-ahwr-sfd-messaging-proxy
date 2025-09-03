import { config } from '../../../../app/config/db.js'

jest.mock('@azure/identity')

describe('DB config', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('defaults used to populate all fields where not explicitly set', async () => {
    const { config } = require('../../../../app/config/db.js') // This style of dynamic import is needed to get the process.env setting to work properly

    expect(config).toHaveProperty('development')
    expect(config).toHaveProperty('test')
    expect(config).toHaveProperty('production')
    expect(config).toHaveProperty('test.database', 'ffc_ahwr_sfd_messaging_proxy')
    expect(config).toHaveProperty('test.host', 'ffc-ahwr-sfd-messaging-proxy-postgres')
    expect(config).toHaveProperty('test.port', '5432')
    expect(config).toHaveProperty('test.schema', 'public')
  })

  test('overrides used to populate all fields where explicitly set', () => {
    process.env.POSTGRES_PORT = '5433'
    process.env.POSTGRES_DB = 'some_db'
    process.env.POSTGRES_HOST = 'some-host'
    process.env.POSTGRES_SCHEMA_NAME = 'schema'

    const { config } = require('../../../../app/config/db.js') // This style of dynamic import is needed to get the process.env setting to work properly

    expect(config).toHaveProperty('development')
    expect(config).toHaveProperty('test')
    expect(config).toHaveProperty('production')
    expect(config).toHaveProperty('test.database', 'some_db')
    expect(config).toHaveProperty('test.host', 'some-host')
    expect(config).toHaveProperty('test.port', '5433')
    expect(config).toHaveProperty('test.schema', 'schema')
  })

  test('beforeConnect hook takes no action when env is not prod', async () => {
    const { config } = require('../../../../app/config/db.js')
    const configObject = {}
    await config.test.hooks.beforeConnect(configObject)
    expect(configObject).not.toHaveProperty('password')
  })

  test('beforeConnect hook calls getBearerTokenProvider to set password when env is prod', async () => {
    process.env.NODE_ENV = 'production'
    process.env.AZURE_CLIENT_ID = 'sfd-messaging'

    const configObject = {}
    await config.test.hooks.beforeConnect(configObject)
    expect(configObject).toHaveProperty('password')
  })
})
