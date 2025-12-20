"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = "evaluation_cap_approaches";

    // Safety check: Ensure table exists before proceeding
    const allTables = await queryInterface.showAllTables();
    if (!allTables.includes(tableName)) {
      console.log(`Table '${tableName}' does not exist, skipping migration.`);
      return;
    }

    // Get current table definition
    const tableDefinition = await queryInterface.describeTable(tableName);

    // Add cap_rate_notes if it doesn't exist
    if (!tableDefinition["cap_rate_notes"]) {
      await queryInterface.addColumn(tableName, "cap_rate_notes", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableName = "evaluation_cap_approaches";

    // Safety check: Ensure table exists before proceeding
    const allTables = await queryInterface.showAllTables();
    if (!allTables.includes(tableName)) {
      console.log(`Table '${tableName}' does not exist, skipping migration.`);
      return;
    }

    // Remove cap_rate_notes if it exists
    const tableDefinition = await queryInterface.describeTable(tableName);

    if (tableDefinition["cap_rate_notes"]) {
      await queryInterface.removeColumn(tableName, "cap_rate_notes");
    }
  },
};
