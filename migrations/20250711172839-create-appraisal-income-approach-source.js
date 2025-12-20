"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("appraisal_income_approach_source"));

    if (!tableExists) {
      await queryInterface.createTable("appraisal_income_approach_source", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        appraisal_income_approach_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        zoning_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        type: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        monthly_income: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        annual_income: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        rent_unit: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        unit: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        rent_sq_ft: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        square_feet: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        rent_bed: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        bed: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        sf_source: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        comments: {
          type: Sequelize.STRING(255),
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
        link_overview: {
          type: Sequelize.TINYINT,
          allowNull: true,
          defaultValue: 0,
        },
      });
      // await queryInterface.addIndex(
      //   "appraisal_income_approach_source",
      //   ["appraisal_income_approach_id"],
      //   { name: "appraisal_income_approach_id" }
      // );
      // await queryInterface.addIndex(
      //   "appraisal_income_approach_source",
      //   ["zoning_id"],
      //   { name: "zoning_id" }
      // );
      // await queryInterface.addConstraint("appraisal_income_approach_source", {
      //   fields: ["appraisal_income_approach_id"],
      //   type: "foreign key",
      //   name: "appraisal_income_approach_id",
      //   references: {
      //     table: "appraisal_income_approaches",
      //     field: "id",
      //   },
      //   onDelete: "CASCADE",
      //   onUpdate: "CASCADE",
      // });
      // await queryInterface.addConstraint("appraisal_income_approach_source", {
      //   fields: ["zoning_id"],
      //   type: "foreign key",
      //   name: "zoning_id",
      //   references: {
      //     table: "zoning",
      //     field: "id",
      //   },
      //   onDelete: "CASCADE",
      //   onUpdate: "CASCADE",
      // });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "appraisal_income_approach_source",
      "appraisal_income_approach_source_ibfk_423"
    );
    await queryInterface.removeConstraint(
      "appraisal_income_approach_source",
      "appraisal_income_approach_source_ibfk_424"
    );
    await queryInterface.dropTable("appraisal_income_approach_source");
  },
};
