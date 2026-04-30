"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BorrowTransaction extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      this.belongsTo(models.Resource, {
        foreignKey: "resourceId",
        as: "resource",
      });
      this.belongsTo(models.PhysicalCopy, {
        foreignKey: "physicalCopyId",
        as: "physicalCopy",
      });
    }
  }
  BorrowTransaction.init(
    {
      transactionId: {
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
      physicalCopyId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      borrowType: {
        type: DataTypes.ENUM("digital", "physical"),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "returned", "overdue", "cancelled"),
        defaultValue: "active",
      },
      borrowedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      dueAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      returnedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      accessExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      issuedBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      returnProcessedBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "BorrowTransaction",
    },
  );
  return BorrowTransaction;
};
