"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = "eval_cap_approach_comparison_attributes";

    // Check if required tables exist
    const allTables = await queryInterface.showAllTables();
    if (!allTables.includes("evaluation_cap_approaches") || !allTables.includes("evaluations")) {
      console.log(
        `Required tables don't exist. Skipping data insertion.`
      );
      return;
    }

    // Check if target table exists
    if (!allTables.includes(tableName)) {
      console.log(
        `Table "${tableName}" does not exist. Skipping data insertion.`
      );
      return;
    }

    // Step 1: Empty the table
    try {
      await queryInterface.sequelize.query(`DELETE FROM ${tableName};`);
    } catch (e) {
      // Ignore errors
    }

    // Step 2: Fetch all cap approaches and their comparison_basis
    let capApproaches;
    try {
      [capApproaches] = await queryInterface.sequelize.query(`
        SELECT cap.id AS cap_id, eval.comparison_basis
        FROM evaluation_cap_approaches AS cap
        JOIN evaluations AS eval ON eval.id = cap.evaluation_id
      `);
    } catch (e) {
      // No data yet, skip
      return;
    }

    if (!capApproaches || capApproaches.length === 0) {
      return;
    }

    for (const capApproach of capApproaches) {
      const { cap_id, comparison_basis } = capApproach;

      // Step 3: Define defaultAttributes based on comparison_basis
      let defaultAttributes = [
        { comparison_key: "sale_price", comparison_value: "Sales Price" },
        {
          comparison_key: "building_size_land_size",
          comparison_value: "Building Size / Land Size",
        },
        {
          comparison_key: "year_built_year_remodeled",
          comparison_value: "Year Built / Remodeled",
        },
        {
          comparison_key: "quality_condition",
          comparison_value: "Quality/Condition",
        },
        { comparison_key: "zoning_type", comparison_value: "Zoning" },
      ];

      if (comparison_basis === "Unit") {
        defaultAttributes = [
          { comparison_key: "sale_price", comparison_value: "Sales Price" },
          { comparison_key: "unit", comparison_value: "# of Units" },
          {
            comparison_key: "building_size_land_size",
            comparison_value: "Building Size / Land Size",
          },
          {
            comparison_key: "year_built_year_remodeled",
            comparison_value: "Year Built / Remodeled",
          },
          {
            comparison_key: "quality_condition",
            comparison_value: "Quality/Condition",
          },
          { comparison_key: "zoning_type", comparison_value: "Zoning" },
        ];
      } else if (comparison_basis === "Bed") {
        defaultAttributes = [
          { comparison_key: "sale_price", comparison_value: "Sales Price" },
          { comparison_key: "beds", comparison_value: "# of Beds" },
          {
            comparison_key: "building_size_land_size",
            comparison_value: "Building Size / Land Size",
          },
          {
            comparison_key: "year_built_year_remodeled",
            comparison_value: "Year Built / Remodeled",
          },
          {
            comparison_key: "quality_condition",
            comparison_value: "Quality/Condition",
          },
          { comparison_key: "zoning_type", comparison_value: "Zoning" },
        ];
      }

      // Step 4: Insert attributes
      for (let i = 0; i < defaultAttributes.length; i++) {
        const { comparison_key, comparison_value } = defaultAttributes[i];

        await queryInterface.sequelize.query(`
          INSERT INTO ${tableName} (
            evaluation_cap_approach_id,
            comparison_key,
            comparison_value,
            \`order\`,
            date_created,
            last_updated
          )
          SELECT
            ${cap_id},
            '${comparison_key}',
            '${comparison_value}',
            ${i + 1},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          FROM DUAL
          WHERE NOT EXISTS (
            SELECT 1
            FROM ${tableName} AS existing
            WHERE existing.evaluation_cap_approach_id = ${cap_id}
              AND existing.comparison_key = '${comparison_key}'
          );
        `);
      }
    }
  },

  async down(queryInterface) {
    const tableName = "eval_cap_approach_comparison_attributes";
    await queryInterface.sequelize.query(`DELETE FROM ${tableName};`);
  },
};
