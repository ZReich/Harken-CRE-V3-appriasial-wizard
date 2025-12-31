"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Safety: check if table and column exist before updating
    const tableName = "evaluations";
    const columnName = "analysis_type";

    const tableExistsResult = await queryInterface.sequelize.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = '${tableName}';
    `);

    const tableExists = tableExistsResult[0][0].count > 0;

    if (tableExists) {
      const columnExistsResult = await queryInterface.sequelize.query(`
        SELECT COUNT(*) as count
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = '${tableName}'
        AND column_name = '${columnName}';
      `);

      const columnExists = columnExistsResult[0][0].count > 0;

      if (columnExists) {
        // Safe to run update
        await queryInterface.sequelize.query(`
          UPDATE ${tableName}
          SET ${columnName} = '$/SF'
          WHERE ${columnName} IS NULL;
        `);
      } else {
        console.log(
          `Column '${columnName}' does not exist in table '${tableName}', skipping migration.`
        );
      }
    } else {
      console.log(`Table '${tableName}' does not exist, skipping migration.`);
    }
  },

  async down(queryInterface, Sequelize) {
    const tableName = "evaluations";
    const columnName = "analysis_type";

    const tableExistsResult = await queryInterface.sequelize.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = '${tableName}';
    `);

    const tableExists = tableExistsResult[0][0].count > 0;

    if (tableExists) {
      const columnExistsResult = await queryInterface.sequelize.query(`
        SELECT COUNT(*) as count
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = '${tableName}'
        AND column_name = '${columnName}';
      `);

      const columnExists = columnExistsResult[0][0].count > 0;

      if (columnExists) {
        // Revert only those rows
        await queryInterface.sequelize.query(`
          UPDATE ${tableName}
          SET ${columnName} = NULL
          WHERE ${columnName} = '$/SF';
        `);
      } else {
        console.log(
          `Column '${columnName}' does not exist in table '${tableName}', skipping migration.`
        );
      }
    } else {
      console.log(`Table '${tableName}' does not exist, skipping migration.`);
    }
  },
};
