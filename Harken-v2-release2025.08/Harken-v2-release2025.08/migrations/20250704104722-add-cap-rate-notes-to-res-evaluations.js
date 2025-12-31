"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = "res_evaluation_income_approaches";
    const columnName = "cap_rate_notes";

    // Safety check: Ensure table exists before proceeding
    const allTables = await queryInterface.showAllTables();
    if (!allTables.includes(tableName)) {
      console.log(`Table "${tableName}" does not exist, skipping migration.`);
      return;
    }

    const tableDefinition = await queryInterface.describeTable(tableName);

    if (!tableDefinition[columnName]) {
      await queryInterface.addColumn(tableName, columnName, {
        type: Sequelize.TEXT,
        allowNull: true,
        after: "expense_notes", // Optional
      });
    } else {
      console.log(
        `Column "${columnName}" already exists in "${tableName}", skipping.`
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableName = "res_evaluation_income_approaches";
    const columnName = "cap_rate_notes";

    // Safety check: Ensure table exists before proceeding
    const allTables = await queryInterface.showAllTables();
    if (!allTables.includes(tableName)) {
      console.log(`Table "${tableName}" does not exist, skipping removal.`);
      return;
    }

    const tableDefinition = await queryInterface.describeTable(tableName);

    if (tableDefinition[columnName]) {
      await queryInterface.removeColumn(tableName, columnName);
    } else {
      console.log(
        `Column "${columnName}" does not exist in "${tableName}", skipping removal.`
      );
    }
  },
};
