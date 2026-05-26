"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ActivityLogs", {
      activityLogId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Users",
          key: "userId",
        },
        onDelete: "SET NULL",
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      actionType: {
        type: Sequelize.ENUM(
          "CREATE",
          "READ",
          "UPDATE",
          "DELETE",
          "LOGIN",
          "LOGOUT",
          "DOWNLOAD",
          "UPLOAD",
        ),
        allowNull: false,
      },
      category: {
        type: Sequelize.ENUM("USER", "RESOURCE", "BORROW", "EXERCISE", "ADMIN"),
        allowNull: false,
      },
      resourceId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      resourceType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("SUCCESS", "FAILED", "PENDING"),
        defaultValue: "SUCCESS",
      },
      details: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
    });

    // Create indexes
    await queryInterface.addIndex("ActivityLogs", ["userId"]);
    await queryInterface.addIndex("ActivityLogs", ["category"]);
    await queryInterface.addIndex("ActivityLogs", ["actionType"]);
    await queryInterface.addIndex("ActivityLogs", ["timestamp"]);
    await queryInterface.addIndex("ActivityLogs", ["resourceId"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ActivityLogs");
  },
};
