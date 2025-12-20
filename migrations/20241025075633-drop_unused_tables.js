"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = ["global_code_options", "global_codes", "merge_fields"];

    // Disable foreign key checks
    await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS = 0;`);

    for (const table of tables) {
      await queryInterface.sequelize.query(`
        DROP TABLE IF EXISTS ${table};
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
