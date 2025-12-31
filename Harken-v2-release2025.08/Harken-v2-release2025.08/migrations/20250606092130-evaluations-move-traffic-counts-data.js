"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Safety check: Ensure 'evaluations' table exists
    const tables = await queryInterface.showAllTables();
    if (!tables.includes("evaluations")) {
      console.log("Table 'evaluations' does not exist, skipping migration.");
      return;
    }

    // Step 1: Check and create columns if they don’t exist
    const [tableInfo] = await queryInterface.sequelize.query(`
      SHOW COLUMNS FROM evaluations
    `);

    const columnExists = (col) =>
      tableInfo.some((column) => column.Field === col);

    const addColumnIfMissing = async (columnName, type) => {
      if (!columnExists(columnName)) {
        await queryInterface.addColumn("evaluations", columnName, {
          type,
          allowNull: true,
        });
      }
    };

    await addColumnIfMissing("traffic_street_address", Sequelize.STRING);
    await addColumnIfMissing("traffic_count", Sequelize.STRING); // Adjust type if numeric
    await addColumnIfMissing("traffic_input", Sequelize.STRING);

    // Step 2: Select rows with non-empty traffic_counts
    const rows = await queryInterface.sequelize.query(
      `SELECT id, traffic_counts, traffic_street_address, traffic_count, traffic_input
       FROM evaluations
       WHERE traffic_counts IS NOT NULL
         AND traffic_counts != '[]'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Step 3: Process each row
    for (const row of rows) {
      const {
        id,
        traffic_counts,
        traffic_street_address,
        traffic_count,
        traffic_input,
      } = row;

      // Skip if already populated
      if (traffic_street_address || traffic_count || traffic_input) continue;

      let data;
      try {
        data = JSON.parse(traffic_counts);
      } catch (err) {
        console.warn(`Skipping id=${id}: Invalid JSON`);
        continue;
      }

      if (!Array.isArray(data) || !data[0]) {
        console.warn(`Skipping id=${id}: Empty or malformed array`);
        continue;
      }

      const first = data[0];
      const street = first?.street_address || null;
      const count = first?.count || null;
      const input = first?.traffic_input || null;

      await queryInterface.sequelize.query(
        `UPDATE evaluations
         SET traffic_street_address = :street,
             traffic_count = :count,
             traffic_input = :input
         WHERE id = :id`,
        {
          replacements: { street, count, input, id },
        }
      );
    }
  },

  down: async (queryInterface) => {
    // Safety check: Ensure 'evaluations' table exists
    const tables = await queryInterface.showAllTables();
    if (!tables.includes("evaluations")) {
      console.log("Table 'evaluations' does not exist, skipping migration.");
      return;
    }

    await queryInterface.sequelize.query(`
      UPDATE evaluations
      SET traffic_street_address = NULL,
          traffic_count = NULL,
          traffic_input = NULL
      WHERE traffic_street_address IS NOT NULL
         OR traffic_count IS NOT NULL
         OR traffic_input IS NOT NULL
    `);
  },
};
