"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Safety check: Ensure all required tables exist
    const tables = await queryInterface.showAllTables();
    if (
      !tables.includes("res_evaluation_income_approaches") ||
      !tables.includes("res_evaluation_sales_approaches") ||
      !tables.includes("res_evaluation_cost_approaches") ||
      !tables.includes("res_evaluation_scenarios")
    ) {
      return;
    }

    //  Update res_evaluation_income_approaches with scenario IDs
    await queryInterface.sequelize.query(`
      UPDATE res_evaluation_income_approaches AS income
      JOIN res_evaluation_scenarios AS scenario
        ON income.res_evaluation_id = scenario.res_evaluation_id
      SET income.res_evaluation_scenario_id = scenario.id
    `);

    // Update res_evaluation_sales_approaches with scenario IDs
    await queryInterface.sequelize.query(`
      UPDATE res_evaluation_sales_approaches AS sale
      JOIN res_evaluation_scenarios AS scenario
        ON sale.res_evaluation_id = scenario.res_evaluation_id
      SET sale.res_evaluation_scenario_id = scenario.id
    `);

    //  Update res_evaluation_cost_approaches with scenario IDs
    await queryInterface.sequelize.query(`
      UPDATE res_evaluation_cost_approaches AS cost
      JOIN res_evaluation_scenarios AS scenario
        ON cost.res_evaluation_id = scenario.res_evaluation_id
      SET cost.res_evaluation_scenario_id = scenario.id
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Safety check: Ensure all required tables exist
    const tables = await queryInterface.showAllTables();
    if (
      !tables.includes("res_evaluation_income_approaches") ||
      !tables.includes("res_evaluation_sales_approaches") ||
      !tables.includes("res_evaluation_cost_approaches")
    ) {
      return;
    }

    // Rollback: clear the res_evaluation_scenario_id in all three tables
    await queryInterface.sequelize.query(`
      UPDATE res_evaluation_income_approaches SET res_evaluation_scenario_id = NULL
    `);
    await queryInterface.sequelize.query(`
      UPDATE res_evaluation_sales_approaches SET res_evaluation_scenario_id = NULL
    `);
    await queryInterface.sequelize.query(`
      UPDATE res_evaluation_cost_approaches SET res_evaluation_scenario_id = NULL
    `);
  },
};
