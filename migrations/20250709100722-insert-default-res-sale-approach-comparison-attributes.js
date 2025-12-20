"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = "res_eval_sales_approach_comparison_attributes";

    // Check if table exists
    const tableExists = await queryInterface.sequelize.query(
      `SHOW TABLES LIKE '${tableName}'`,
      { type: Sequelize.QueryTypes.SHOWTABLES }
    );

    if (tableExists.length === 0) {
      console.log(
        `Table "${tableName}" does not exist. Skipping data insertion.`
      );
      return;
    }

    // Step 1: Empty the table
    await queryInterface.sequelize.query(`DELETE FROM ${tableName};`);

    // Step 2: Define default attributes
    const defaultAttributes = [
      { comparison_key: "sale_price", comparison_value: "Sales Price" },
      {
        comparison_key: "gross_living_area",
        comparison_value: "Gross Living Area (SF)",
      },
      { comparison_key: "basement_sf", comparison_value: "Basement (SF)" },
      { comparison_key: "land_size_sf", comparison_value: "Land Size (SF)" },
      {
        comparison_key: "year_built_remodeled",
        comparison_value: "Year Built / Remodeled",
      },
      { comparison_key: "bedrooms", comparison_value: "Bedrooms" },
      { comparison_key: "bathrooms", comparison_value: "Bathrooms" },
      { comparison_key: "garage", comparison_value: "Garage" },
      {
        comparison_key: "heating_and_cooling",
        comparison_value: "Heating and Cooling",
      },
      { comparison_key: "fencing", comparison_value: "Fencing" },
      { comparison_key: "fireplace", comparison_value: "Fireplace" },
      {
        comparison_key: "other_amenities",
        comparison_value: "Other Amenities",
      },
      { comparison_key: "condition", comparison_value: "Condition" },
    ];

    // Step 3: Insert new records (only if res_evaluation_sales_approaches exists)
    const allTables = await queryInterface.showAllTables();
    if (!allTables.includes("res_evaluation_sales_approaches")) {
      console.log(
        `Table "res_evaluation_sales_approaches" does not exist. Skipping data insertion.`
      );
      return;
    }

    // Step 3: Insert new records
    for (let i = 0; i < defaultAttributes.length; i++) {
      const { comparison_key, comparison_value } = defaultAttributes[i];

      await queryInterface.sequelize.query(`
        INSERT INTO ${tableName} (
          res_evaluation_sales_approach_id,
          comparison_key,
          comparison_value,
          \`order\`,
          date_created,
          last_updated
        )
        SELECT
          salesApproach.id,
          '${comparison_key}',
          '${comparison_value}',
          ${i + 1},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        FROM res_evaluation_sales_approaches AS salesApproach;
      `);
    }
  },

  async down(queryInterface) {
    const tableName = "res_eval_sales_approach_comparison_attributes";

    // Safety check: Ensure table exists before proceeding
    const allTables = await queryInterface.showAllTables();
    if (!allTables.includes(tableName)) {
      console.log(
        `Table "${tableName}" does not exist. Skipping down migration.`
      );
      return;
    }

    await queryInterface.sequelize.query(`
      DELETE FROM res_eval_sales_approach_comparison_attributes;
    `);
  },
};
