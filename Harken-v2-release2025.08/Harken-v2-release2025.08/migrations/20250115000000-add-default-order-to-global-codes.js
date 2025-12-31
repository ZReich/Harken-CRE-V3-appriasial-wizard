"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the column already exists
    const tableDescription = await queryInterface.describeTable("global_codes");
    
    if (!tableDescription.default_order) {
      await queryInterface.addColumn("global_codes", "default_order", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if the column exists before removing
    const tableDescription = await queryInterface.describeTable("global_codes");
    
    if (tableDescription.default_order) {
      await queryInterface.removeColumn("global_codes", "default_order");
    }
  },
};