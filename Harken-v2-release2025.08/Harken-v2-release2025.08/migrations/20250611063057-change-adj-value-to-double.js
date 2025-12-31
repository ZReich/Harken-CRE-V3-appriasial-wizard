"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Helper to check if column exists
    async function columnExists(tableName, columnName) {
      const tableDesc = await queryInterface
        .describeTable(tableName)
        .catch(() => null);
      return tableDesc && tableDesc[columnName];
    }

    // Table 1: eval_lease_approach_comp_adj
    if (await columnExists("eval_lease_approach_comp_adj", "adj_value")) {
      await queryInterface.sequelize.query(`
        UPDATE eval_lease_approach_comp_adj
        SET adj_value = NULL
        WHERE adj_value IS NOT NULL AND adj_value NOT REGEXP '^-?[0-9]+(\\.[0-9]+)?$';
      `);

      await queryInterface.changeColumn(
        "eval_lease_approach_comp_adj",
        "adj_value",
        {
          type: Sequelize.DOUBLE,
          allowNull: true,
        }
      );
    } else {
      console.warn(
        "Skipping: 'adj_value' column not found in 'eval_lease_approach_comp_adj'."
      );
    }

    // Table 2: eval_cost_approach_comp_adj
    if (await columnExists("eval_cost_approach_comp_adj", "adj_value")) {
      await queryInterface.sequelize.query(`
        UPDATE eval_cost_approach_comp_adj
        SET adj_value = NULL
        WHERE adj_value IS NOT NULL AND adj_value NOT REGEXP '^-?[0-9]+(\\.[0-9]+)?$';
      `);

      await queryInterface.changeColumn(
        "eval_cost_approach_comp_adj",
        "adj_value",
        {
          type: Sequelize.DOUBLE,
          allowNull: true,
        }
      );
    } else {
      console.warn(
        "Skipping: 'adj_value' column not found in 'eval_cost_approach_comp_adj'."
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    async function columnExists(tableName, columnName) {
      const tableDesc = await queryInterface
        .describeTable(tableName)
        .catch(() => null);
      return tableDesc && tableDesc[columnName];
    }

    if (await columnExists("eval_lease_approach_comp_adj", "adj_value")) {
      await queryInterface.changeColumn(
        "eval_lease_approach_comp_adj",
        "adj_value",
        {
          type: Sequelize.STRING,
          allowNull: true,
        }
      );
    } else {
      console.warn(
        "Skipping revert: 'adj_value' column not found in 'eval_lease_approach_comp_adj'."
      );
    }

    if (await columnExists("eval_cost_approach_comp_adj", "adj_value")) {
      await queryInterface.changeColumn(
        "eval_cost_approach_comp_adj",
        "adj_value",
        {
          type: Sequelize.STRING,
          allowNull: true,
        }
      );
    } else {
      console.warn(
        "Skipping revert: 'adj_value' column not found in 'eval_cost_approach_comp_adj'."
      );
    }
  },
};
