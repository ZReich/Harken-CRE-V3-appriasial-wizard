"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("appraisal_cost_approach_comps"));

    if (!tableExists) {
      await queryInterface.createTable("appraisal_cost_approach_comps", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        appraisal_cost_approach_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        comp_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        order: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        total_adjustment: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        adjusted_psf: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        weight: {
          type: Sequelize.DOUBLE,
          allowNull: true,
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
      });
      await queryInterface.addIndex("appraisal_cost_approach_comps", [
        "appraisal_cost_approach_id",
      ]);
      await queryInterface.addIndex("appraisal_cost_approach_comps", ["comp_id"]);
      await queryInterface.addConstraint("appraisal_cost_approach_comps", {
        fields: ["appraisal_cost_approach_id"],
        type: "foreign key",
        name: "appraisal_cost_approach_id",
        references: {
          table: "appraisal_cost_approaches",
          field: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      await queryInterface.addConstraint("appraisal_cost_approach_comps", {
        fields: ["comp_id"],
        type: "foreign key",
        name: "comp_id",
        references: {
          table: "comps",
          field: "id",
        },
        onUpdate: "CASCADE",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "appraisal_cost_approach_comps",
      "appraisal_cost_approach_comps_ibfk_371"
    );
    await queryInterface.removeConstraint(
      "appraisal_cost_approach_comps",
      "appraisal_cost_approach_comps_ibfk_372"
    );
    await queryInterface.dropTable("appraisal_cost_approach_comps");
  },
};
