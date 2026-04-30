"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Exercise, {
        foreignKey: "exerciseId",
        as: "exercise",
      });
    }
  }
  Question.init(
    {
      exerciseId: DataTypes.UUID,
      content: DataTypes.TEXT,
      optionA: DataTypes.STRING,
      optionB: DataTypes.STRING,
      optionC: DataTypes.STRING,
      optionD: DataTypes.STRING,
      correctAnswer: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Question",
    },
  );
  return Question;
};
