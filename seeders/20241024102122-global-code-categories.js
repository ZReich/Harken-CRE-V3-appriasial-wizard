"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const globalCodes = [
      { type: "zone", label: "Zone" },
      { type: "condition", label: "Condition" },
      { type: "utilities", label: "Utilities" },
      { type: "frontages", label: "Frontages" },
      { type: "lease_types", label: "Lease Types" },
      { type: "topographies", label: "Topography" },
      { type: "lot_shape", label: "Lot Shape" },
      {
        type: "conforming_using_determinations",
        label: "Conforming Using Determinations",
      },
      { type: "parking", label: "Parking" },
      { type: "land_type", label: "Land Type" },
      { type: "lease_rate_unit", label: "Lease Rate Unit" },
      {
        type: "sales_comparative_attributes",
        label: "Sales Comparative attributes",
      },
      {
        type: "sales_comp_quantitative_adjustments",
        label: "Sales comp quantitative adjustments",
      },
      {
        type: "sales_comp_qualitative_adjustments",
        label: "Sales comp qualitative adjustments",
      },
      {
        type: "qualitative_adjustments_dropdown",
        label: "Qualitative adjustments dropdown",
      },
      {
        type: "lease_quantitative_adjustments",
        label: "Lease Quantitative adjustments",
      },
      {
        type: "appraisal_types",
        label: "Appraisal types",
      },
      {
        type: "property_types",
        label: "Property types",
      },
      {
        type: "sale_status",
        label: "Sale Status",
      },
      {
        type: "lease_status",
        label: "Lease Status",
      },
      {
        type: "states",
        label: "States",
      },
      {
        type: "TI_allowance_unit",
        label: "TI Allowance Unit",
      },
      {
        type: "approaches",
        label: "Approaches",
      },
      {
        type: "title",
        label: "Title",
      },
      {
        type: "comparison_basis",
        label: "Comparison Basis",
      },
      {
        type: "property_rights",
        label: "Property Rights",
      },
      {
        type: "property_class",
        label: "Property Class",
      },
      {
        type: "foundation",
        label: "Foundation",
      },
      {
        type: "ada_compliance",
        label: "ADA Compliance",
      },
      {
        type: "basement",
        label: "Basement",
      },
      {
        type: "structure_construction_type",
        label: "Structure Construction Type",
      },
      {
        type: "exterior",
        label: "Exterior",
      },
      {
        type: "roof",
        label: "Roof",
      },
      {
        type: "plumbing",
        label: "Plumbing",
      },
      {
        type: "windows",
        label: "Windows",
      },
      {
        type: "heating_cooling",
        label: "Heating/Cooling",
      },
      {
        type: "electrical",
        label: "Electrical",
      },
      {
        type: "most_likely_owner_user",
        label: "Most likely Owner/User",
      },
      {
        type: "quantitative_percentage",
        label: "Quantitative percentage",
      },
      {
        type: "rounding",
        label: "rounding",
      },
      {
        type: "res_comparison_attributes",
        label: "Residential Comparison Attributes",
      },
      {
        type: "res_evaluation_types",
        label: "Residential Evaluation Types",
      },
      {
        type: "sales_res_comp_quantitative_adjustments",
        label: "Sales comp quantitative adjustments",
      },
    ];

    // Disable foreign key checks
    await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS = 0;`);

    // Truncate the table
    await queryInterface.sequelize.query(
      `TRUNCATE TABLE global_code_categories;`
    );

    // Enable foreign key checks
    await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS = 1;`);
    // Retrieve existing codes
    const existingCodes = await queryInterface.sequelize.query(
      `SELECT type FROM global_code_categories`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingCodeTypes = new Set(existingCodes.map((code) => code.type));

    // Filter out global_code_categories that already exist
    const codeToInsert = globalCodes.filter(
      (code) => !existingCodeTypes.has(code.type)
    );

    // Add created and last_updated timestamps
    const currentTime = new Date();
    const codeWithTimestamps = codeToInsert.map((code) => ({
      ...code,
      created: currentTime,
      last_updated: currentTime,
    }));

    // Insert only new records
    if (codeWithTimestamps.length > 0) {
      await queryInterface.bulkInsert(
        "global_code_categories",
        codeWithTimestamps
      );
    } else {
      console.log("No new global code to insert");
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("global_code_categories", null, {});
  },
};
