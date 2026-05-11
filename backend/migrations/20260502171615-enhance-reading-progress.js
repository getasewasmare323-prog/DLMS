"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns to ReadingProgresses table
    await queryInterface.addColumn("ReadingProgresses", "totalPages", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("ReadingProgresses", "timeSpent", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "Time spent reading in minutes",
    });

    await queryInterface.addColumn("ReadingProgresses", "bookmarks", {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: "Array of bookmarked page numbers or positions",
    });

    await queryInterface.addColumn("ReadingProgresses", "notes", {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: "Array of note objects {page, content, createdAt}",
    });

    await queryInterface.addColumn("ReadingProgresses", "lastReadAt", {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    });

    // Update existing rows to have default values
    await queryInterface.sequelize.query(`
      UPDATE "ReadingProgresses" 
      SET "timeSpent" = 0 
      WHERE "timeSpent" IS NULL;
    `);

    await queryInterface.sequelize.query(`
      UPDATE "ReadingProgresses" 
      SET "bookmarks" = '[]'::jsonb 
      WHERE "bookmarks" IS NULL;
    `);

    await queryInterface.sequelize.query(`
      UPDATE "ReadingProgresses" 
      SET "notes" = '[]'::jsonb 
      WHERE "notes" IS NULL;
    `);

    await queryInterface.sequelize.query(`
      UPDATE "ReadingProgresses" 
      SET "lastReadAt" = NOW() 
      WHERE "lastReadAt" IS NULL;
    `);

    // Now make the columns NOT NULL
    await queryInterface.changeColumn("ReadingProgresses", "timeSpent", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn("ReadingProgresses", "bookmarks", {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });

    await queryInterface.changeColumn("ReadingProgresses", "notes", {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });

    await queryInterface.changeColumn("ReadingProgresses", "lastReadAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    });

    // Add index for performance
    await queryInterface.addIndex("ReadingProgresses", ["lastReadAt"]);
    await queryInterface.addIndex(
      "ReadingProgresses",
      ["userId", "resourceId"],
      { unique: true },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("ReadingProgresses", "totalPages");
    await queryInterface.removeColumn("ReadingProgresses", "timeSpent");
    await queryInterface.removeColumn("ReadingProgresses", "bookmarks");
    await queryInterface.removeColumn("ReadingProgresses", "notes");
    await queryInterface.removeColumn("ReadingProgresses", "lastReadAt");

    // Remove indexes
    await queryInterface.removeIndex("ReadingProgresses", ["lastReadAt"]);
    await queryInterface.removeIndex("ReadingProgresses", [
      "userId",
      "resourceId",
    ]);
  },
};
