"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = [
      {
        name: "evaluation_sales_approaches",
        constraint: "fk_sales_approach_to_eval",
      },
      {
        name: "evaluation_cost_approaches",
        constraint: "fk_cost_approach_to_eval",
      },
      {
        name: "evaluation_lease_approaches",
        constraint: "fk_lease_approach_to_eval",
      },
      {
        name: "evaluation_income_approaches",
        constraint: "fk_income_approach_to_eval",
      },
      {
        name: "evaluation_cap_approaches",
        constraint: "fk_cap_approach_to_eval",
      },
      {
        name: "evaluation_multi_family_approaches",
        constraint: "fk_multi_family_approach_to_eval",
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
        await queryInterface.removeColumn(name, "evaluation_scenario_id");
      } catch (e) {
        console.log(
          `Column 'evaluation_scenario_id' not found in ${name}, skipping removal...`
        );
      }

      // 3. Add the column back
      await queryInterface.addColumn(name, "evaluation_scenario_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });

      // 4. Add foreign key constraint
      await queryInterface.addConstraint(name, {
        fields: ["evaluation_scenario_id"],
        type: "foreign key",
        name: constraint,
        references: {
          table: "evaluation_scenarios",
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
        name: "evaluation_sales_approaches",
        constraint: "fk_sales_approach_to_eval",
      },
      {
        name: "evaluation_cost_approaches",
        constraint: "fk_cost_approach_to_eval",
      },
      {
        name: "evaluation_lease_approaches",
        constraint: "fk_lease_approach_to_eval",
      },
      {
        name: "evaluation_income_approaches",
        constraint: "fk_income_approach_to_eval",
      },
      {
        name: "evaluation_cap_approaches",
        constraint: "fk_cap_approach_to_eval",
      },
      {
        name: "evaluation_multi_family_approaches",
        constraint: "fk_multi_family_approach_to_eval",
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
        await queryInterface.removeColumn(name, "evaluation_scenario_id");
      } catch (e) {
        console.log(
          `Column 'evaluation_scenario_id' not found in ${name}, skipping removal...`
        );
      }
    }
  },
};
