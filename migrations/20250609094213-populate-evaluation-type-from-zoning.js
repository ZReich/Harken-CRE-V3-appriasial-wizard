"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if evaluations table exists
    const allTables = await queryInterface.showAllTables();
    if (!allTables.includes("evaluations")) {
      // Table doesn't exist yet, skip this migration
      return;
    }

    let tableDescription;
    try {
      tableDescription = await queryInterface.describeTable("evaluations");
    } catch (e) {
      // Table might not exist or error accessing it
      return;
    }

    // If evaluation_type column doesn't exist, add it
    if (!tableDescription.evaluation_type) {
      await queryInterface.addColumn("evaluations", "evaluation_type", {
        type: Sequelize.STRING(30),
        allowNull: true,
      });
    }

    // Check if zoning table exists before running updates
    if (!allTables.includes("zoning")) {
      return;
    }

    // 1. Set evaluation_type = zone from first zoning record (if exists)
    try {
      await queryInterface.sequelize.query(`
        UPDATE evaluations AS evaluationsTable
        JOIN (
          SELECT zoningTable.evaluation_id, zoningTable.zone
          FROM zoning AS zoningTable
          INNER JOIN (
            SELECT evaluation_id, MIN(id) AS first_zoning_id
            FROM zoning
            WHERE zone IS NOT NULL
            GROUP BY evaluation_id
          ) AS firstZoningRecords
          ON zoningTable.id = firstZoningRecords.first_zoning_id
        ) AS firstZones
        ON evaluationsTable.id = firstZones.evaluation_id
        SET evaluationsTable.evaluation_type = firstZones.zone
      `);
    } catch (e) {
      // Ignore errors if tables don't have data yet
    }

    // 2. Override with 'land' if comp_type = 'land_only'
    try {
      await queryInterface.sequelize.query(`
        UPDATE evaluations
        SET evaluation_type = 'land'
        WHERE comp_type = 'land_only'
      `);
    } catch (e) {
      // Ignore errors
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable("evaluations");

    if (tableDescription.evaluation_type) {
      await queryInterface.sequelize.query(`
        UPDATE evaluations
        SET evaluation_type = NULL
      `);

      // Optionally remove the column if needed
      // await queryInterface.removeColumn("evaluations", "evaluation_type");
    }
  },
};
