"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if template table exists before modifying it
    const tables = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '${queryInterface.sequelize.config.database}' AND TABLE_NAME = 'template'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (tables.length === 0) {
      // Table doesn't exist yet, skip this migration (will be handled when table is created)
      return;
    }

    // Check if columns already exist to avoid duplicate column errors
    const columns = await queryInterface.sequelize.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${queryInterface.sequelize.config.database}' AND TABLE_NAME = 'template'`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const columnNames = columns.map((c) => c.COLUMN_NAME);

    // Add new columns to template table
    if (!columnNames.includes('report_type')) {
      await queryInterface.addColumn("template", "report_type", {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: "appraisal or evaluation",
      });
    }

    if (!columnNames.includes('property_category')) {
      await queryInterface.addColumn("template", "property_category", {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "commercial, residential, industrial, special_purpose",
      });
    }

    if (!columnNames.includes('allow_improved')) {
      await queryInterface.addColumn("template", "allow_improved", {
        type: Sequelize.TINYINT,
        defaultValue: 1,
        comment: "Allow building_with_land composition type",
      });
    }

    if (!columnNames.includes('allow_vacant_land')) {
      await queryInterface.addColumn("template", "allow_vacant_land", {
        type: Sequelize.TINYINT,
        defaultValue: 1,
        comment: "Allow land_only composition type",
      });
    }

    if (!columnNames.includes('scenario_preset')) {
      await queryInterface.addColumn("template", "scenario_preset", {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: "single, dual, triple, custom",
      });
    }

    if (!columnNames.includes('enable_data_inheritance')) {
      await queryInterface.addColumn("template", "enable_data_inheritance", {
        type: Sequelize.TINYINT,
        defaultValue: 0,
        comment: "Enable data copying between scenarios",
      });
    }

    // Add indexes for better query performance (check if they exist first)
    try {
      await queryInterface.addIndex("template", ["report_type"], {
        name: "idx_template_report_type",
      });
    } catch (e) {
      // Index might already exist, ignore error
    }

    try {
      await queryInterface.addIndex("template", ["property_category"], {
        name: "idx_template_property_category",
      });
    } catch (e) {
      // Index might already exist, ignore error
    }

    // Set default values for existing templates
    if (columnNames.includes('report_type')) {
      await queryInterface.sequelize.query(`
        UPDATE template 
        SET report_type = 'appraisal',
            property_category = 'commercial',
            allow_improved = 1,
            allow_vacant_land = 1,
            scenario_preset = 'single'
        WHERE report_type IS NULL;
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex("template", "idx_template_report_type");
    await queryInterface.removeIndex(
      "template",
      "idx_template_property_category"
    );

    // Remove columns
    await queryInterface.removeColumn("template", "report_type");
    await queryInterface.removeColumn("template", "property_category");
    await queryInterface.removeColumn("template", "allow_improved");
    await queryInterface.removeColumn("template", "allow_vacant_land");
    await queryInterface.removeColumn("template", "scenario_preset");
    await queryInterface.removeColumn("template", "enable_data_inheritance");
  },
};







