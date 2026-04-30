"use strict";

const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT "userId" FROM "Users" LIMIT 1;`,
    );
    const creatorId = users[0][0].userId;
    const now = new Date();
    const exerciseId = uuidv4();

    await queryInterface.bulkInsert(
      "Exercises",
      [
        {
          exerciseId,
          creatorId,
          title: "Sample Quiz",
          questions: JSON.stringify([
            { question: "2+2?", options: [2, 3, 4, 5], answer: 4 },
          ]),
          timeLimit: 300,
          createdAt: now,
          updatedAt: now,
        },
      ],
      {},
    );

    // also seed into Questions table
    await queryInterface.bulkInsert(
      "Questions",
      [
        {
          exerciseId,
          content: "What is 2+2?",
          optionA: "2",
          optionB: "3",
          optionC: "4",
          optionD: "5",
          correctAnswer: "C",
          createdAt: now,
          updatedAt: now,
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Questions", null, {});
    await queryInterface.bulkDelete("Exercises", null, {});
  },
};
