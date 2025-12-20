"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("appraisal_sales_approach_qualitative_comp_adj"));

    if (!tableExists) {
      await queryInterface.createTable(
        "appraisal_sales_approach_qualitative_comp_adj",
        {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          appraisal_sales_approach_comp_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          adj_key: {
            type: Sequelize.STRING(50),
            allowNull: true,
          },
          adj_value: {
            type: Sequelize.STRING(50),
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
        }
      );
      // await queryInterface.addIndex(
      //   "appraisal_sales_approach_qualitative_comp_adj",
      //   ["appraisal_sales_approach_comp_id"],
      //   { name: "appraisal_sales_approach_comp_id" }
      // );
      // await queryInterface.addConstraint(
      //   "appraisal_sales_approach_qualitative_comp_adj",
      //   {
      //     fields: ["appraisal_sales_approach_comp_id"],
      //     type: "foreign key",
      //     name: "appraisal_sales_approach_comp_id",
      //     references: {
      //       table: "appraisal_sales_approach_comps",
      //       field: "id",
      //     },
      //     onDelete: "CASCADE",
      //     onUpdate: "CASCADE",
      //   }
      // );
    }
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeConstraint(
    //   'appraisal_sales_approach_qualitative_comp_adj',
    //   'appraisal_sales_approach_comp_id'
    // );
    await queryInterface.dropTable(
      "appraisal_sales_approach_qualitative_comp_adj"
    );
  },
};
