"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) =>
        tables.includes(
          "eval_income_approach_other_source"
        )
      );

    if (!tableExists) {
      await queryInterface.createTable("eval_income_approach_other_source", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        evaluation_income_approach_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        type: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        monthly_income: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        annual_income: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        square_feet: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        comments: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        date_created: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        last_updated: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      });
      await queryInterface.addIndex(
        "eval_income_approach_other_source",
        ["evaluation_income_approach_id"],
        { name: "evaluation_income_approach_id" }
      );
      await queryInterface.addConstraint("eval_income_approach_other_source", {
        fields: ["evaluation_income_approach_id"],
        type: "foreign key",
        name: "eval_income_approach_other_source_evaluation_income_approach_id",
        references: {
          table: "evaluation_income_approaches",
          field: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeConstraint(
    //   'eval_income_approach_other_source',
    //   'eval_income_approach_other_source_evaluation_income_approach_id'
    // );
    await queryInterface.dropTable("eval_income_approach_other_source");
  },
};
