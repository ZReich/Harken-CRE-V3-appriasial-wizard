"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Safety check: Ensure required tables and columns exist
    const tables = await queryInterface.showAllTables();
    if (
      !tables.includes("evaluations") ||
      !tables.includes("evaluation_income_approaches")
    ) {
      console.log("Required tables do not exist, skipping migration.");
      return;
    }

    // Check columns in evaluation_income_approaches
    const incomeApproachDesc = await queryInterface.describeTable(
      "evaluation_income_approaches"
    );
    if (
      !incomeApproachDesc["indicated_range_sq_feet"] ||
      !incomeApproachDesc["indicated_range_unit"] ||
      !incomeApproachDesc["indicated_range_bed"]
    ) {
      console.log(
        "Required columns do not exist in evaluation_income_approaches, skipping migration."
      );
      return;
    }

    const [evaluations] = await queryInterface.sequelize.query(
      `SELECT id, comparison_basis FROM evaluations`
    );

    for (const evaluation of evaluations) {
      // Skip if comparison_basis is 'SF'
      if (evaluation.comparison_basis === "SF") continue;

      const [incomeApproach] = await queryInterface.sequelize.query(
        `SELECT id, indicated_range_unit, indicated_range_bed FROM evaluation_income_approaches WHERE evaluation_id = ${evaluation.id}`
      );

      if (!incomeApproach.length) continue;

      const income = incomeApproach[0];
      let indicatedRange = null;

      if (evaluation.comparison_basis === "Unit") {
        indicatedRange = income.indicated_range_unit;
      } else if (evaluation.comparison_basis === "Bed") {
        indicatedRange = income.indicated_range_bed;
      }

      // Only update if a value is found
      if (indicatedRange !== null && indicatedRange !== undefined) {
        await queryInterface.sequelize.query(
          `UPDATE evaluation_income_approaches SET indicated_range_sq_feet = :indicatedRange WHERE id = :id`,
          {
            replacements: {
              indicatedRange,
              id: income.id,
            },
          }
        );
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Safety check: Ensure required tables and columns exist
    const tables = await queryInterface.showAllTables();
    if (
      !tables.includes("evaluations") ||
      !tables.includes("evaluation_income_approaches")
    ) {
      console.log("Required tables do not exist, skipping migration.");
      return;
    }

    const incomeApproachDesc = await queryInterface.describeTable(
      "evaluation_income_approaches"
    );
    if (!incomeApproachDesc["indicated_range_sq_feet"]) {
      console.log(
        "Column indicated_range_sq_feet does not exist, skipping migration."
      );
      return;
    }

    // Only nullify where comparison_basis is not 'SF'
    const [evaluations] = await queryInterface.sequelize.query(
      `SELECT id, comparison_basis FROM evaluations`
    );

    for (const evaluation of evaluations) {
      if (evaluation.comparison_basis === "SF") continue;

      const [incomeApproach] = await queryInterface.sequelize.query(
        `SELECT id FROM evaluation_income_approaches WHERE evaluation_id = ${evaluation.id}`
      );

      if (!incomeApproach.length) continue;

      const income = incomeApproach[0];

      await queryInterface.sequelize.query(
        `UPDATE evaluation_income_approaches SET indicated_range_sq_feet = NULL WHERE id = :id`,
        {
          replacements: { id: income.id },
        }
      );
    }
  },
};
