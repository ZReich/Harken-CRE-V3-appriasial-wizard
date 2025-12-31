"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove orphan comps data from zoning
    await Promise.all([
      queryInterface.sequelize.query(
        `DELETE FROM zoning WHERE comp_id NOT IN (SELECT id FROM comps);`
      ),
      queryInterface.sequelize.query(
        `DELETE FROM property_units WHERE comp_id NOT IN (SELECT id FROM comps);`
      ),
      queryInterface.sequelize.query(
        `DELETE FROM users_transactions WHERE user_id NOT IN (SELECT id FROM users);`
      ),
      queryInterface.sequelize.query(
        `DELETE FROM eval_sales_approach_comps WHERE comp_id NOT IN (SELECT id FROM comps);`
      ),
      queryInterface.sequelize.query(
        `DELETE FROM eval_cap_approach_comps WHERE comp_id NOT IN (SELECT id FROM comps);`
      ),
      queryInterface.sequelize.query(
        `DELETE FROM eval_lease_approach_comps WHERE comp_id NOT IN (SELECT id FROM comps);`
      ),
      queryInterface.sequelize.query(
        `DELETE FROM eval_cost_approach_comps WHERE comp_id NOT IN (SELECT id FROM comps);`
      ),
      queryInterface.sequelize.query(
        `DELETE FROM res_zoning WHERE res_comp_id NOT IN (SELECT id FROM res_comps);`
      ),
      queryInterface.sequelize.query(
        `DELETE FROM users WHERE account_id NOT IN (SELECT id FROM accounts);`
      ),
      queryInterface.sequelize.query(
        `DELETE FROM users_transactions WHERE user_id NOT IN (SELECT id FROM users);`
      ),
      queryInterface.sequelize.query(
        `DELETE FROM account_optin WHERE account_id NOT IN (SELECT id FROM accounts);`
      ),
    ]);
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
