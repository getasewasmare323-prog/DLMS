"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Resources", "author", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Resources", "description", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("Resources", "keywords", {
      type: Sequelize.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn("Resources", "formatType", {
      type: Sequelize.ENUM("digital", "physical", "hybrid"),
      allowNull: false,
      defaultValue: "digital",
    });
    await queryInterface.addColumn("Resources", "accessLevel", {
      type: Sequelize.ENUM("public", "restricted", "class-only", "teacher-only"),
      allowNull: false,
      defaultValue: "public",
    });
    await queryInterface.addColumn("Resources", "status", {
      type: Sequelize.ENUM("pending", "approved", "rejected", "archived"),
      allowNull: false,
      defaultValue: "approved",
    });
    await queryInterface.addColumn("Resources", "totalCopies", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn("Resources", "availableCopies", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn("Resources", "shelfLocation", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Resources", "reviewNote", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("Resources", "approvedBy", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "Users",
        key: "userId",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addColumn("Resources", "approvedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.createTable("PhysicalCopies", {
      copyId: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      resourceId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Resources",
          key: "resourceId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      barcode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.ENUM("available", "borrowed", "lost", "damaged"),
        allowNull: false,
        defaultValue: "available",
      },
      condition: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      locationNote: {
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

    await queryInterface.createTable("BorrowTransactions", {
      transactionId: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "userId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      resourceId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Resources",
          key: "resourceId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      physicalCopyId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "PhysicalCopies",
          key: "copyId",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      borrowType: {
        type: Sequelize.ENUM("digital", "physical"),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("active", "returned", "overdue", "cancelled"),
        allowNull: false,
        defaultValue: "active",
      },
      borrowedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      dueAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      returnedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      accessExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      issuedBy: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      returnProcessedBy: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
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

    await queryInterface.createTable("Bookmarks", {
      bookmarkId: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "userId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      resourceId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Resources",
          key: "resourceId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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

    await queryInterface.addConstraint("Bookmarks", {
      fields: ["userId", "resourceId"],
      type: "unique",
      name: "bookmarks_user_resource_unique",
    });

    await queryInterface.createTable("ReadingLists", {
      readingListId: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      creatorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "userId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      gradeLevel: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      visibility: {
        type: Sequelize.ENUM("class", "school"),
        allowNull: false,
        defaultValue: "class",
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

    await queryInterface.createTable("ReadingListItems", {
      readingListItemId: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      readingListId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "ReadingLists",
          key: "readingListId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      resourceId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Resources",
          key: "resourceId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      note: {
        type: Sequelize.TEXT,
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

    await queryInterface.createTable("ReadingProgresses", {
      progressId: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "userId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      resourceId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Resources",
          key: "resourceId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      progressPercent: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      lastPage: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      completedAt: {
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

    await queryInterface.addConstraint("ReadingProgresses", {
      fields: ["userId", "resourceId"],
      type: "unique",
      name: "reading_progress_user_resource_unique",
    });

    await queryInterface.createTable("SystemSettings", {
      settingKey: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      settingValue: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      description: {
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("SystemSettings");
    await queryInterface.removeConstraint(
      "ReadingProgresses",
      "reading_progress_user_resource_unique",
    );
    await queryInterface.dropTable("ReadingProgresses");
    await queryInterface.dropTable("ReadingListItems");
    await queryInterface.dropTable("ReadingLists");
    await queryInterface.removeConstraint(
      "Bookmarks",
      "bookmarks_user_resource_unique",
    );
    await queryInterface.dropTable("Bookmarks");
    await queryInterface.dropTable("BorrowTransactions");
    await queryInterface.dropTable("PhysicalCopies");

    await queryInterface.removeColumn("Resources", "approvedAt");
    await queryInterface.removeColumn("Resources", "approvedBy");
    await queryInterface.removeColumn("Resources", "reviewNote");
    await queryInterface.removeColumn("Resources", "shelfLocation");
    await queryInterface.removeColumn("Resources", "availableCopies");
    await queryInterface.removeColumn("Resources", "totalCopies");
    await queryInterface.removeColumn("Resources", "status");
    await queryInterface.removeColumn("Resources", "accessLevel");
    await queryInterface.removeColumn("Resources", "formatType");
    await queryInterface.removeColumn("Resources", "keywords");
    await queryInterface.removeColumn("Resources", "description");
    await queryInterface.removeColumn("Resources", "author");
  },
};
