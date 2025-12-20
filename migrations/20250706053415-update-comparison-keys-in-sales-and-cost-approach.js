"use strict";

// Tables to update
const TABLES = [
  "res_eval_sales_approach_comparison_attributes",
  "res_eval_cost_approach_comparison_attributes",
];

// Key-value replacements to perform
const updates = [
  { from: "zoning", to: "zoning_type" },
  { from: "services", to: "utilities_select" },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Safety check: Ensure all tables exist before proceeding
    const allTables = await queryInterface.showAllTables();
    for (const table of TABLES) {
      if (!allTables.includes(table)) {
        console.log(
          `Table '${table}' does not exist, skipping migration for this table.`
        );
        continue;
      }
      // Loop over each comparison_key value to be updated
      for (const { from, to } of updates) {
        // Check how many rows exist that need to be updated
        const [rows] = await queryInterface.sequelize.query(
          `SELECT id FROM ${table} WHERE comparison_key = :from`,
          {
            replacements: { from },
          }
        );

        // If rows are found, perform the update
        if (rows.length > 0) {
          await queryInterface.sequelize.query(
            `UPDATE ${table} SET comparison_key = :to WHERE comparison_key = :from`,
            {
              replacements: { from, to },
            }
          );
          console.log(
            `Updated ${rows.length} rows in ${table}: '${from}' → '${to}'`
          );
        } else {
          console.log(`No rows to update in ${table} for '${from}'`);
        }
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Safety check: Ensure all tables exist before proceeding
    const allTables = await queryInterface.showAllTables();
    for (const table of TABLES) {
      if (!allTables.includes(table)) {
        console.log(
          `Table '${table}' does not exist, skipping migration for this table.`
        );
        continue;
      }
      for (const { from, to } of updates) {
        // Check how many rows need to be reverted
        const [rows] = await queryInterface.sequelize.query(
          `SELECT id FROM ${table} WHERE comparison_key = :to`,
          {
            replacements: { to },
          }
        );

        // Revert the values if found
        if (rows.length > 0) {
          await queryInterface.sequelize.query(
            `UPDATE ${table} SET comparison_key = :from WHERE comparison_key = :to`,
            {
              replacements: { from, to },
            }
          );
          console.log(
            `Reverted ${rows.length} rows in ${table}: '${to}' → '${from}'`
          );
        } else {
          console.log(`No rows to revert in ${table} for '${to}'`);
        }
      }
    }
  },
};
