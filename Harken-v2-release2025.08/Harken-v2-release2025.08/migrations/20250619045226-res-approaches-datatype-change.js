"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Helper function to check if a column exists in a table
    async function columnExists(tableName, columnName) {
      const tableDesc = await queryInterface
        .describeTable(tableName)
        .catch(() => null);
      return tableDesc && tableDesc[columnName];
    }

    // Step 1: Run update queries only if table and column exist
    if (
      await columnExists("res_eval_sales_approach_subject_adj", "adj_value")
    ) {
      await queryInterface.sequelize.query(`
        UPDATE res_eval_sales_approach_subject_adj
        SET adj_value = NULL
        WHERE adj_value IS NOT NULL AND adj_value NOT REGEXP '^-?[0-9]+(\\.[0-9]+)?$';
      `);

      await queryInterface.changeColumn(
        "res_eval_sales_approach_subject_adj",
        "adj_value",
        {
          type: Sequelize.DOUBLE,
          allowNull: true,
        }
      );
    } else {
      console.warn(
        "Skipping: 'adj_value' column not found in 'res_eval_sales_approach_subject_adj'."
      );
    }

    if (
      await columnExists(
        "res_evaluation_income_approaches",
        "incremental_value"
      )
    ) {
      await queryInterface.sequelize.query(`
        UPDATE res_evaluation_income_approaches 
        SET incremental_value = NULL
        WHERE incremental_value IS NOT NULL AND incremental_value NOT REGEXP '^-?[0-9]+(\\.[0-9]+)?$';
      `);

      await queryInterface.changeColumn(
        "res_evaluation_income_approaches",
        "incremental_value",
        {
          type: Sequelize.DOUBLE,
          allowNull: true,
        }
      );
    } else {
      console.warn(
        "Skipping: 'incremental_value' column not found in 'res_evaluation_income_approaches'."
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    // You can add safety-checked reverts here if needed
  },
};
