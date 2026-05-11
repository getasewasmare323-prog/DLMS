"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Reservations", {
      reservationId: {
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
      status: {
        type: Sequelize.ENUM("active", "fulfilled", "cancelled", "expired"),
        defaultValue: "active",
        allowNull: false,
      },
      reservedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      queuePosition: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      notifiedAt: {
        type: Sequelize.DATE,
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
    await queryInterface.addIndex("Reservations", ["userId"]);
    await queryInterface.addIndex("Reservations", ["resourceId"]);
    await queryInterface.addIndex("Reservations", ["status"]);
    await queryInterface.addIndex("Reservations", ["expiresAt"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Reservations");
  },
};
