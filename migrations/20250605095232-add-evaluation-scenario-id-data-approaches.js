"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get list of existing tables
    const allTables = await queryInterface.showAllTables();
    const tableNames = allTables.map((t) => t.toLowerCase());

    //  Update evaluation_income_approaches with scenario IDs
    if (tableNames.includes('evaluation_income_approaches') && tableNames.includes('evaluation_scenarios')) {
      try {
        await queryInterface.sequelize.query(`
          UPDATE evaluation_income_approaches AS income
          JOIN evaluation_scenarios AS scenario
            ON income.evaluation_id = scenario.evaluation_id
          SET income.evaluation_scenario_id = scenario.id
        `);
      } catch (e) {
        // Ignore errors if tables don't exist or query fails
      }
    }

    // Update evaluation_sales_approaches with scenario IDs
    if (tableNames.includes('evaluation_sales_approaches') && tableNames.includes('evaluation_scenarios')) {
      try {
        await queryInterface.sequelize.query(`
          UPDATE evaluation_sales_approaches AS sale
          JOIN evaluation_scenarios AS scenario
            ON sale.evaluation_id = scenario.evaluation_id
          SET sale.evaluation_scenario_id = scenario.id
        `);
      } catch (e) {
        // Ignore errors
      }
    }

    //  Update evaluation_cost_approaches with scenario IDs
    if (tableNames.includes('evaluation_cost_approaches') && tableNames.includes('evaluation_scenarios')) {
      try {
        await queryInterface.sequelize.query(`
          UPDATE evaluation_cost_approaches AS cost
          JOIN evaluation_scenarios AS scenario
            ON cost.evaluation_id = scenario.evaluation_id
          SET cost.evaluation_scenario_id = scenario.id
        `);
      } catch (e) {
        // Ignore errors
      }
    }

    //  Update evaluation_lease_approaches with scenario IDs
    if (tableNames.includes('evaluation_lease_approaches') && tableNames.includes('evaluation_scenarios')) {
      try {
        await queryInterface.sequelize.query(`
          UPDATE evaluation_lease_approaches AS lease
          JOIN evaluation_scenarios AS scenario
            ON lease.evaluation_id = scenario.evaluation_id
          SET lease.evaluation_scenario_id = scenario.id
        `);
      } catch (e) {
        // Ignore errors
      }
    }

    //  Update evaluation_cap_approaches with scenario IDs
    if (tableNames.includes('evaluation_cap_approaches') && tableNames.includes('evaluation_scenarios')) {
      try {
        await queryInterface.sequelize.query(`
          UPDATE evaluation_cap_approaches AS cap
          JOIN evaluation_scenarios AS scenario
            ON cap.evaluation_id = scenario.evaluation_id
          SET cap.evaluation_scenario_id = scenario.id
        `);
      } catch (e) {
        // Ignore errors
      }
    }

    //  Update evaluation_multi_family_approaches with scenario IDs
    if (tableNames.includes('evaluation_multi_family_approaches') && tableNames.includes('evaluation_scenarios')) {
      try {
        await queryInterface.sequelize.query(`
          UPDATE evaluation_multi_family_approaches AS multi_family
          JOIN evaluation_scenarios AS scenario
            ON multi_family.evaluation_id = scenario.evaluation_id
          SET multi_family.evaluation_scenario_id = scenario.id
        `);
      } catch (e) {
        // Ignore errors
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback: clear the evaluation_scenario_id in all three tables
    await queryInterface.sequelize.query(`
      UPDATE evaluation_income_approaches SET evaluation_scenario_id = NULL
    `);
    await queryInterface.sequelize.query(`
      UPDATE evaluation_sale_approaches SET evaluation_scenario_id = NULL
    `);
    await queryInterface.sequelize.query(`
      UPDATE evaluation_cost_approaches SET evaluation_scenario_id = NULL
    `);
    await queryInterface.sequelize.query(`
      UPDATE evaluation_lease_approaches SET evaluation_scenario_id = NULL
    `);
    await queryInterface.sequelize.query(`
      UPDATE evaluation_cap_approaches SET evaluation_scenario_id = NULL
    `);
    await queryInterface.sequelize.query(`
      UPDATE evaluation_multi_family_approaches SET evaluation_scenario_id = NULL
    `);
  },
};
