"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove orphan comps data from zoning
    // Only run if tables exist (for fresh installations, skip this cleanup)
    const tables = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '${queryInterface.sequelize.config.database}'`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const tableNames = tables.map((t) => t.TABLE_NAME);

    const queries = [];
    
    if (tableNames.includes('zoning') && tableNames.includes('comps')) {
      queries.push(
        queryInterface.sequelize.query(
          `DELETE FROM zoning WHERE comp_id NOT IN (SELECT id FROM comps);`
        )
      );
    }
    
    if (tableNames.includes('property_units') && tableNames.includes('comps')) {
      queries.push(
        queryInterface.sequelize.query(
          `DELETE FROM property_units WHERE comp_id NOT IN (SELECT id FROM comps);`
        )
      );
    }
    
    if (tableNames.includes('users_transactions') && tableNames.includes('users')) {
      queries.push(
        queryInterface.sequelize.query(
          `DELETE FROM users_transactions WHERE user_id NOT IN (SELECT id FROM users);`
        )
      );
    }
    
    if (tableNames.includes('eval_sales_approach_comps') && tableNames.includes('comps')) {
      queries.push(
        queryInterface.sequelize.query(
          `DELETE FROM eval_sales_approach_comps WHERE comp_id NOT IN (SELECT id FROM comps);`
        )
      );
    }
    
    if (tableNames.includes('eval_cap_approach_comps') && tableNames.includes('comps')) {
      queries.push(
        queryInterface.sequelize.query(
          `DELETE FROM eval_cap_approach_comps WHERE comp_id NOT IN (SELECT id FROM comps);`
        )
      );
    }
    
    if (tableNames.includes('eval_lease_approach_comps') && tableNames.includes('comps')) {
      queries.push(
        queryInterface.sequelize.query(
          `DELETE FROM eval_lease_approach_comps WHERE comp_id NOT IN (SELECT id FROM comps);`
        )
      );
    }
    
    if (tableNames.includes('eval_cost_approach_comps') && tableNames.includes('comps')) {
      queries.push(
        queryInterface.sequelize.query(
          `DELETE FROM eval_cost_approach_comps WHERE comp_id NOT IN (SELECT id FROM comps);`
        )
      );
    }
    
    if (tableNames.includes('res_zoning') && tableNames.includes('res_comps')) {
      queries.push(
        queryInterface.sequelize.query(
          `DELETE FROM res_zoning WHERE res_comp_id NOT IN (SELECT id FROM res_comps);`
        )
      );
    }
    
    if (tableNames.includes('users') && tableNames.includes('accounts')) {
      queries.push(
        queryInterface.sequelize.query(
          `DELETE FROM users WHERE account_id NOT IN (SELECT id FROM accounts);`
        )
      );
    }
    
    if (tableNames.includes('account_optin') && tableNames.includes('accounts')) {
      queries.push(
        queryInterface.sequelize.query(
          `DELETE FROM account_optin WHERE account_id NOT IN (SELECT id FROM accounts);`
        )
      );
    }

    if (queries.length > 0) {
      await Promise.all(queries);
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
