"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Resource, { foreignKey: "userId", as: "resources" });
      this.hasMany(models.Resource, {
        foreignKey: "approvedBy",
        as: "approvedResources",
      });
      this.hasMany(models.Notification, {
        foreignKey: "userId",
        as: "notifications",
      });
      this.hasMany(models.Exercise, {
        foreignKey: "creatorId",
        as: "exercises",
      });
      this.hasMany(models.Rating, { foreignKey: "userId", as: "rating" });
      this.hasMany(models.BorrowTransaction, {
        foreignKey: "userId",
        as: "borrowTransactions",
      });
      this.hasMany(models.Bookmark, {
        foreignKey: "userId",
        as: "bookmarks",
      });
      this.hasMany(models.ReadingList, {
        foreignKey: "creatorId",
        as: "readingLists",
      });
      this.hasMany(models.ReadingProgress, {
        foreignKey: "userId",
        as: "readingProgressEntries",
      });
    }
  }
  User.init(
    {
      userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: "student",
      },
      classLevel: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetTokenExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
    },
  );
  return User;
};
