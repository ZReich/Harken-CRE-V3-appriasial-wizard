"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("appraisal_lease_approach"));

    if (!tableExists) {
      await queryInterface.createTable("appraisal_lease_approach", {
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
        weight: { type: Sequelize.DOUBLE, allowNull: true },
        averaged_adjusted_psf: { type: Sequelize.DOUBLE, allowNull: true },
        lease_approach_value: { type: Sequelize.DOUBLE, allowNull: true },
        note: { type: Sequelize.TEXT, allowNull: true },
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
        total_comp_adj: { type: Sequelize.INTEGER, allowNull: true },
        lease_approach_indicated_val: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        area_map_zoom: { type: Sequelize.INTEGER, allowNull: true },
        map_type: {
          type: Sequelize.STRING(255),
          allowNull: true,
          defaultValue: "roadmap",
        },
        map_center_lat: { type: Sequelize.STRING(30), allowNull: true },
        map_center_lng: { type: Sequelize.STRING(30), allowNull: true },
        low_adjusted_comp_range: { type: Sequelize.STRING(30), allowNull: true },
        high_adjusted_comp_range: { type: Sequelize.STRING(30), allowNull: true },
      });
      // await queryInterface.addIndex(
      //   "appraisal_lease_approach",
      //   ["appraisal_approach_id"],
      //   { name: "appraisal_approach_id" }
      // );
      // await queryInterface.addConstraint("appraisal_lease_approach", {
      //   fields: ["appraisal_approach_id"],
      //   type: "foreign key",
      //   name: "appraisal_approach_id",
      //   references: {
      //     table: "appraisal_approaches",
      //     field: "id",
      //   },
      //   onDelete: "CASCADE",
      //   onUpdate: "CASCADE",
      // });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "appraisal_lease_approach",
      "appraisal_approach_id"
    );
    await queryInterface.dropTable("appraisal_lease_approach");
  },
};
