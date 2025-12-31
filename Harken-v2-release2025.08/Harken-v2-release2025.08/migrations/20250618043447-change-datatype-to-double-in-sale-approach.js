"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Helper: check if table and column exist
    async function columnExists(tableName, columnName) {
      const tableDesc = await queryInterface
        .describeTable(tableName)
        .catch(() => null);
      return tableDesc && tableDesc[columnName];
    }

    const table = "eval_sales_approach_comp_adj";
    const column = "adj_value";

    if (await columnExists(table, column)) {
      // Step 1: Set non-numeric adj_value rows to NULL
      await queryInterface.sequelize.query(`
        UPDATE ${table}
        SET ${column} = NULL
        WHERE ${column} IS NOT NULL AND ${column} NOT REGEXP '^-?[0-9]+(\\.[0-9]+)?$';
      `);

      // Step 2: Change adj_value column to DOUBLE
      await queryInterface.changeColumn(table, column, {
        type: Sequelize.DOUBLE,
        allowNull: true,
      });
    } else {
      console.warn(`Skipping: Column '${column}' not found in '${table}'.`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Helper: check if table and column exist
    async function columnExists(tableName, columnName) {
      const tableDesc = await queryInterface
        .describeTable(tableName)
        .catch(() => null);
      return tableDesc && tableDesc[columnName];
    }

    const table = "eval_sales_approach_comp_adj";
    const column = "adj_value";

    if (await columnExists(table, column)) {
      // Revert column back to STRING
      await queryInterface.changeColumn(table, column, {
        type: Sequelize.STRING,
        allowNull: true,
      });
    } else {
      console.warn(
        `Skipping revert: Column '${column}' not found in '${table}'.`
      );
    }
  },
};
