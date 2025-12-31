"use strict";

const tableName = "eval_lease_approach_qualitative_sub_adj";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Check if table exists
    const [tableExists] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) AS count
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_NAME = '${tableName}'
        AND TABLE_SCHEMA = DATABASE();
    `);

    // Step 2: Create table if it does not exist
    if (tableExists[0].count === 0) {
      await queryInterface.createTable(tableName, {
        id: {
          type: Sequelize.INTEGER(11),
          primaryKey: true,
          allowNull: false,
          autoIncrement: true,
        },
        evaluation_lease_approach_id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
        },
        adj_key: {
          type: Sequelize.STRING(50),
        },
        adj_value: {
          type: Sequelize.STRING(50),
        },
        subject_property_value: {
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

    // Step 3: Insert adjustments if not already present
    const adjustments = [
      {
        adj_key: "office_area",
        adj_value: "% Office Area",
        subject_property_value: "",
        order: 1,
      },
      {
        adj_key: "building_size",
        adj_value: "Building Size",
        subject_property_value: "",
        order: 2,
      },
      {
        adj_key: "effective_age",
        adj_value: "Effective Age",
        subject_property_value: "",
        order: 3,
      },
      {
        adj_key: "location",
        adj_value: "Location",
        subject_property_value: "",
        order: 4,
      },
      {
        adj_key: "quality_condition",
        adj_value: "Quality/Condition",
        subject_property_value: "",
        order: 5,
      },
      {
        adj_key: "sidewall_height",
        adj_value: "Sidewall Height",
        subject_property_value: "",
        order: 6,
      },
    ];

    for (const adj of adjustments) {
      await queryInterface.sequelize.query(`
        INSERT INTO ${tableName} (
          evaluation_lease_approach_id,
          adj_key,
          adj_value,
          subject_property_value,
          \`order\`,
          date_created,
          last_updated
        )
        SELECT
          leaseApproach.id,
          '${adj.adj_key}',
          '${adj.adj_value}',
          '${adj.subject_property_value}',
          ${adj.order},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        FROM evaluation_lease_approaches AS leaseApproach
        WHERE NOT EXISTS (
          SELECT 1
          FROM ${tableName} AS subAdjustment
          WHERE subAdjustment.evaluation_lease_approach_id = leaseApproach.id
            AND subAdjustment.adj_key = '${adj.adj_key}'
        );
      `);
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DELETE FROM ${tableName}
      WHERE adj_key IN (
        'office_area',
        'building_size',
        'effective_age',
        'location',
        'quality_condition',
        'sidewall_height'
      );
    `);
  },
};
