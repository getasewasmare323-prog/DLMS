"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("OfflineAccesses", {
      accessId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "userId",
        },
        onDelete: "CASCADE",
      },
      resourceId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Resources",
          key: "resourceId",
        },
        onDelete: "CASCADE",
      },
      transactionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "BorrowTransactions",
          key: "transactionId",
        },
        onDelete: "CASCADE",
      },
      accessToken: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      deviceInfo: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      grantedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      lastAccessedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      downloadStatus: {
        type: Sequelize.ENUM("pending", "downloading", "completed", "failed"),
        defaultValue: "pending",
        allowNull: false,
      },
      filePath: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add indexes for performance
    await queryInterface.addIndex("OfflineAccesses", ["userId"]);
    await queryInterface.addIndex("OfflineAccesses", ["resourceId"]);
    await queryInterface.addIndex("OfflineAccesses", ["transactionId"]);
    await queryInterface.addIndex("OfflineAccesses", ["accessToken"], {
      unique: true,
    });
    await queryInterface.addIndex("OfflineAccesses", ["expiresAt"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("OfflineAccesses");
  },
};
