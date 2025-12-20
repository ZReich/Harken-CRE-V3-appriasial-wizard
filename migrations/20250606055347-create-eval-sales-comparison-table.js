"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = "eval_sales_approach_comparison_attributes";

    // Safety check: Only create table if it does not exist
    const tableExists = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count
         FROM information_schema.tables
         WHERE table_schema = DATABASE()
         AND table_name = '${tableName}';`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (tableExists[0].count === 0) {
      // Create the table
      await queryInterface.createTable(tableName, {
        id: {
          type: Sequelize.INTEGER(11),
          primaryKey: true,
          allowNull: false,
          autoIncrement: true,
        },
        evaluation_sales_approach_id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
        },
        comparison_key: {
          type: Sequelize.STRING(50),
        },
        comparison_value: {
          type: Sequelize.STRING(50),
        },
        order: {
          type: Sequelize.INTEGER(11),
        },
        date_created: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        last_updated: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
          ),
        },
      });
    }
  },

  async down(queryInterface) {
    const tableName = "eval_sales_approach_comparison_attributes";
    // Safety check: Only drop table if it exists
    const tableExists = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count
         FROM information_schema.tables
         WHERE table_schema = DATABASE()
         AND table_name = '${tableName}';`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (tableExists[0].count > 0) {
      await queryInterface.dropTable(tableName);
    }
  },
};
