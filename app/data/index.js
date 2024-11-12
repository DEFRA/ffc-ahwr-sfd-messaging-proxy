import { Sequelize, DataTypes } from 'sequelize'
import config from '../config/db.js'
import messageLogFn from './models/message-log.js'

const dbConfig = config[process.env.NODE_ENV]

export default (() => {
  const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig)

  // This needs to be done for each table we define in /models
  const messageLog = messageLogFn(sequelize, DataTypes)

  if (messageLog.associate) {
    messageLog.associate(sequelize.models)
  }

  return {
    models: sequelize.models,
    sequelize
  }
})()
