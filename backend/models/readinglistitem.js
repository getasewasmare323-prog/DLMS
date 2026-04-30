"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ReadingListItem extends Model {
    static associate(models) {
      this.belongsTo(models.ReadingList, {
        foreignKey: "readingListId",
        as: "readingList",
      });
      this.belongsTo(models.Resource, {
        foreignKey: "resourceId",
        as: "resource",
      });
    }
  }
  ReadingListItem.init(
    {
      readingListItemId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      readingListId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      resourceId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ReadingListItem",
    },
  );
  return ReadingListItem;
};
