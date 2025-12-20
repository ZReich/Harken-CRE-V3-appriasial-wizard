"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = [
      {
        name: "res_evaluation_sales_approaches",
        constraint: "fk_res_sales_approach_to_eval",
      },
      {
        name: "res_evaluation_cost_approaches",
        constraint: "fk_res_cost_approach_to_eval",
      },
      {
        name: "res_evaluation_income_approaches",
        constraint: "fk_res_income_approach_to_eval",
      },
    ];

    const allTables = await queryInterface.showAllTables();

    for (const { name, constraint } of tables) {
      if (!allTables.includes(name)) {
        console.log(`Table '${name}' does not exist, skipping...`);
        continue;
      }

      // 1. Try removing the existing constraint (if it exists)
      try {
        await queryInterface.removeConstraint(name, constraint);
      } catch (e) {
        console.log(
          `No existing constraint '${constraint}' on ${name}, skipping...`
        );
      }

      // 2. Try removing the column (if it exists)
      try {
        await queryInterface.removeColumn(name, "res_evaluation_scenario_id");
      } catch (e) {
        console.log(
          `Column 'res_evaluation_scenario_id' not found in ${name}, skipping removal...`
        );
      }

      // 3. Add the column back
      await queryInterface.addColumn(name, "res_evaluation_scenario_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });

      // 4. Add foreign key constraint
      await queryInterface.addConstraint(name, {
        fields: ["res_evaluation_scenario_id"],
        type: "foreign key",
        name: constraint,
        references: {
          table: "res_evaluation_scenarios",
          field: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tables = [
      {
        name: "res_evaluation_sales_approaches",
        constraint: "fk_res_sales_approach_to_eval",
      },
      {
        name: "res_evaluation_cost_approaches",
        constraint: "fk_res_cost_approach_to_eval",
      },
      {
        name: "res_evaluation_income_approaches",
        constraint: "fk_res_income_approach_to_eval",
      },
    ];

    const allTables = await queryInterface.showAllTables();

    for (const { name, constraint } of tables) {
      if (!allTables.includes(name)) {
        console.log(`Table '${name}' does not exist, skipping...`);
        continue;
      }

      try {
        await queryInterface.removeConstraint(name, constraint);
      } catch (e) {
        console.log(
          `Constraint '${constraint}' not found on ${name}, skipping...`
        );
      }

      try {
        await queryInterface.removeColumn(name, "res_evaluation_scenario_id");
      } catch (e) {
        console.log(
          `Column 'res_evaluation_scenario_id' not found in ${name}, skipping removal...`
        );
      }
    }
  },
};
