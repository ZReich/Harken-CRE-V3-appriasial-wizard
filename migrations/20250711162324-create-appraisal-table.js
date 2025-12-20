"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("appraisals"));

    if (!tableExists) {
      await queryInterface.createTable("appraisals", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        property_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        account_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        client_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        appraisal_type: { type: Sequelize.STRING(30), allowNull: true },
        business_name: { type: Sequelize.TEXT, allowNull: true },
        street_address: { type: Sequelize.TEXT, allowNull: true },
        street_suite: { type: Sequelize.TEXT, allowNull: true },
        city: { type: Sequelize.TEXT, allowNull: true },
        county: { type: Sequelize.TEXT, allowNull: true },
        state: { type: Sequelize.STRING(10), allowNull: true },
        zipcode: { type: Sequelize.INTEGER, allowNull: true },
        type: { type: Sequelize.STRING(30), allowNull: true },
        under_contract_price: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
        close_date: { type: Sequelize.STRING(50), allowNull: true },
        last_transferred_date: { type: Sequelize.STRING(50), allowNull: true },
        price: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
        land_assessment: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
        structure_assessment: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
        sids: { type: Sequelize.TEXT, allowNull: true },
        taxes_in_arrears: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
        tax_liability: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
        condition: { type: Sequelize.TEXT, allowNull: true },
        property_class: { type: Sequelize.TEXT, allowNull: true },
        year_built: { type: Sequelize.TEXT, allowNull: true },
        year_remodeled: { type: Sequelize.TEXT, allowNull: true },
        price_square_foot: { type: Sequelize.DOUBLE, allowNull: true },
        building_size: { type: Sequelize.DOUBLE, allowNull: true },
        land_size: { type: Sequelize.DOUBLE, allowNull: true },
        land_dimension: { type: Sequelize.STRING(20), allowNull: true },
        no_stories: { type: Sequelize.TEXT, allowNull: true },
        parcel_id_apn: { type: Sequelize.TEXT, allowNull: true },
        owner_of_record: { type: Sequelize.TEXT, allowNull: true },
        property_geocode: { type: Sequelize.TEXT, allowNull: true },
        property_legal: { type: Sequelize.TEXT, allowNull: true },
        property_rights: { type: Sequelize.TEXT, allowNull: true },
        high_and_best_user: { type: Sequelize.TEXT, allowNull: true },
        intended_use: { type: Sequelize.TEXT, allowNull: true },
        intended_user: { type: Sequelize.TEXT, allowNull: true },
        topography: { type: Sequelize.TEXT, allowNull: true },
        frontage: { type: Sequelize.TEXT, allowNull: true },
        front_feet: { type: Sequelize.DOUBLE, allowNull: true },
        lot_depth: { type: Sequelize.DOUBLE, allowNull: true },
        utilities_select: { type: Sequelize.TEXT, allowNull: true },
        zoning_type: { type: Sequelize.TEXT, allowNull: true },
        zoning_description: { type: Sequelize.TEXT, allowNull: true },
        height: { type: Sequelize.TEXT, allowNull: true },
        main_structure_base: { type: Sequelize.TEXT, allowNull: true },
        foundation: { type: Sequelize.TEXT, allowNull: true },
        parking: { type: Sequelize.TEXT, allowNull: true },
        basement: { type: Sequelize.TEXT, allowNull: true },
        ada_compliance: { type: Sequelize.TEXT, allowNull: true },
        date_of_analysis: { type: Sequelize.STRING(50), allowNull: true },
        inspector_name: { type: Sequelize.TEXT, allowNull: true },
        report_date: { type: Sequelize.STRING(50), allowNull: true },
        effective_date: { type: Sequelize.STRING(50), allowNull: true },
        exterior: { type: Sequelize.TEXT, allowNull: true },
        roof: { type: Sequelize.TEXT, allowNull: true },
        electrical: { type: Sequelize.TEXT, allowNull: true },
        plumbing: { type: Sequelize.TEXT, allowNull: true },
        heating_cooling: { type: Sequelize.TEXT, allowNull: true },
        windows: { type: Sequelize.TEXT, allowNull: true },
        conforming_use_determination: { type: Sequelize.TEXT, allowNull: true },
        traffic_street_address: { type: Sequelize.TEXT, allowNull: true },
        traffic_count: { type: Sequelize.STRING(30), allowNull: true },
        traffic_input: { type: Sequelize.DOUBLE, allowNull: true },
        map_image_url: { type: Sequelize.TEXT, allowNull: true },
        map_zoom: { type: Sequelize.INTEGER, allowNull: true },
        map_selected_area: { type: Sequelize.TEXT, allowNull: true },
        map_pin_lat: { type: Sequelize.STRING(30), allowNull: true },
        map_pin_lng: { type: Sequelize.STRING(30), allowNull: true },
        map_pin_zoom: { type: Sequelize.INTEGER, allowNull: true },
        map_image_for_report_url: { type: Sequelize.TEXT, allowNull: true },
        google_place_id: { type: Sequelize.TEXT, allowNull: true },
        map_pin_image_url: { type: Sequelize.INTEGER, allowNull: true },
        latitude: { type: Sequelize.STRING(30), allowNull: true },
        longitude: { type: Sequelize.STRING(30), allowNull: true },
        weighted_market_value: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
        },
        position: { type: Sequelize.TEXT, allowNull: true },
        submitted: { type: Sequelize.TINYINT, allowNull: true, defaultValue: 0 },
        file_number: { type: Sequelize.STRING(100), allowNull: true },
        summary: { type: Sequelize.TEXT, allowNull: true },
        rounding: { type: Sequelize.INTEGER, allowNull: true },
        created: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        last_updated: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        last_transfer_date_known: {
          type: Sequelize.STRING(50),
          allowNull: true,
          defaultValue: "yes",
        },
        most_likely_owner_user: { type: Sequelize.TEXT, allowNull: true },
        review_summary: { type: Sequelize.TEXT, allowNull: true },
        comp_adjustment_mode: {
          type: Sequelize.STRING(20),
          allowNull: true,
          defaultValue: "Percent",
        },
        comp_type: { type: Sequelize.STRING(30), allowNull: true },
        land_type: { type: Sequelize.TEXT, allowNull: true },
        lot_shape: { type: Sequelize.TEXT, allowNull: true },
        aerial_map_zoom: { type: Sequelize.INTEGER, allowNull: true },
        aerial_map_type: {
          type: Sequelize.STRING(20),
          allowNull: true,
          defaultValue: "roadmap",
        },
        assessed_market_year: { type: Sequelize.STRING(20), allowNull: true },
        tax_liability_year: { type: Sequelize.STRING(20), allowNull: true },
        total_land_improvement: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
        },
        analysis_type: {
          type: Sequelize.STRING(20),
          allowNull: true,
          defaultValue: "$/SF",
        },
        comparison_basis: {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: "SF",
        },
        included_utilities: { type: Sequelize.TEXT, allowNull: true },
        other_include_utilities: { type: Sequelize.TEXT, allowNull: true },
        photos_taken_by: { type: Sequelize.STRING(255), allowNull: true },
        photo_date: { type: Sequelize.STRING(50), allowNull: true },
        map_center_lat: { type: Sequelize.STRING(30), allowNull: true },
        map_center_lng: { type: Sequelize.STRING(30), allowNull: true },
        boundary_map_type: {
          type: Sequelize.STRING(20),
          allowNull: true,
          defaultValue: "hybrid",
        },
      });
      await queryInterface.addIndex("appraisals", ["property_id"]);
      await queryInterface.addIndex("appraisals", ["user_id"]);
      await queryInterface.addIndex("appraisals", ["account_id"]);
      await queryInterface.addIndex("appraisals", ["client_id"]);
      await queryInterface.addConstraint("appraisals", {
        fields: ["property_id"],
        type: "foreign key",
        name: "property_id",
        references: {
          table: "properties",
          field: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      await queryInterface.addConstraint("appraisals", {
        fields: ["user_id"],
        type: "foreign key",
        name: "user_id",
        references: {
          table: "users",
          field: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      await queryInterface.addConstraint("appraisals", {
        fields: ["account_id"],
        type: "foreign key",
        name: "account_id",
        references: {
          table: "accounts",
          field: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      await queryInterface.addConstraint("appraisals", {
        fields: ["client_id"],
        type: "foreign key",
        name: "client_id",
        references: {
          table: "clients",
          field: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      await queryInterface.createTable("appraisals_included_utilities", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        appraisal_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        utility: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        created: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        last_updated: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      });
      await queryInterface.addIndex("appraisals_included_utilities", [
        "appraisal_id",
      ]);
      await queryInterface.addConstraint("appraisals_included_utilities", {
        fields: ["appraisal_id"],
        type: "foreign key",
        name: "appraisal_id",
        references: {
          table: "appraisals",
          field: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("appraisals", "appraisals_ibfk_2130");
    await queryInterface.removeConstraint("appraisals", "appraisals_ibfk_2131");
    await queryInterface.removeConstraint("appraisals", "appraisals_ibfk_2132");
    await queryInterface.removeConstraint("appraisals", "appraisals_ibfk_2133");
    await queryInterface.dropTable("appraisals");
    await queryInterface.removeConstraint(
      "appraisals_included_utilities",
      "appraisals_included_utilities_ibfk_1"
    );
    await queryInterface.dropTable("appraisals_included_utilities");
  },
};
