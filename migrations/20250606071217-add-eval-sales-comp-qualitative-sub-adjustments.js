"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = "eval_sales_approach_qualitative_comp_adj";

    // Step 1: Check if table exists
    const tableExists = await queryInterface.sequelize.query(
      `
        SELECT COUNT(*) AS count
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
        AND table_name = '${tableName}';
      `,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Step 2: If not, create table based on model
    if (tableExists[0].count === 0) {
      await queryInterface.createTable(tableName, {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        evaluation_sales_approach_comp_id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
        },
        adj_key: {
          type: Sequelize.STRING(50),
        },
        adj_value: {
          type: Sequelize.STRING(50),
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

    // Step 3: Data to insert
    // Check if required table exists before inserting data
    const allTables = await queryInterface.showAllTables();
    if (!allTables.includes("eval_sales_approach_comps")) {
      // Table doesn't exist yet, skip data insertion
      return;
    }

    const adjustments = [
      { adj_key: "office_area", adj_value: "similar" },
      { adj_key: "building_size", adj_value: "similar" },
      { adj_key: "quality_condition", adj_value: "similar" },
      { adj_key: "location", adj_value: "similar" },
      { adj_key: "effective_age", adj_value: "similar" },
      { adj_key: "sidewall_height", adj_value: "similar" },
    ];

    // Step 4: Insert only if not already present
    for (const adj of adjustments) {
      await queryInterface.sequelize.query(`
        INSERT INTO ${tableName} (
          evaluation_sales_approach_comp_id,
          adj_key,
          adj_value,
          date_created,
          last_updated
        )
        SELECT 
          comp.id,
          '${adj.adj_key}',
          '${adj.adj_value}',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        FROM eval_sales_approach_comps AS comp
        WHERE NOT EXISTS (
          SELECT 1 FROM ${tableName} AS existing
          WHERE existing.evaluation_sales_approach_comp_id = comp.id
            AND existing.adj_key = '${adj.adj_key}'
        );
      `);
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DELETE FROM eval_sales_approach_qualitative_comp_adj
      WHERE adj_key IN (
        'office_area',
        'building_size',
        'quality_condition',
        'location',
        'effective_age',
        'sidewall_height'
      );
    `);
  },
};
