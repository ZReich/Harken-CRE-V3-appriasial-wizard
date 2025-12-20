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
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '${queryInterface.sequelize.config.database}' AND TABLE_NAME = 'template_configuration'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingTables.length > 0) {
      // Table already exists, skip
      return;
    }

    await queryInterface.createTable("template_configuration", {
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
      config_key: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "Configuration key (e.g., enabled_approaches, default_weights)",
      },
      config_value: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Configuration value (JSON string for complex data)",
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

    // Add unique constraint to prevent duplicate config keys per template
    try {
      await queryInterface.addConstraint("template_configuration", {
        fields: ["template_id", "config_key"],
        type: "unique",
        name: "unique_template_config",
      });
    } catch (e) {
      // Constraint might already exist, ignore error
    }

    // Add index for faster lookups
    try {
      await queryInterface.addIndex("template_configuration", ["template_id"], {
        name: "idx_template_config_template_id",
      });
    } catch (e) {
      // Index might already exist, ignore error
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("template_configuration");
  },
};







