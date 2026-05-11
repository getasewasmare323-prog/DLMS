"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Notification.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      Notification.belongsTo(models.Resource, {
        foreignKey: "resourceId",
        as: "resource",
        onDelete: "CASCADE",
      });
    }
  }
  Notification.init(
    {
      notificationId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      message: DataTypes.STRING,
      read: DataTypes.BOOLEAN,
      userId: DataTypes.UUID,
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resourceId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      gradeLevel: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      actorRole: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Notification",
    },
  );
  return Notification;
};
