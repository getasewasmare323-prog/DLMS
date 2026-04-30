"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Exercises", "subject", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Exercises", "gradeLevel", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("Exercises", "instructions", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Exercises", "instructions");
    await queryInterface.removeColumn("Exercises", "gradeLevel");
    await queryInterface.removeColumn("Exercises", "subject");
  },
};
