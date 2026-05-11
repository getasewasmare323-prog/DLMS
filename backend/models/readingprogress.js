"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ReadingProgress extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      this.belongsTo(models.Resource, {
        foreignKey: "resourceId",
        as: "resource",
      });
    }
  }
  ReadingProgress.init(
    {
      progressId: {
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
      progressPercent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      lastPage: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      totalPages: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      timeSpent: {
        type: DataTypes.INTEGER, // in minutes
        allowNull: false,
        defaultValue: 0,
      },
      bookmarks: {
        type: DataTypes.JSONB, // Array of page numbers or positions
        allowNull: true,
        defaultValue: [],
      },
      notes: {
        type: DataTypes.JSONB, // Array of note objects {page, content, createdAt}
        allowNull: true,
        defaultValue: [],
      },
      lastReadAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ReadingProgress",
    },
  );
  return ReadingProgress;
};
