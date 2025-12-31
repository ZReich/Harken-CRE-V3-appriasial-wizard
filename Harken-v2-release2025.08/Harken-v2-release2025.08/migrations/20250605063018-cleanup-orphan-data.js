"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Delete res_evaluations where client_id is not valid
    await queryInterface.sequelize.query(`
      DELETE FROM res_evaluations
      WHERE client_id IS NOT NULL
        AND client_id NOT IN (SELECT id FROM clients);
    `);

    // 2. Delete from res_zoning where res_evaluation_id is orphaned
    await queryInterface.sequelize.query(`
      DELETE FROM res_zoning
      WHERE res_evaluation_id IS NOT NULL
        AND res_evaluation_id NOT IN (SELECT id FROM res_evaluations);
    `);

    // 3. Delete from res_evaluations_metadata where res_evaluation_id is orphaned
    await queryInterface.sequelize.query(`
      DELETE FROM res_evaluations_metadata
      WHERE res_evaluation_id IS NOT NULL
        AND res_evaluation_id NOT IN (SELECT id FROM res_evaluations);
    `);

    // 4. Delete from eval_cost_approach_improvements where zoning_id is orphaned
    await queryInterface.sequelize.query(`
      DELETE FROM eval_cost_approach_improvements
      WHERE zoning_id IS NOT NULL
        AND zoning_id NOT IN (SELECT id FROM zoning);
    `);

    // Change zoning_id to allow NULL first
    await queryInterface.changeColumn(
      "eval_income_approach_source",
      "zoning_id",
      {
        type: Sequelize.INTEGER(11),
        allowNull: true,
      }
    );

    // 5. Set zoning_id = NULL where it is 0 in eval_income_approach_source
    await queryInterface.sequelize.query(`
      UPDATE eval_income_approach_source
      SET zoning_id = NULL
      WHERE zoning_id = 0;
    `);

    // 6. Delete from eval_income_approach_source where zoning_id is orphaned
    await queryInterface.sequelize.query(`
      DELETE FROM eval_income_approach_source
      WHERE zoning_id IS NOT NULL
        AND zoning_id NOT IN (SELECT id FROM zoning);
    `);

    // 7. Delete from res_eval_cost_approach_comps where res_cost_approach_id is orphaned
    await queryInterface.sequelize.query(`
      DELETE FROM res_eval_cost_approach_comps
      WHERE res_evaluation_cost_approach_id IS NOT NULL
        AND res_evaluation_cost_approach_id NOT IN (
          SELECT id FROM res_evaluation_cost_approaches
        );
    `);

    await queryInterface.sequelize.query(`
      DELETE FROM zoning
      WHERE evaluation_id IS NOT NULL
        AND evaluation_id NOT IN (SELECT id FROM evaluations)
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // This cleanup migration is irreversible (data is deleted),
    // so the down method will be left empty or log a warning.
    console.warn(
      "Skipping down migration for cleanup-orphan-data: irreversible operation."
    );
  },
};
