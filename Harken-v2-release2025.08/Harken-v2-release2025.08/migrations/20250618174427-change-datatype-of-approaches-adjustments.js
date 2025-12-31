"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Helper to check if a column exists in a table
    async function columnExists(tableName, columnName) {
      const tableDesc = await queryInterface
        .describeTable(tableName)
        .catch(() => null);
      return tableDesc && tableDesc[columnName];
    }

    // eval_multi_family_comp_adj.adj_value
    if (await columnExists("eval_multi_family_comp_adj", "adj_value")) {
      await queryInterface.sequelize.query(`
        UPDATE eval_multi_family_comp_adj
        SET adj_value = NULL
        WHERE adj_value IS NOT NULL AND adj_value NOT REGEXP '^-?[0-9]+(\\.[0-9]+)?$';
      `);

      await queryInterface.changeColumn(
        "eval_multi_family_comp_adj",
        "adj_value",
        {
          type: Sequelize.DOUBLE,
          allowNull: true,
        }
      );
    } else {
      console.warn(
        "Skipping: 'adj_value' column not found in 'eval_multi_family_comp_adj'."
      );
    }

    // res_eval_cost_approach_comp_adj.adj_value
    if (await columnExists("res_eval_cost_approach_comp_adj", "adj_value")) {
      await queryInterface.sequelize.query(`
        UPDATE res_eval_cost_approach_comp_adj
        SET adj_value = NULL
        WHERE adj_value IS NOT NULL AND adj_value NOT REGEXP '^-?[0-9]+(\\.[0-9]+)?$';
      `);

      await queryInterface.changeColumn(
        "res_eval_cost_approach_comp_adj",
        "adj_value",
        {
          type: Sequelize.DOUBLE,
          allowNull: true,
        }
      );
    } else {
      console.warn(
        "Skipping: 'adj_value' column not found in 'res_eval_cost_approach_comp_adj'."
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Helper to check if a column exists
    async function columnExists(tableName, columnName) {
      const tableDesc = await queryInterface
        .describeTable(tableName)
        .catch(() => null);
      return tableDesc && tableDesc[columnName];
    }

    // Revert eval_multi_family_comp_adj.adj_value
    if (await columnExists("eval_multi_family_comp_adj", "adj_value")) {
      await queryInterface.changeColumn(
        "eval_multi_family_comp_adj",
        "adj_value",
        {
          type: Sequelize.STRING,
          allowNull: true,
        }
      );
    } else {
      console.warn(
        "Skipping revert: 'adj_value' not found in 'eval_multi_family_comp_adj'."
      );
    }

    // Revert res_eval_cost_approach_comp_adj.adj_value
    if (await columnExists("res_eval_cost_approach_comp_adj", "adj_value")) {
      await queryInterface.changeColumn(
        "res_eval_cost_approach_comp_adj",
        "adj_value",
        {
          type: Sequelize.STRING,
          allowNull: true,
        }
      );
    } else {
      console.warn(
        "Skipping revert: 'adj_value' not found in 'res_eval_cost_approach_comp_adj'."
      );
    }
  },
};
