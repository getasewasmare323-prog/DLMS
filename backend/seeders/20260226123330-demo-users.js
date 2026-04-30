"use strict";

const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          userId: uuidv4(),
          firstName: "Alice",
          lastName: "Anderson",
          email: "alice@example.com",
          password: "password123",
          role: "admin",
          createdAt: now,
          updatedAt: now,
        },
        {
          userId: uuidv4(),
          firstName: "Bob",
          lastName: "Brown",
          email: "bob@example.com",
          password: "secret",
          role: "student",
          createdAt: now,
          updatedAt: now,
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "Users",
      {
        email: { [Sequelize.Op.in]: ["alice@example.com", "bob@example.com"] },
      },
      {},
    );
  },
};
