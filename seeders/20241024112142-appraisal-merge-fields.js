"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const appraisalMergeFields = [
      {
        key: "street_address",
        tag: "street_address",
        field: "Street Address",
        type: null,
      },
      { key: "city", tag: "city", field: "City", type: null },
      { key: "state", tag: "state", field: "State", type: null },
      {
        key: "street_suite",
        tag: "suite_number",
        field: "Suite Number",
        type: null,
      },
      {
        key: "business_name",
        tag: "report_title",
        field: "Report Title",
        type: null,
      },
      { key: "county", tag: "county", field: "County", type: null },
      { key: "zipcode", tag: "zipcode", field: "Zipcode", type: null },
      { key: "type", tag: "type", field: "Type", type: null },
      {
        key: "under_contract_price",
        tag: "under_contract_price",
        field: "Under Contract Price",
        type: null,
      },
      { key: "close_date", tag: "close_date", field: "Close Date", type: null },
      {
        key: "last_transferred_date",
        tag: "last_sale_date",
        field: "Last Sale Date",
        type: null,
      },
      {
        key: "last_transfer_date_known",
        tag: "last_sale_date_known",
        field: "Is last sale date known?",
        type: null,
      },
      {
        key: "parcel_id_apn",
        tag: "apn_parcel_id_tax_id",
        field: "APN / PARCEL ID / TAX ID",
        type: null,
      },
      {
        key: "owner_of_record",
        tag: "owner_of_record",
        field: "Owner of Record",
        type: null,
      },
      {
        key: "property_geocode",
        tag: "property_geocode",
        field: "Property Geocode",
        type: null,
      },
      {
        key: "property_legal",
        tag: "property_legal",
        field: "Property Legal",
        type: null,
      },
      {
        key: "property_rights",
        tag: "property_rights",
        field: "Property Rights",
        type: null,
      },
      { key: "file_number", tag: "file", field: "File #", type: null },
      {
        key: "intended_use",
        tag: "intended_user",
        field: "Intended User(s)",
        type: null,
      },
      {
        key: "comparison_basis",
        tag: "comparison_basis",
        field: "Comparison Basis",
        type: null,
      },
      {
        key: "building_size",
        tag: "building_size",
        field: "Building Size",
        type: null,
      },
      { key: "land_size", tag: "lot_size", field: "Lot Size", type: null },
      {
        key: "land_dimension",
        tag: "size_type",
        field: "Size Type",
        type: null,
      },
      {
        key: "high_and_best_user",
        tag: "high_and_best_use",
        field: "Highest & best Use",
        type: null,
      },
      {
        key: "most_likely_owner_user",
        tag: "most_likely_owner_user",
        field: "Most likely Owner/User",
        type: null,
      },
      { key: "topography", tag: "topography", field: "Topography", type: null },
      { key: "lot_shape", tag: "lot_shape", field: "Lot Shape", type: null },
      { key: "frontage", tag: "frontage", field: "Frontage", type: null },
      {
        key: "front_feet",
        tag: "lot_frontage",
        field: "Lot Frontage",
        type: null,
      },
      { key: "lot_depth", tag: "lot_depth", field: "Lot Depth", type: null },
      {
        key: "utilities_select",
        tag: "utilities",
        field: "Utilities",
        type: null,
      },
      {
        key: "condition",
        tag: "property_condition",
        field: "Property Condition",
        type: null,
      },
      {
        key: "property_class",
        tag: "property_class",
        field: "Property Class",
        type: null,
      },
      { key: "year_built", tag: "year_built", field: "Year Built", type: null },
      {
        key: "year_remodeled",
        tag: "base_year_remodeled",
        field: "Base Year Remodeled",
        type: null,
      },
      { key: "no_stories", tag: "stories", field: "# Stories", type: null },
      {
        key: "height",
        tag: "ceiling_height",
        field: "Ceiling Height",
        type: null,
      },
      {
        key: "main_structure_base",
        tag: "structure_construction_type",
        field: "Structure Construction Type",
        type: null,
      },
      { key: "foundation", tag: "foundation", field: "Foundation", type: null },
      { key: "parking", tag: "parking", field: "Parking", type: null },
      { key: "basement", tag: "basement", field: "Basement", type: null },
      {
        key: "ada_compliance",
        tag: "ada_compliance",
        field: "ADA Compliance",
        type: null,
      },
      {
        key: "date_of_analysis",
        tag: "date_of_inspection",
        field: "Date of Inspection",
        type: null,
      },
      {
        key: "effective_date",
        tag: "effective_date",
        field: "Effective Date",
        type: null,
      },
      {
        key: "inspector_name",
        tag: "inspector_name",
        field: "Inspector Name",
        type: null,
      },
      {
        key: "report_date",
        tag: "report_date",
        field: "Report Date",
        type: null,
      },
      { key: "exterior", tag: "exterior", field: "Exterior", type: null },
      { key: "roof", tag: "roof", field: "Roof", type: null },
      { key: "electrical", tag: "electrical", field: "Electrical", type: null },
      { key: "plumbing", tag: "plumbing", field: "Plumbing", type: null },
      {
        key: "heating_cooling",
        tag: "heating_cooling",
        field: "Heating/Cooling",
        type: null,
      },
      { key: "windows", tag: "windows", field: "Windows", type: null },
      {
        key: "zoning_type",
        tag: "zoning_type",
        field: "Zoning Type",
        type: null,
      },
      {
        key: "conforming_use_determination",
        tag: "conforming_use_determination",
        field: "Confirming use determination",
        type: null,
      },
      {
        key: "land_assessment",
        tag: "land_assessment",
        field: "Land Assessment",
        type: null,
      },
      {
        key: "structure_assessment",
        tag: "Improvement_assessed_value",
        field: "Improvement assessed value",
        type: null,
      },
      {
        key: "total_land_improvement",
        tag: "total_land_improvement",
        field: "Land + Improvements",
        type: null,
      },
      {
        key: "price_square_foot",
        tag: "price_square_foot",
        field: "$/SF",
        type: null,
      },
      { key: "sids", tag: "sids", field: "SID'S", type: null },
      {
        key: "taxes_in_arrears",
        tag: "taxes_in_arrears",
        field: "Taxes in Arrears",
        type: null,
      },
      {
        key: "tax_liability",
        tag: "tax_liability",
        field: "Tax Liability",
        type: null,
      },
      {
        key: "assessed_market_year",
        tag: "assessed_market_year",
        field: "Assessed market Value Year",
        type: null,
      },
      {
        key: "tax_liability_year",
        tag: "tax_liability_year",
        field: "Tax Liability Year",
        type: null,
      },
      {
        key: "traffic_street_address",
        tag: "traffic_street_address",
        field: "Traffic Street Address",
        type: null,
      },
      {
        key: "traffic_count",
        tag: "traffic_count",
        field: "Traffic Count (ADT)",
        type: null,
      },
      {
        key: "zonings.zone",
        tag: "property_type",
        field: "Property Type",
        type: null,
      },
      {
        key: "zonings.sub_zone",
        tag: "sub_property",
        field: "Sub Property",
        type: null,
      },
      { key: "zonings.sq_ft", tag: "sq_ft", field: "SQ.FT.", type: null },
      {
        key: "zonings.weight_sf",
        tag: "sf_weight",
        field: "SF Weighting",
        type: null,
      },
      {
        key: "summary",
        tag: "property_summary",
        field: "Property Summary",
        type: null,
      },
      {
        key: "zoning_description",
        tag: "zoning_description",
        field: "Zoning Description",
        type: null,
      },
      {
        key: "income_notes",
        tag: "income_notes",
        field: "INCOME NOTES",
        type: "income",
      },
      { key: "vacancy", tag: "vacancy", field: "Vacancy", type: "income" },
      { key: "note", tag: "sales_notes", field: "SALES NOTES", type: "sale" },
      { key: "weight", tag: "weighting", field: "Weighting", type: "sale" },
      { key: "notes", tag: "notes", field: "Notes", type: "cost" },
      {
        key: "total_cost_valuation",
        tag: "total_cost_valuation",
        field: "Total Cost Valuation",
        type: "cost",
      },
      {
        key: "name_of_client",
        tag: "name_of_client",
        field: "Name Of Client",
        type: null,
      },
      {
        key: "client.title",
        tag: "title",
        field: "Select Title",
        type: null,
      },
      {
        key: "client.company",
        tag: "company",
        field: "Company",
        type: null,
      },
      {
        key: "client.city",
        tag: "client_city",
        field: "Client City",
        type: null,
      },
      {
        key: "client.zipcode",
        tag: "client_zipcode",
        field: "Client Zip Code",
        type: null,
      },
      {
        key: "client.phone_number",
        tag: "client_phone_number",
        field: "Phone Number",
        type: null,
      },
      {
        key: "client.street_address",
        tag: "client_street_address",
        field: "Client Street Address",
        type: null,
      },
      {
        key: "client.email_address",
        tag: "email_address",
        field: "Client Email Address",
        type: null,
      },
      {
        key: "state_of_client",
        tag: "state_of_client",
        field: "State Of Client",
        type: null,
      },
    ];

    // Retrieve existing keys
    const existingKeys = await queryInterface.sequelize.query(
      `SELECT \`key\` FROM appraisal_merge_fields`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingKeySet = new Set(existingKeys.map((field) => field.key));

    // Filter out fields that already exist
    const fieldsToInsert = appraisalMergeFields.filter(
      (field) => !existingKeySet.has(field.key)
    );

    // Add created and updated timestamps
    const currentTime = new Date();
    const fieldsWithTimestamps = fieldsToInsert.map((field) => ({
      ...field,
      created: currentTime,
      last_updated: currentTime,
    }));

    // Insert only new records
    if (fieldsWithTimestamps.length > 0) {
      await queryInterface.bulkInsert(
        "appraisal_merge_fields",
        fieldsWithTimestamps
      );
    } else {
      console.log("No new appraisal merge fields to insert");
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("appraisal_merge_fields", null, {});
  },
};
