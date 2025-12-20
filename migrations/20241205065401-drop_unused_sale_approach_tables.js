"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = [
      "appraisal_sales_comparison_attributes",
      "appraisal_sale_qualitative_comp_adj",
      "appraisal_sale_qualitative_sub_adj",
      "appraisal_lease_qualitative_sub_adj",
      "appraisal_lease_qualitative_comp_adj",
    ];

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
