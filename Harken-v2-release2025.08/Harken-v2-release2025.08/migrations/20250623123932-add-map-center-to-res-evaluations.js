"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = "res_evaluations";

    // Safety check: Ensure table exists before proceeding
    const allTables = await queryInterface.showAllTables();
    if (!allTables.includes(tableName)) {
      console.log(`Table '${tableName}' does not exist, skipping migration.`);
      return;
    }

    // Describe table to get existing columns
    const tableDefinition = await queryInterface.describeTable(tableName);

    // Add `map_center_lat` only if it doesn't exist
    if (!tableDefinition["map_center_lat"]) {
      await queryInterface.addColumn(tableName, "map_center_lat", {
        type: Sequelize.STRING(30),
        allowNull: true,
        defaultValue: null,
      });
    }

    // Add `map_center_lng` only if it doesn't exist
    if (!tableDefinition["map_center_lng"]) {
      await queryInterface.addColumn(tableName, "map_center_lng", {
        type: Sequelize.STRING(30),
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableName = "res_evaluations";

    // Safety check: Ensure table exists before proceeding
    const allTables = await queryInterface.showAllTables();
    if (!allTables.includes(tableName)) {
      console.log(`Table '${tableName}' does not exist, skipping migration.`);
      return;
    }

    // Describe table to get existing columns
    const tableDefinition = await queryInterface.describeTable(tableName);

    // Remove `map_center_lat` if it exists
    if (tableDefinition["map_center_lat"]) {
      await queryInterface.removeColumn(tableName, "map_center_lat");
    }

    // Remove `map_center_lng` if it exists
    if (tableDefinition["map_center_lng"]) {
      await queryInterface.removeColumn(tableName, "map_center_lng");
    }
  },
};
