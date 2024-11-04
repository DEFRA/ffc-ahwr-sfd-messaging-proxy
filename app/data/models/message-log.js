const { UNKNOWN } = require('../../model/message-statuses')

module.exports = (sequelize, DataTypes) => {
  const documentLog = sequelize.define('messageLog', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      autoIncrement: false,
      defaultValue: sequelize.UUIDV4
    },
    agreementReference: DataTypes.STRING,
    claimReference: DataTypes.STRING,
    templateId: DataTypes.STRING,
    data: DataTypes.JSONB,
    status: { type: DataTypes.STRING, defaultValue: UNKNOWN },
    createdAt: { type: DataTypes.DATE, defaultValue: Date.now() },
    updatedAt: { type: DataTypes.DATE, defaultValue: null }
  }, {
    freezeTableName: true,
    tableName: 'message_log'
  })
  return documentLog
}
