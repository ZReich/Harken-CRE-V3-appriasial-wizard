"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) =>
        tables.includes("res_eval_income_approach_other_source")
      );

    if (!tableExists) {
      await queryInterface.createTable(
        "res_eval_income_approach_other_source",
        {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          res_evaluation_income_approach_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          type: {
            type: Sequelize.STRING(255),
            allowNull: true,
          },
          space: {
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
          rent_sq_ft: {
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
        }
      );
      await queryInterface.addIndex(
        "res_eval_income_approach_other_source",
        ["res_evaluation_income_approach_id"],
        { name: "res_evaluation_income_approach_id" }
      );
      await queryInterface.addConstraint(
        "res_eval_income_approach_other_source",
        {
          fields: ["res_evaluation_income_approach_id"],
          type: "foreign key",
          name: "res_evaluation_income_approach_id",
          references: {
            table: "res_evaluation_income_approaches",
            field: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeConstraint(
    //   'res_eval_income_approach_other_source',
    //   'res_eval_income_approach_other_source_res_evaluation_income_approach_id'
    // );
    await queryInterface.dropTable("res_eval_income_approach_other_source");
  },
};
