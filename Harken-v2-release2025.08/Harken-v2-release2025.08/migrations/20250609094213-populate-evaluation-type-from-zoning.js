"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable("evaluations");

    // If evaluation_type column doesn't exist, add it
    if (!tableDescription.evaluation_type) {
      await queryInterface.addColumn("evaluations", "evaluation_type", {
        type: Sequelize.STRING(30),
        allowNull: true,
      });
    }

    // 1. Set evaluation_type = zone from first zoning record (if exists)
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

    // 2. Override with 'land' if comp_type = 'land_only'
    await queryInterface.sequelize.query(`
      UPDATE evaluations
      SET evaluation_type = 'land'
      WHERE comp_type = 'land_only'
    `);
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
