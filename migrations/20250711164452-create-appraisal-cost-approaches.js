"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("appraisal_cost_approaches"));

    if (!tableExists) {
      await queryInterface.createTable("appraisal_cost_approaches", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        appraisal_approach_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        eval_weight: { type: Sequelize.DOUBLE, allowNull: true },
        weight: { type: Sequelize.DOUBLE, allowNull: true },
        averaged_adjusted_psf: { type: Sequelize.DOUBLE, allowNull: true },
        incremental_value: { type: Sequelize.DOUBLE, allowNull: true },
        land_value: { type: Sequelize.DOUBLE, allowNull: true },
        effective_age: { type: Sequelize.FLOAT, allowNull: true },
        base_year_remodeled: { type: Sequelize.INTEGER, allowNull: true },
        overall_replacement_cost: { type: Sequelize.DOUBLE, allowNull: true },
        total_depreciation: { type: Sequelize.DOUBLE, allowNull: true },
        total_depreciation_percentage: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        total_depreciated_cost: { type: Sequelize.DOUBLE, allowNull: true },
        notes: { type: Sequelize.TEXT, allowNull: true },
        total_cost_valuation: { type: Sequelize.DOUBLE, allowNull: true },
        indicated_value_psf: { type: Sequelize.DOUBLE, allowNull: true },
        totals: { type: Sequelize.TEXT, allowNull: true },
        comments: { type: Sequelize.TEXT, allowNull: true },
        subject_property_adjustments: { type: Sequelize.TEXT, allowNull: true },
        indicated_value_punit: { type: Sequelize.DOUBLE, allowNull: true },
        indicated_value_pbed: { type: Sequelize.DOUBLE, allowNull: true },
        improvements_total_sf_area: { type: Sequelize.DOUBLE, allowNull: true },
        improvements_total_adjusted_ppsf: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        improvements_total_depreciation: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        improvements_total_adjusted_cost: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        area_map_zoom: { type: Sequelize.INTEGER, allowNull: true },
        map_type: {
          type: Sequelize.STRING(255),
          allowNull: true,
          defaultValue: "roadmap",
        },
        date_created: {
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
        map_center_lat: { type: Sequelize.STRING(30), allowNull: true },
        map_center_lng: { type: Sequelize.STRING(30), allowNull: true },
      });
      await queryInterface.addIndex("appraisal_cost_approaches", [
        "appraisal_approach_id",
      ]);
      await queryInterface.addConstraint("appraisal_cost_approaches", {
        fields: ["appraisal_approach_id"],
        type: "foreign key",
        name: "appraisal_approach_id",
        references: {
          table: "appraisal_approaches",
          field: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "appraisal_cost_approaches",
      "appraisal_cost_approaches_ibfk_1"
    );
    await queryInterface.dropTable("appraisal_cost_approaches");
  },
};
