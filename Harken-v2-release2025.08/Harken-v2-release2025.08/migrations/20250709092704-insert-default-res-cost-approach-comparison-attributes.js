"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = "res_eval_cost_approach_comparison_attributes";

    // Safety check: Ensure required tables exist before proceeding
    const allTables = await queryInterface.showAllTables();
    if (
      !allTables.includes(tableName) ||
      !allTables.includes("res_evaluation_cost_approaches") ||
      !allTables.includes("res_evaluations")
    ) {
      console.log(
        "One or more required tables do not exist, skipping migration."
      );
      return;
    }

    // Attributes for ACRE
    const acreAttributes = [
      { comparison_key: "price_per_acre", comparison_value: "$/Acre" },
      {
        comparison_key: "building_size_land_size",
        comparison_value: "Building Size / Land Size",
      },
      { comparison_key: "frontage", comparison_value: "Frontage" },
      { comparison_key: "sale_price", comparison_value: "Sales Price" },
      { comparison_key: "utilities_select", comparison_value: "Services" },
      { comparison_key: "zoning_type", comparison_value: "Zoning" },
    ];

    // Attributes for SF (non-ACRE)
    const sfAttributes = [
      { comparison_key: "price_per_sf", comparison_value: "$/SF" },
      {
        comparison_key: "building_size_land_size",
        comparison_value: "Building Size / Land Size",
      },
      { comparison_key: "frontage", comparison_value: "Frontage" },
      { comparison_key: "sale_price", comparison_value: "Sales Price" },
      { comparison_key: "utilities_select", comparison_value: "Services" },
      { comparison_key: "zoning_type", comparison_value: "Zoning" },
    ];

    // Step 1: Empty the table before inserting new data
    await queryInterface.sequelize.query(`
      DELETE FROM ${tableName};
    `);

    // Step 2: Fetch all cost approaches with associated land_dimension
    const [costApproaches] = await queryInterface.sequelize.query(`
      SELECT cost.id AS cost_id, eval.land_dimension
      FROM res_evaluation_cost_approaches AS cost
      JOIN res_evaluations AS eval ON eval.id = cost.res_evaluation_id
    `);

    // Step 3: Insert attributes conditionally based on land_dimension
    for (const costApproach of costApproaches) {
      const { cost_id, land_dimension } = costApproach;
      const attributes =
        land_dimension === "ACRE" ? acreAttributes : sfAttributes;

      for (let i = 0; i < attributes.length; i++) {
        const { comparison_key, comparison_value } = attributes[i];

        await queryInterface.sequelize.query(`
          INSERT INTO ${tableName} (
            res_evaluation_cost_approach_id,
            comparison_key,
            comparison_value,
            \`order\`,
            date_created,
            last_updated
          )
          VALUES (
            ${cost_id},
            '${comparison_key}',
            '${comparison_value}',
            ${i + 1},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          );
        `);
      }
    }
  },

  async down(queryInterface) {
    const tableName = "res_eval_cost_approach_comparison_attributes";

    // Safety check: Ensure table exists before proceeding
    const allTables = await queryInterface.showAllTables();
    if (!allTables.includes(tableName)) {
      console.log(
        `Table '${tableName}' does not exist, skipping down migration.`
      );
      return;
    }

    await queryInterface.sequelize.query(`
      DELETE FROM res_eval_cost_approach_comparison_attributes;
    `);
  },
};
