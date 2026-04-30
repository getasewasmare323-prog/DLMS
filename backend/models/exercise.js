"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Exercise extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: "creatorId",
        as: "creator",
      });
      this.hasMany(models.Question, {
        foreignKey: "exerciseId",
        as: "quizQuestions",
        onDelete: "CASCADE",
      });
    }
  }
  Exercise.init(
    {
      exerciseId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      creatorId: DataTypes.UUID,
      title: DataTypes.STRING,
      subject: DataTypes.STRING,
      gradeLevel: DataTypes.INTEGER,
      instructions: DataTypes.TEXT,
      timeLimit: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Exercise",
    },
  );
  return Exercise;
};
