import appInsights from 'applicationinsights'

export const setup = () => {
  if (process.env.APPINSIGHTS_CONNECTIONSTRING) {
    appInsights.setup(process.env.APPINSIGHTS_CONNECTIONSTRING).start()
    const cloudRoleTag = appInsights.defaultClient.context.keys.cloudRole
    appInsights.defaultClient.context.tags[cloudRoleTag] = process.env.APPINSIGHTS_CLOUDROLE ?? 'ffc-ahwr-sfd-messaging-proxy'
    return true
  }

  return false
}
