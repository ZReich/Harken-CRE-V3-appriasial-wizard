"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Safety check: Ensure required tables exist
    const tables = await queryInterface.showAllTables();
    if (
      !tables.includes("evaluations") ||
      !tables.includes("evaluation_scenarios")
    ) {
      return;
    }

    await queryInterface.sequelize.query(`
      INSERT INTO evaluation_scenarios (
        evaluation_id,
        name,
        has_income_approach,
        has_sales_approach,
        has_cost_approach,
        weighted_market_value,
        rounding,
        has_lease_approach,
        has_cap_approach,
        has_multi_family_approach,
        created,
        last_updated
      )
      SELECT
        e.id,
        'primary',
        e.has_income_approach,
        e.has_sales_approach,
        e.has_cost_approach,
        e.weighted_market_value,
        e.rounding,
        e.has_lease_comps,
        e.has_cap_comps,
        e.has_multi_family,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      FROM evaluations e
      WHERE NOT EXISTS (
        SELECT 1 FROM evaluation_scenarios es
        WHERE es.evaluation_id = e.id AND es.name = 'primary'
      );
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Safety check: Ensure required tables exist
    const tables = await queryInterface.showAllTables();
    if (
      !tables.includes("evaluations") ||
      !tables.includes("evaluation_scenarios")
    ) {
      return;
    }

    await queryInterface.sequelize.query(`
      DELETE FROM evaluation_scenarios
      WHERE evaluation_id IN (SELECT id FROM evaluations)
        AND name = 'primary'
    `);
  },
};
