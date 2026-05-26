"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ActivityLog extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    }
  }

  ActivityLog.init(
    {
      activityLogId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Users",
          key: "userId",
        },
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
        comment:
          "e.g., LOGIN, CREATE_RESOURCE, BORROW, UPDATE_PROFILE, DELETE_RESOURCE, etc.",
      },
      actionType: {
        type: DataTypes.ENUM(
          "CREATE",
          "READ",
          "UPDATE",
          "DELETE",
          "LOGIN",
          "LOGOUT",
          "DOWNLOAD",
          "UPLOAD",
        ),
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM("USER", "RESOURCE", "BORROW", "EXERCISE", "ADMIN"),
        allowNull: false,
      },
      resourceId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      resourceType: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "e.g., Resource, Exercise, BorrowTransaction, User",
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("SUCCESS", "FAILED", "PENDING"),
        defaultValue: "SUCCESS",
      },
      details: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Additional details about the activity",
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ActivityLog",
      tableName: "ActivityLogs",
      timestamps: false,
      indexes: [
        { fields: ["userId"] },
        { fields: ["category"] },
        { fields: ["actionType"] },
        { fields: ["timestamp"] },
        { fields: ["resourceId"] },
      ],
    },
  );

  return ActivityLog;
};
