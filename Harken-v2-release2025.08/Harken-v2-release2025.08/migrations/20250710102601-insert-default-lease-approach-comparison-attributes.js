"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = "eval_lease_approach_comparison_attributes";

    // Step 1: Clear existing data
    await queryInterface.sequelize.query(`DELETE FROM ${tableName};`);

    // Step 2: Fetch all lease approaches with related evaluation info
    const [leaseApproaches] = await queryInterface.sequelize.query(`
      SELECT lease.id AS lease_id,
             eval.comparison_basis,
             eval.comp_type,
             eval.analysis_type
      FROM evaluation_lease_approaches AS lease
      JOIN evaluations AS eval ON eval.id = lease.evaluation_id
    `);

    for (const lease of leaseApproaches) {
      const {
        lease_id,
        comparison_basis: basis,
        comp_type: compType,
        analysis_type: analysisType,
      } = lease;

      let defaultAttributes = [];

      // Determine attributes
      if (basis === "Unit") {
        defaultAttributes = [
          { comparison_key: "lease_type", comparison_value: "Lease Type" },
          { comparison_key: "space", comparison_value: "Suite Size" },
          { comparison_key: "term", comparison_value: "Lease Terms - Months" },
          {
            comparison_key: "year_built_year_remodeled",
            comparison_value: "Year Built / Remodeled",
          },
          {
            comparison_key: "unit",
            comparison_value: "# of Units",
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
          { comparison_key: "lease_type", comparison_value: "Lease Type" },
          { comparison_key: "term", comparison_value: "Lease Terms - Months" },
          {
            comparison_key: "building_size_land_size",
            comparison_value: "Building Size / Land Size",
          },
          { comparison_key: "space", comparison_value: "Suite Size" },
          {
            comparison_key: "year_built_year_remodeled",
            comparison_value: "Year Built / Remodeled",
          },
          {
            comparison_key: "quality_condition",
            comparison_value: "Quality/Condition",
          },
          { comparison_key: "zoning_type", comparison_value: "Zoning" },
          {
            comparison_key: "price_sf_per_year",
            comparison_value: "$/SF/YR",
          },
        ];
      } else if (basis === "Bed") {
        defaultAttributes = [
          { comparison_key: "lease_type", comparison_value: "Lease Type" },
          { comparison_key: "term", comparison_value: "Lease Terms - Months" },
          { comparison_key: "beds", comparison_value: "# of Beds" },
          { comparison_key: "space", comparison_value: "Suite Size" },
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
          { comparison_key: "lease_type", comparison_value: "Lease Type" },
          { comparison_key: "term", comparison_value: "Lease Terms - Months" },
          {
            comparison_key: "land_size_sf",
            comparison_value: "Land Size (SF)",
          },
          { comparison_key: "space", comparison_value: "Suite Size" },
          { comparison_key: "land_type", comparison_value: "Land Type" },
          {
            comparison_key: "quality_condition",
            comparison_value: "Quality/Condition",
          },
          { comparison_key: "zoning_type", comparison_value: "Zoning" },
          {
            comparison_key: "price_sf_per_year",
            comparison_value: "$/SF/YR",
          },
        ];
      } else if (analysisType === "$/Acre" && compType === "land_only") {
        defaultAttributes = [
          { comparison_key: "lease_type", comparison_value: "Lease Type" },
          { comparison_key: "term", comparison_value: "Lease Terms - Months" },
          {
            comparison_key: "land_size_acre",
            comparison_value: "Land Size (Acres)",
          },
          { comparison_key: "space", comparison_value: "Suite Size" },
          { comparison_key: "land_type", comparison_value: "Land Type" },
          {
            comparison_key: "quality_condition",
            comparison_value: "Quality/Condition",
          },
          { comparison_key: "zoning_type", comparison_value: "Zoning" },
          {
            comparison_key: "price_acre_per_year",
            comparison_value: "$/AC/YR",
          },
        ];
      }

      // Insert for this lease_approach_id
      for (let i = 0; i < defaultAttributes.length; i++) {
        const { comparison_key, comparison_value } = defaultAttributes[i];

        await queryInterface.sequelize.query(`
          INSERT INTO ${tableName} (
            evaluation_lease_approach_id,
            comparison_key,
            comparison_value,
            \`order\`,
            date_created,
            last_updated
          )
          SELECT
            ${lease_id},
            '${comparison_key}',
            '${comparison_value}',
            ${i + 1},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          FROM DUAL
          WHERE NOT EXISTS (
            SELECT 1
            FROM ${tableName} AS existing
            WHERE existing.evaluation_lease_approach_id = ${lease_id}
              AND existing.comparison_key = '${comparison_key}'
          );
        `);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DELETE FROM eval_lease_approach_comparison_attributes;
    `);
  },
};
