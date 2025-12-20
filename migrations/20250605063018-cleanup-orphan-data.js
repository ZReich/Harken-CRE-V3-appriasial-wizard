"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get list of existing tables
    const allTables = await queryInterface.showAllTables();
    const tableNames = allTables.map((t) => t.toLowerCase());

    // 1. Delete res_evaluations where client_id is not valid
    if (tableNames.includes('res_evaluations') && tableNames.includes('clients')) {
      try {
        await queryInterface.sequelize.query(`
          DELETE FROM res_evaluations
          WHERE client_id IS NOT NULL
            AND client_id NOT IN (SELECT id FROM clients);
        `);
      } catch (e) {
        // Ignore errors if tables don't exist or query fails
      }
    }

    // 2. Delete from res_zoning where res_evaluation_id is orphaned
    if (tableNames.includes('res_zoning') && tableNames.includes('res_evaluations')) {
      try {
        await queryInterface.sequelize.query(`
          DELETE FROM res_zoning
          WHERE res_evaluation_id IS NOT NULL
            AND res_evaluation_id NOT IN (SELECT id FROM res_evaluations);
        `);
      } catch (e) {
        // Ignore errors
      }
    }

    // 3. Delete from res_evaluations_metadata where res_evaluation_id is orphaned
    if (tableNames.includes('res_evaluations_metadata') && tableNames.includes('res_evaluations')) {
      try {
        await queryInterface.sequelize.query(`
          DELETE FROM res_evaluations_metadata
          WHERE res_evaluation_id IS NOT NULL
            AND res_evaluation_id NOT IN (SELECT id FROM res_evaluations);
        `);
      } catch (e) {
        // Ignore errors
      }
    }

    // 4. Delete from eval_cost_approach_improvements where zoning_id is orphaned
    if (tableNames.includes('eval_cost_approach_improvements') && tableNames.includes('zoning')) {
      try {
        await queryInterface.sequelize.query(`
          DELETE FROM eval_cost_approach_improvements
          WHERE zoning_id IS NOT NULL
            AND zoning_id NOT IN (SELECT id FROM zoning);
        `);
      } catch (e) {
        // Ignore errors
      }
    }

    // Change zoning_id to allow NULL first
    if (tableNames.includes('eval_income_approach_source')) {
      try {
        await queryInterface.changeColumn(
          "eval_income_approach_source",
          "zoning_id",
          {
            type: Sequelize.INTEGER(11),
            allowNull: true,
          }
        );
      } catch (e) {
        // Ignore errors
      }
    }

    // 5. Set zoning_id = NULL where it is 0 in eval_income_approach_source
    if (tableNames.includes('eval_income_approach_source')) {
      try {
        await queryInterface.sequelize.query(`
          UPDATE eval_income_approach_source
          SET zoning_id = NULL
          WHERE zoning_id = 0;
        `);
      } catch (e) {
        // Ignore errors
      }
    }

    // 6. Delete from eval_income_approach_source where zoning_id is orphaned
    if (tableNames.includes('eval_income_approach_source') && tableNames.includes('zoning')) {
      try {
        await queryInterface.sequelize.query(`
          DELETE FROM eval_income_approach_source
          WHERE zoning_id IS NOT NULL
            AND zoning_id NOT IN (SELECT id FROM zoning);
        `);
      } catch (e) {
        // Ignore errors
      }
    }

    // 7. Delete from res_eval_cost_approach_comps where res_cost_approach_id is orphaned
    if (tableNames.includes('res_eval_cost_approach_comps') && tableNames.includes('res_evaluation_cost_approaches')) {
      try {
        await queryInterface.sequelize.query(`
          DELETE FROM res_eval_cost_approach_comps
          WHERE res_evaluation_cost_approach_id IS NOT NULL
            AND res_evaluation_cost_approach_id NOT IN (
              SELECT id FROM res_evaluation_cost_approaches
            );
        `);
      } catch (e) {
        // Ignore errors
      }
    }

    // 8. Delete from zoning where evaluation_id is orphaned
    if (tableNames.includes('zoning') && tableNames.includes('evaluations')) {
      try {
        await queryInterface.sequelize.query(`
          DELETE FROM zoning
          WHERE evaluation_id IS NOT NULL
            AND evaluation_id NOT IN (SELECT id FROM evaluations)
        `);
      } catch (e) {
        // Ignore errors
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // This cleanup migration is irreversible (data is deleted),
    // so the down method will be left empty or log a warning.
    console.warn(
      "Skipping down migration for cleanup-orphan-data: irreversible operation."
    );
  },
};
