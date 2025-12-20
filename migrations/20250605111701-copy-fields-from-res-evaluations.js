"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Safety check: Ensure required tables exist
    const tables = await queryInterface.showAllTables();
    if (
      !tables.includes("res_evaluations") ||
      !tables.includes("res_evaluation_scenarios")
    ) {
      return;
    }

    await queryInterface.sequelize.query(`
      INSERT INTO res_evaluation_scenarios (
        res_evaluation_id,
        name,
        has_income_approach,
        has_sales_approach,
        has_cost_approach,
        weighted_market_value,
        rounding,
        created,
        last_updated
      )
      SELECT
        re.id,
        'primary',
        re.has_income_approach,
        re.has_sales_approach,
        re.has_cost_approach,
        re.weighted_market_value,
        re.rounding,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      FROM res_evaluations re
      WHERE NOT EXISTS (
        SELECT 1 FROM res_evaluation_scenarios res
        WHERE res.res_evaluation_id = re.id AND res.name = 'primary'
      );
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Safety check: Ensure required table exists
    const tables = await queryInterface.showAllTables();
    if (
      !tables.includes("res_evaluation_scenarios") ||
      !tables.includes("res_evaluations")
    ) {
      return;
    }

    await queryInterface.sequelize.query(`
      DELETE FROM res_evaluation_scenarios
      WHERE res_evaluation_id IN (SELECT id FROM res_evaluations)
        AND name = 'primary';
    `);
  },
};
