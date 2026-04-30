"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Rating.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      Rating.belongsTo(models.Resource, {
        foreignKey: "resourceId",
        as: "resource",
      });
    }
  }
  Rating.init(
    {
      ratingId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "userId",
        },
      },
      resourceId: DataTypes.UUID,
      score: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Rating",
    },
  );
  return Rating;
};
