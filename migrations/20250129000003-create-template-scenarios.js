"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if template table exists - if not, skip this migration
    const tables = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '${queryInterface.sequelize.config.database}' AND TABLE_NAME = 'template'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (tables.length === 0) {
      // Template table doesn't exist yet, skip this migration
      return;
    }

    // Check if table already exists
    const existingTables = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '${queryInterface.sequelize.config.database}' AND TABLE_NAME = 'template_scenarios'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingTables.length > 0) {
      // Table already exists, skip
      return;
    }

    await queryInterface.createTable("template_scenarios", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      template_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "template",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      scenario_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment:
          "USPAP scenario type: as_is, as_completed, as_stabilized, etc.",
      },
      custom_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: "Custom scenario name if scenario_type is 'custom'",
      },
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "Order in which scenarios appear in report",
      },
      default_approaches: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Array of enabled approaches for this scenario",
      },
      require_completion_date: {
        type: Sequelize.TINYINT,
        defaultValue: 0,
        comment: "Require completion/stabilization date for this scenario",
      },
      require_hypothetical_statement: {
        type: Sequelize.TINYINT,
        defaultValue: 0,
        comment: "Require hypothetical conditions statement (USPAP)",
      },
      date_created: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      last_updated: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    // Add indexes
    try {
      await queryInterface.addIndex("template_scenarios", ["template_id"], {
        name: "idx_template_scenarios_template_id",
      });
    } catch (e) {
      // Index might already exist, ignore error
    }

    try {
      await queryInterface.addIndex(
        "template_scenarios",
        ["template_id", "display_order"],
        {
          name: "idx_template_scenarios_order",
        }
      );
    } catch (e) {
      // Index might already exist, ignore error
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("template_scenarios");
  },
};







