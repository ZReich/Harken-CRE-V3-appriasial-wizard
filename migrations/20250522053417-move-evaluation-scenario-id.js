"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = [
      "evaluation_sales_approaches",
      "evaluation_cost_approaches",
      "evaluation_income_approaches",
      "evaluation_lease_approaches",
      "evaluation_cap_approaches",
      "evaluation_multi_family_approaches",
    ];

    const allTables = await queryInterface.showAllTables();

    if (allTables.includes("evaluation_sales_approaches")) {
      await queryInterface.sequelize.query(`
        ALTER TABLE evaluation_sales_approaches
        MODIFY COLUMN evaluation_scenario_id INT AFTER evaluation_id;
      `);
    }
    if (allTables.includes("evaluation_cost_approaches")) {
      await queryInterface.sequelize.query(`
        ALTER TABLE evaluation_cost_approaches
        MODIFY COLUMN evaluation_scenario_id INT AFTER evaluation_id;
      `);
    }
    if (allTables.includes("evaluation_income_approaches")) {
      await queryInterface.sequelize.query(`
        ALTER TABLE evaluation_income_approaches
        MODIFY COLUMN evaluation_scenario_id INT AFTER evaluation_id;
      `);
    }
    if (allTables.includes("evaluation_lease_approaches")) {
      await queryInterface.sequelize.query(`
        ALTER TABLE evaluation_lease_approaches
        MODIFY COLUMN evaluation_scenario_id INT AFTER evaluation_id;
      `);
    }
    if (allTables.includes("evaluation_cap_approaches")) {
      await queryInterface.sequelize.query(`
        ALTER TABLE evaluation_cap_approaches
        MODIFY COLUMN evaluation_scenario_id INT AFTER evaluation_id;
      `);
    }
    if (allTables.includes("evaluation_multi_family_approaches")) {
      await queryInterface.sequelize.query(`
        ALTER TABLE evaluation_multi_family_approaches
        MODIFY COLUMN evaluation_scenario_id INT AFTER evaluation_id;
      `);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const allTables = await queryInterface.showAllTables();

    if (allTables.includes("evaluation_sales_approaches")) {
      await queryInterface.sequelize.query(`
        ALTER TABLE evaluation_sales_approaches
        MODIFY COLUMN evaluation_scenario_id INT AFTER map_center_lng;
      `);
    }
    if (allTables.includes("evaluation_cost_approaches")) {
      await queryInterface.sequelize.query(`
        ALTER TABLE evaluation_cost_approaches
        MODIFY COLUMN evaluation_scenario_id INT AFTER map_center_lng;
      `);
    }
    if (allTables.includes("evaluation_income_approaches")) {
      await queryInterface.sequelize.query(`
        ALTER TABLE evaluation_income_approaches
        MODIFY COLUMN evaluation_scenario_id INT AFTER other_total_sq_ft;
      `);
    }
    if (allTables.includes("evaluation_lease_approaches")) {
      await queryInterface.sequelize.query(`
        ALTER TABLE evaluation_lease_approaches
        MODIFY COLUMN evaluation_scenario_id INT AFTER high_adjusted_comp_range;
      `);
    }
    if (allTables.includes("evaluation_cap_approaches")) {
      await queryInterface.sequelize.query(`
        ALTER TABLE evaluation_cap_approaches
        MODIFY COLUMN evaluation_scenario_id INT AFTER high_adjusted_comp_range;
      `);
    }
    if (allTables.includes("evaluation_multi_family_approaches")) {
      await queryInterface.sequelize.query(`
        ALTER TABLE evaluation_multi_family_approaches
        MODIFY COLUMN evaluation_scenario_id INT AFTER subject_property_adjustments;
      `);
    }
  },
};
