"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Resource extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      this.belongsTo(models.User, {
        foreignKey: "approvedBy",
        as: "approver",
      });
      this.hasMany(models.PhysicalCopy, {
        foreignKey: "resourceId",
        as: "physicalCopies",
        onDelete: "CASCADE",
        hooks: true,
      });
      this.hasMany(models.BorrowTransaction, {
        foreignKey: "resourceId",
        as: "borrowTransactions",
        onDelete: "CASCADE",
        hooks: true,
      });
      this.hasMany(models.Bookmark, {
        foreignKey: "resourceId",
        as: "bookmarks",
        onDelete: "CASCADE",
        hooks: true,
      });
      this.hasMany(models.ReadingListItem, {
        foreignKey: "resourceId",
        as: "readingListItems",
        onDelete: "CASCADE",
        hooks: true,
      });
      this.hasMany(models.ReadingProgress, {
        foreignKey: "resourceId",
        as: "readingProgressEntries",
        onDelete: "CASCADE",
        hooks: true,
      });
      this.hasMany(models.Rating, {
        foreignKey: "resourceId",
        as: "ratings",
        onDelete: "CASCADE",
        hooks: true,
      });
      this.hasMany(models.Notification, {
        foreignKey: "resourceId",
        as: "notifications",
        onDelete: "CASCADE",
        hooks: true,
      });
    }
  }
  Resource.init(
    {
      resourceId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: DataTypes.STRING,
      author: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      subject: DataTypes.STRING,
      gradeLevel: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      keywords: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      filePath: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fileHash: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      resourceType: {
        type: DataTypes.ENUM("video", "reading"),
        allowNull: false,
      },
      contentType: {
        type: DataTypes.ENUM("single", "playlist"),
        defaultValue: "single",
      },
      contentData: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      formatType: {
        type: DataTypes.ENUM("digital", "physical", "hybrid"),
        defaultValue: "digital",
      },
      accessLevel: {
        type: DataTypes.ENUM(
          "public",
          "restricted",
          "class-only",
          "teacher-only",
        ),
        defaultValue: "public",
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected", "archived"),
        defaultValue: "approved",
      },
      totalCopies: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      availableCopies: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      shelfLocation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reviewNote: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      approvedBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Resource",
      scopes: {
        videos: { where: { resourceType: "video" } },
        reading: { where: { resourceType: "reading" } },
      },
    },
  );
  return Resource;
};
