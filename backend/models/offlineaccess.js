"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class OfflineAccess extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      this.belongsTo(models.Resource, {
        foreignKey: "resourceId",
        as: "resource",
      });
      this.belongsTo(models.BorrowTransaction, {
        foreignKey: "transactionId",
        as: "borrowTransaction",
      });
    }
  }
  OfflineAccess.init(
    {
      accessId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      resourceId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      transactionId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      accessToken: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      deviceInfo: {
        type: DataTypes.JSONB, // Store device/browser info
        allowNull: true,
      },
      grantedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      lastAccessedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      downloadStatus: {
        type: DataTypes.ENUM("pending", "downloading", "completed", "failed"),
        defaultValue: "pending",
      },
      filePath: {
        type: DataTypes.STRING, // Path to downloaded file
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "OfflineAccess",
    },
  );
  return OfflineAccess;
};
