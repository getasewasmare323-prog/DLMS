"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ensure the column has the correct type and add FK constraint
    await queryInterface.changeColumn("Questions", "exerciseId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "Exercises",
        key: "exerciseId",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // in case changeColumn does not add a named constraint, explicitly add one
    await queryInterface.addConstraint("Questions", {
      fields: ["exerciseId"],
      type: "foreign key",
      name: "fk_questions_exerciseId",
      references: {
        table: "Exercises",
        field: "exerciseId",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    // remove the FK constraint and restore column definition
    await queryInterface.removeConstraint(
      "Questions",
      "fk_questions_exerciseId",
    );
    await queryInterface.changeColumn("Questions", "exerciseId", {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },
};
