"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = "eval_sales_approach_comparison_attributes";

    // Step 1: Empty the table
    await queryInterface.sequelize.query(`DELETE FROM ${tableName};`);

    // Step 2: Fetch all salesApproaches with needed evaluation data
    const [salesApproaches] = await queryInterface.sequelize.query(`
      SELECT sales.id AS sales_id,
             eval.comparison_basis,
             eval.comp_type,
             eval.analysis_type
      FROM evaluation_sales_approaches AS sales
      JOIN evaluations AS eval ON eval.id = sales.evaluation_id
    `);

    for (const sales of salesApproaches) {
      const {
        sales_id,
        comparison_basis: basis,
        comp_type: compType,
        analysis_type: analysisType,
      } = sales;

      let defaultAttributes = [];

      if (basis === "Unit" && compType === "building_with_land") {
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
          { comparison_key: "dollar_per_unit", comparison_value: "$/Unit" },
        ];
      } else if (basis === "SF" && compType === "building_with_land") {
        defaultAttributes = [
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
          { comparison_key: "price_per_sf", comparison_value: "Building $/SF" },
        ];
      } else if (basis === "Bed" && compType === "building_with_land") {
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
          { comparison_key: "dollar_per_bed", comparison_value: "$/Bed" },
        ];
      } else if (analysisType === "$/SF" && compType === "land_only") {
        defaultAttributes = [
          { comparison_key: "sale_price", comparison_value: "Sales Price" },
          {
            comparison_key: "land_size_sf",
            comparison_value: "Land Size (SF)",
          },
          { comparison_key: "utilities_select", comparison_value: "Utilities" },
          { comparison_key: "topography", comparison_value: "Topography" },
          { comparison_key: "zoning_type", comparison_value: "Zoning" },
          { comparison_key: "price_per_sf", comparison_value: "Land $/SF" },
          { comparison_key: "lot_shape", comparison_value: "Shape" },
        ];
      } else if (analysisType === "$/Acre" && compType === "land_only") {
        defaultAttributes = [
          { comparison_key: "sale_price", comparison_value: "Sales Price" },
          {
            comparison_key: "land_size_acre",
            comparison_value: "Land Size (Acre)",
          },
          { comparison_key: "utilities_select", comparison_value: "Utilities" },
          { comparison_key: "topography", comparison_value: "Topography" },
          { comparison_key: "zoning_type", comparison_value: "Zoning" },
          { comparison_key: "price_per_acre", comparison_value: "Land $/Acre" },
          { comparison_key: "lot_shape", comparison_value: "Shape" },
        ];
      }

      // Insert each attribute with check
      for (let i = 0; i < defaultAttributes.length; i++) {
        const { comparison_key, comparison_value } = defaultAttributes[i];

        await queryInterface.sequelize.query(`
          INSERT INTO ${tableName} (
            evaluation_sales_approach_id,
            comparison_key,
            comparison_value,
            \`order\`,
            date_created,
            last_updated
          )
          SELECT
            ${sales_id},
            '${comparison_key}',
            '${comparison_value}',
            ${i + 1},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          FROM DUAL
          WHERE NOT EXISTS (
            SELECT 1
            FROM ${tableName} AS existing
            WHERE existing.evaluation_sales_approach_id = ${sales_id}
              AND existing.comparison_key = '${comparison_key}'
          );
        `);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `DELETE FROM eval_sales_approach_comparison_attributes;`
    );
  },
};
