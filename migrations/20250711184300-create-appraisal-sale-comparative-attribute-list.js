"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("appraisal_sale_comparative_attribute_list"));

    if (!tableExists) {
      await queryInterface.createTable(
        "appraisal_sale_comparative_attribute_list",
        {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          appraisal_type_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          sales_comparative_attribute_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          default: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
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
        }
      );
      // await queryInterface.addIndex(
      //   "appraisal_sale_comparative_attribute_list",
      //   ["sales_comparative_attribute_id"],
      //   { name: "sales_comparative_attribute_id" }
      // );
      // await queryInterface.addConstraint(
      //   "appraisal_sale_comparative_attribute_list",
      //   {
      //     fields: ["sales_comparative_attribute_id"],
      //     type: "foreign key",
      //     name: "sales_comparative_attribute_id",
      //     references: {
      //       table: "global_codes",
      //       field: "id",
      //     },
      //     onUpdate: "CASCADE",
      //   }
      // );
    }
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeConstraint(
    //   'appraisal_sale_comparative_attribute_list',
    //   'sales_comparative_attribute_id'
    // );
    await queryInterface.dropTable("appraisal_sale_comparative_attribute_list");
  },
};
