"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("appraisal_sales_approach_comps"));

    if (!tableExists) {
      await queryInterface.createTable("appraisal_sales_approach_comps", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        appraisal_sales_approach_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        comp_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        order: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        adjustment_note: {
          type: Sequelize.TEXT,
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
        blended_adjusted_psf: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        averaged_adjusted_psf: {
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
        overall_comparability: {
          type: Sequelize.STRING(15),
          allowNull: true,
        },
      });
      // await queryInterface.addIndex(
      //   "appraisal_sales_approach_comps",
      //   ["appraisal_sales_approach_id"],
      //   { name: "appraisal_sales_approach_id" }
      // );
      // await queryInterface.addIndex(
      //   "appraisal_sales_approach_comps",
      //   ["comp_id"],
      //   { name: "comp_id" }
      // );
      // await queryInterface.addConstraint("appraisal_sales_approach_comps", {
      //   fields: ["appraisal_sales_approach_id"],
      //   type: "foreign key",
      //   name: "appraisal_sales_approach_id",
      //   references: {
      //     table: "appraisal_sales_approaches",
      //     field: "id",
      //   },
      //   onDelete: "CASCADE",
      //   onUpdate: "CASCADE",
      // });
      // await queryInterface.addConstraint("appraisal_sales_approach_comps", {
      //   fields: ["comp_id"],
      //   type: "foreign key",
      //   name: "comp_id",
      //   references: {
      //     table: "comps",
      //     field: "id",
      //   },
      //   onUpdate: "CASCADE",
      // });
    }
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeConstraint(
    //   'appraisal_sales_approach_comps',
    //   'appraisal_sales_approach_id'
    // );
    // await queryInterface.removeConstraint(
    //   'appraisal_sales_approach_comps',
    //   'comp_id'
    // );
    await queryInterface.dropTable("appraisal_sales_approach_comps");
  },
};
