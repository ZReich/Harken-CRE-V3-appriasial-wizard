"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("evaluation_scenarios"));

    if (!tableExists) {
      await queryInterface.createTable("evaluation_scenarios", {
        id: {
          type: Sequelize.DataTypes.INTEGER(11),
          primaryKey: true,
          allowNull: false,
          autoIncrement: true,
        },
        evaluation_id: {
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
        has_lease_approach: {
          type: Sequelize.DataTypes.TINYINT(1),
        },
        has_cap_approach: {
          type: Sequelize.DataTypes.TINYINT(1),
        },
        has_multi_family_approach: {
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

      await queryInterface.addConstraint("evaluation_scenarios", {
        fields: ["evaluation_id"],
        type: "foreign key",
        references: {
          table: "evaluations",
          field: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  },

  down: async (queryInterface) => {
    // Safety check: Only drop table if it exists
    const allTables = await queryInterface.showAllTables();
    if (allTables.includes("evaluation_scenarios")) {
      await queryInterface.dropTable("evaluation_scenarios");
    }
  },
};
