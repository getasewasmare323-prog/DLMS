"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SystemSetting extends Model {
    static associate() {}
  }
  SystemSetting.init(
    {
      settingKey: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      settingValue: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "SystemSetting",
    },
  );
  return SystemSetting;
};
