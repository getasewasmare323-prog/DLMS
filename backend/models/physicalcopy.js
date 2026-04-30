"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PhysicalCopy extends Model {
    static associate(models) {
      this.belongsTo(models.Resource, {
        foreignKey: "resourceId",
        as: "resource",
      });
      this.hasMany(models.BorrowTransaction, {
        foreignKey: "physicalCopyId",
        as: "borrowTransactions",
      });
    }
  }
  PhysicalCopy.init(
    {
      copyId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      resourceId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      barcode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM("available", "borrowed", "lost", "damaged"),
        defaultValue: "available",
      },
      condition: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      locationNote: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "PhysicalCopy",
    },
  );
  return PhysicalCopy;
};
