"use strict";

const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert(
      "Resources",
      [
        {
          resourceId: uuidv4(),
          title: "1984",
          subject: "George Orwell",
          gradeLevel: null,
          filePath: "/files/1984.pdf",
          contentType: "single",
          contentData: JSON.stringify({ published_year: 1949, category_id: 1 }),
          resourceType: "reading",
          userId: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          resourceId: uuidv4(),
          title: "To Kill a Mockingbird",
          subject: "Harper Lee",
          gradeLevel: null,
          filePath: "/files/mockingbird.pdf",
          contentType: "single",
          contentData: JSON.stringify({ published_year: 1960, category_id: 2 }),
          resourceType: "reading",
          userId: null,
          createdAt: now,
          updatedAt: now,
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "Resources",
      { resourceType: "reading" },
      {},
    );
  },
};
