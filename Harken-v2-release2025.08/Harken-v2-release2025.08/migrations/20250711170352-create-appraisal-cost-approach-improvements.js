"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("appraisal_cost_approach_improvements"));

    if (!tableExists) {
      await queryInterface.createTable("appraisal_cost_approach_improvements", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        zoning_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        appraisal_cost_approach_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        type: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        sf_area: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        adjusted_psf: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        depreciation: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        adjusted_cost: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        depreciation_amount: {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
        structure_cost: {
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
      await queryInterface.addIndex("appraisal_cost_approach_improvements", [
        "zoning_id",
      ]);
      // await queryInterface.addIndex("appraisal_cost_approach_improvements", [
      //   "appraisal_cost_approach_id",
      // ]);
      await queryInterface.addConstraint("appraisal_cost_approach_improvements", {
        fields: ["zoning_id"],
        type: "foreign key",
        references: {
          table: "zoning",
          field: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      // await queryInterface.addConstraint("appraisal_cost_approach_improvements", {
      //   fields: ["appraisal_cost_approach_id"],
      //   type: "foreign key",
      //   name: "appraisal_cost_approach_id",
      //   references: {
      //     table: "appraisal_cost_approaches",
      //     field: "id",
      //   },
      //   onDelete: "CASCADE",
      //   onUpdate: "CASCADE",
      // });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "appraisal_cost_approach_improvements",
      "appraisal_cost_approach_improvements_ibfk_312"
    );
    await queryInterface.removeConstraint(
      "appraisal_cost_approach_improvements",
      "appraisal_cost_approach_improvements_ibfk_313"
    );
    await queryInterface.dropTable("appraisal_cost_approach_improvements");
  },
};
