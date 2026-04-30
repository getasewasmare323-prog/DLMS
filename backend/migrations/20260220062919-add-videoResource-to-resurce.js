"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("Resources", "resourceType", {
      type: Sequelize.ENUM("video", "reading"),
      allowNull: false,
    });
    await queryInterface.addColumn("Resources", "contentType", {
      type: Sequelize.ENUM("single", "playlist"), // Helpful for videos
      defaultValue: "single",
    });
    // Use JSONB for playlists (stores array of URLs/Titles)
    // or a simple STRING for file paths/single URLs
    await queryInterface.addColumn("Resources", "contentData", {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Resources", "resourceType");
    await queryInterface.removeColumn("Resources", "contentType");
    await queryInterface.removeColumn("Resources", "contentData");
  },
};
