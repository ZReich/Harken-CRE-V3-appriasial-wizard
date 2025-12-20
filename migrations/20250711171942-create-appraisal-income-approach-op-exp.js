"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("appraisal_income_approach_op_exp"));

    if (!tableExists) {
      await queryInterface.createTable("appraisal_income_approach_op_exp", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        appraisal_income_approach_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        annual_amount: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        percentage_of_gross: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        total_per_bed: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        total_per_unit: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        total_per_sq_ft: {
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
      await queryInterface.addIndex("appraisal_income_approach_op_exp", [
        "appraisal_income_approach_id",
      ]);
      await queryInterface.addConstraint("appraisal_income_approach_op_exp", {
        fields: ["appraisal_income_approach_id"],
        type: "foreign key",
        name: "appraisal_income_approach_id",
        references: {
          table: "appraisal_income_approaches",
          field: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "appraisal_income_approach_op_exp",
      "appraisal_income_approach_op_exp_ibfk_1"
    );
    await queryInterface.dropTable("appraisal_income_approach_op_exp");
  },
};
