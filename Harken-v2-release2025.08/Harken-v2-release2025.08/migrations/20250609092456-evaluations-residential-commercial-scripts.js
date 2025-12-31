"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Safety check: Ensure table exists
    const tables = await queryInterface.showAllTables();
    if (!tables.includes("res_evaluations")) return;

    // Describe res_evaluations table
    const resEvalDesc = await queryInterface.describeTable("res_evaluations");

    // Add evaluation_type column if it does not exist
    if (!resEvalDesc.evaluation_type) {
      await queryInterface.addColumn("res_evaluations", "evaluation_type", {
        type: Sequelize.STRING(30),
        allowNull: true,
      });
    }

    // Set evaluation_type = 'residential'
    await queryInterface.sequelize.query(`
      UPDATE res_evaluations
      SET evaluation_type = 'residential'
    `);
  },

  down: async (queryInterface) => {
    // Safety check: Ensure table exists
    const tables = await queryInterface.showAllTables();
    if (!tables.includes("res_evaluations")) return;

    const resEvalDesc = await queryInterface.describeTable("res_evaluations");

    if ("evaluation_type" in resEvalDesc) {
      await queryInterface.sequelize.query(`
        UPDATE res_evaluations
        SET evaluation_type = NULL
      `);
    }
  },
};
