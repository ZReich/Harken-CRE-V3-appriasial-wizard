"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the section_item table exists before running the query
    const tableExists = await queryInterface.sequelize.query(
      "SHOW TABLES LIKE 'section_item'"
    );
    if (tableExists[0].length > 0) {
      // Change the 'content' field in the 'section_item' table to MEDIUMTEXT
      await queryInterface.changeColumn("section_item", "content", {
        type: Sequelize.TEXT("medium"), // Set field type to MEDIUMTEXT
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if the section_item table exists before running the query
    const tableExists = await queryInterface.sequelize.query(
      "SHOW TABLES LIKE 'section_item'"
    );
    if (tableExists[0].length > 0) {
      // Revert the 'content' field back to its original data type (e.g., TEXT)
      await queryInterface.changeColumn("section_item", "content", {
        type: Sequelize.TEXT, // Set this to the previous data type
      });
    }
  },
};
