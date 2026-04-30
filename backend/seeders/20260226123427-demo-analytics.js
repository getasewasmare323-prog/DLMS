"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert(
      "AnalyticsEvents",
      [
        {
          userId: 1,
          eventType: "login",
          timestamp: now,
          createdAt: now,
          updatedAt: now,
        },
        {
          userId: 2,
          eventType: "view_resource",
          timestamp: now,
          createdAt: now,
          updatedAt: now,
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("AnalyticsEvents", null, {});
  },
};
