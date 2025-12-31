"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Helper to check if table and column exist
    async function columnExists(tableName, columnName) {
      const tableDesc = await queryInterface
        .describeTable(tableName)
        .catch(() => null);
      return tableDesc && tableDesc[columnName];
    }

    const table = "res_evaluation_income_approaches";
    const column = "incremental_value";

    if (await columnExists(table, column)) {
      // Step 1: Set invalid values to NULL
      await queryInterface.sequelize.query(`
        UPDATE ${table}
        SET ${column} = NULL
        WHERE ${column} IS NULL
          OR ${column} = ''
          OR ${column} REGEXP '[^0-9-]';
      `);

      // Step 2: Change column type to DOUBLE
      await queryInterface.changeColumn(table, column, {
        type: Sequelize.DOUBLE,
        allowNull: true, // Keep as-is per your original logic
      });
    } else {
      console.warn(
        `Skipping: Column '${column}' not found in table '${table}'.`
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Helper again for safety in down
    async function columnExists(tableName, columnName) {
      const tableDesc = await queryInterface
        .describeTable(tableName)
        .catch(() => null);
      return tableDesc && tableDesc[columnName];
    }

    const table = "res_evaluation_income_approaches";
    const column = "incremental_value";

    if (await columnExists(table, column)) {
      await queryInterface.changeColumn(table, column, {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    } else {
      console.warn(
        `Skipping revert: Column '${column}' not found in table '${table}'.`
      );
    }
  },
};
