"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table exists
    const tableExists = await queryInterface.sequelize.query(`
      SHOW TABLES LIKE 'res_evaluation_scenarios';
    `);

    if (tableExists[0].length === 0) {
      // Table doesn't exist, create it
      await queryInterface.createTable("res_evaluation_scenarios", {
        id: {
          type: Sequelize.DataTypes.INTEGER(11),
          primaryKey: true,
          allowNull: false,
          autoIncrement: true,
        },
        res_evaluation_id: {
          type: Sequelize.DataTypes.INTEGER(11),
          allowNull: false,
        },
        name: {
          type: Sequelize.DataTypes.STRING(255),
          allowNull: true,
        },
        has_income_approach: {
          type: Sequelize.DataTypes.TINYINT(1),
        },
        has_sales_approach: {
          type: Sequelize.DataTypes.TINYINT(1),
        },
        has_cost_approach: {
          type: Sequelize.DataTypes.TINYINT(1),
        },
        weighted_market_value: {
          type: Sequelize.DataTypes.DECIMAL(10, 2),
        },
        rounding: {
          type: Sequelize.DataTypes.INTEGER(11),
        },
        created: {
          type: Sequelize.DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        last_updated: {
          type: Sequelize.DataTypes.DATE,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
          ),
        },
      });

      // Only add foreign key constraint if res_evaluations table exists
      const allTables = await queryInterface.showAllTables();
      if (allTables.includes("res_evaluations")) {
        try {
          await queryInterface.addConstraint("res_evaluation_scenarios", {
            fields: ["res_evaluation_id"],
            type: "foreign key",
            name: "fk_res_evaluation_scenario_id",
            references: {
              table: "res_evaluations",
              field: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          });
        } catch (e) {
          // Constraint might already exist, ignore error
        }
      }
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("res_evaluation_scenarios");
  },
};
