"use strict";

const tableName = "eval_multi_family_comparison_attributes";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Check if the table exists
    const [tableExists] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) AS count
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_NAME = '${tableName}'
        AND TABLE_SCHEMA = DATABASE()
    `);

    // Step 2: Create the table if it doesn't exist
    if (tableExists[0].count === 0) {
      await queryInterface.createTable(tableName, {
        id: {
          type: Sequelize.INTEGER(11),
          primaryKey: true,
          allowNull: false,
          autoIncrement: true,
        },
        evaluation_multi_family_approach_id: {
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
    await queryInterface.dropTable("eval_multi_family_comparison_attributes");
  },
};
