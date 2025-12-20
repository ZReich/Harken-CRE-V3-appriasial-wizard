"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("appraisal_sales_approach_comparison_attributes"));

    if (!tableExists) {
      await queryInterface.createTable(
        "appraisal_sales_approach_comparison_attributes",
        {
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
          comparison_key: {
            type: Sequelize.STRING(50),
            allowNull: true,
          },
          comparison_value: {
            type: Sequelize.STRING(50),
            allowNull: true,
          },
          order: {
            type: Sequelize.INTEGER,
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
      await queryInterface.addIndex(
        "appraisal_sales_approach_comparison_attributes",
        ["appraisal_sales_approach_id"],
        { name: "appraisal_sales_approach_id" }
      );
      await queryInterface.addConstraint(
        "appraisal_sales_approach_comparison_attributes",
        {
          fields: ["appraisal_sales_approach_id"],
          type: "foreign key",
          name: "appraisal_sales_approach_id",
          references: {
            table: "appraisal_sales_approaches",
            field: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeConstraint(
    //   'appraisal_sales_approach_comparison_attributes',
    //   'appraisal_sales_approach_id'
    // );
    await queryInterface.dropTable(
      "appraisal_sales_approach_comparison_attributes"
    );
  },
};
