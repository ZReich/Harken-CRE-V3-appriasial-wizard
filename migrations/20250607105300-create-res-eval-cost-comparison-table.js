"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = "res_eval_cost_approach_comparison_attributes";

    const tableExists = await queryInterface.sequelize.query(
      `SHOW TABLES LIKE '${tableName}'`,
      { type: Sequelize.QueryTypes.SHOWTABLES }
    );

    if (tableExists.length === 0) {
      // Create the table if it doesn't exist
      await queryInterface.createTable(tableName, {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        res_evaluation_cost_approach_id: {
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
    await queryInterface.dropTable(
      "res_eval_cost_approach_comparison_attributes"
    );
  },
};
