"use strict";

const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // assume users already seeded, we will query them to get ids
    const users = await queryInterface.sequelize.query(
      `SELECT "userId" FROM "Users" WHERE email IN ('alice@example.com','bob@example.com');`,
    );
    const userIds = users[0].map((r) => r.userId);
    const now = new Date();
    await queryInterface.bulkInsert(
      "Resources",
      [
        {
          resourceId: uuidv4(),
          title: "Introduction to Algebra",
          subject: "Math",
          gradeLevel: 8,
          filePath: "/files/algebra.pdf",
          resourceType: "reading",
          contentType: "single",
          contentData: JSON.stringify({ url: "/files/algebra.pdf" }),
          userId: userIds[0],
          createdAt: now,
          updatedAt: now,
        },
        {
          resourceId: uuidv4(),
          title: "Biology Basics",
          subject: "Science",
          gradeLevel: 9,
          filePath: "/files/biology.mp4",
          resourceType: "video",
          contentType: "single",
          contentData: JSON.stringify({ url: "/files/biology.mp4" }),
          userId: userIds[1],
          createdAt: now,
          updatedAt: now,
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Resources", null, {});
  },
};
