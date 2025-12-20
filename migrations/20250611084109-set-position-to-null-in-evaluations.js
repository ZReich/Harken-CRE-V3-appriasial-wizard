"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    // Helper: Check if table and column exist
    async function columnExists(tableName, columnName) {
      const tableDesc = await queryInterface
        .describeTable(tableName)
        .catch(() => null);
      return tableDesc && tableDesc[columnName];
    }

    // Set position = NULL in res_evaluations
    if (await columnExists("res_evaluations", "position")) {
      await queryInterface.sequelize.query(`
        UPDATE res_evaluations
        SET position = NULL
        WHERE position IS NOT NULL;
      `);
    } else {
      console.warn(
        "Skipping: Column 'position' not found in 'res_evaluations'."
      );
    }

    // Set position = NULL in evaluations
    if (await columnExists("evaluations", "position")) {
      await queryInterface.sequelize.query(`
        UPDATE evaluations
        SET position = NULL
        WHERE position IS NOT NULL;
      `);
    } else {
      console.warn("Skipping: Column 'position' not found in 'evaluations'.");
    }
  },

  down: async () => {
    // No action taken in down because original data cannot be restored
    console.warn(
      "Down migration skipped: Original 'position' values cannot be restored."
    );
  },
};
