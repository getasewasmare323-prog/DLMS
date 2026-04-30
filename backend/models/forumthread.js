"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ForumThread extends Model {
    static associate(models) {
      ForumThread.belongsTo(models.User, {
        foreignKey: "starterId",
        as: "starter",
      });
      ForumThread.hasMany(models.ForumPost, {
        foreignKey: "threadId",
        as: "posts",
      });
    }
  }
  ForumThread.init(
    {
      threadId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      topic: DataTypes.STRING,
      starterId: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "ForumThread",
    },
  );
  return ForumThread;
};
