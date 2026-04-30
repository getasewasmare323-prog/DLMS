"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ReadingList extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: "creatorId",
        as: "creator",
      });
      this.hasMany(models.ReadingListItem, {
        foreignKey: "readingListId",
        as: "items",
      });
    }
  }
  ReadingList.init(
    {
      readingListId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      creatorId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      gradeLevel: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      visibility: {
        type: DataTypes.ENUM("class", "school"),
        defaultValue: "class",
      },
    },
    {
      sequelize,
      modelName: "ReadingList",
    },
  );
  return ReadingList;
};
