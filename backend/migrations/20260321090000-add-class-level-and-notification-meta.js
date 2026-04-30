"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "classLevel", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("Notifications", "title", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Notifications", "resourceId", {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await queryInterface.addColumn("Notifications", "gradeLevel", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("Notifications", "actorRole", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Notifications", "actorRole");
    await queryInterface.removeColumn("Notifications", "gradeLevel");
    await queryInterface.removeColumn("Notifications", "resourceId");
    await queryInterface.removeColumn("Notifications", "title");
    await queryInterface.removeColumn("Users", "classLevel");
  },
};
