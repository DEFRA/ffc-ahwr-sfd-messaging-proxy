import { MESSAGE_RESULT_MAP } from '../../constants/index.js'

export default (sequelize, DataTypes) => {
  const messageLog = sequelize.define('messageLog', {
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
    status: { type: DataTypes.STRING, defaultValue: MESSAGE_RESULT_MAP.unknown },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    freezeTableName: true,
    tableName: 'message_log'
  })
  return messageLog
}
