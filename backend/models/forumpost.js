"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ForumPost extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ForumPost.belongsTo(models.ForumThread, {
        foreignKey: "threadId",
        as: "thread",
      });
      ForumPost.belongsTo(models.User, {
        foreignKey: "authorId",
        as: "author",
      });
    }
  }
  ForumPost.init(
    {
      postId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      content: DataTypes.TEXT,
      threadId: DataTypes.UUID,
      authorId: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "ForumPost",
    },
  );
  return ForumPost;
};
