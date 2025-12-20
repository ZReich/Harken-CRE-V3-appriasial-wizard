"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const metaToTableColumnMap = {
      "sales-approach-notes": {
        table: "evaluation_sales_approaches",
        column: "note",
        columnType: Sequelize.TEXT,
      },
      "multi-family-approach-notes": {
        table: "evaluation_multi_family_approaches",
        column: "notes",
        columnType: Sequelize.TEXT,
      },
      "lease-comps-notes": {
        table: "evaluation_lease_approaches",
        column: "lease_comps_notes",
        columnType: Sequelize.TEXT,
      },
      "income-approach-income-notes": {
        table: "evaluation_income_approaches",
        column: "income_notes",
        columnType: Sequelize.TEXT,
      },
      "income-approach-expense-notes": {
        table: "evaluation_income_approaches",
        column: "expense_notes",
        columnType: Sequelize.TEXT,
      },
      "income-approach-cap-rate-notes": {
        table: "evaluation_income_approaches",
        column: "cap_rate_notes",
        columnType: Sequelize.TEXT,
      },
      "cost-approach-notes": {
        table: "evaluation_cost_approaches",
        column: "notes",
        columnType: Sequelize.TEXT,
      },
      "cap_rates-comps-notes": {
        table: "evaluation_cap_approaches",
        column: "notes",
        columnType: Sequelize.TEXT,
      },
    };

    // Helper: Check if column exists
    async function columnExists(table, column) {
      const tableDesc = await queryInterface
        .describeTable(table)
        .catch(() => null);
      return tableDesc && tableDesc[column];
    }

    // === Phase 1: Add missing columns ===
    for (const { table, column, columnType } of Object.values(
      metaToTableColumnMap
    )) {
      const tableDesc = await queryInterface
        .describeTable(table)
        .catch(() => null);
      if (tableDesc && !tableDesc[column]) {
        console.log(`Adding column '${column}' to '${table}'`);
        await queryInterface.addColumn(table, column, {
          type: columnType,
          allowNull: true,
        });
      } else if (!tableDesc) {
        console.warn(
          `Skipping column '${column}' addition: table '${table}' does not exist.`
        );
      }
    }

    // === Phase 2: Copy metadata values ===
    for (const [metaKey, { table, column }] of Object.entries(
      metaToTableColumnMap
    )) {
      const tableDesc = await queryInterface
        .describeTable(table)
        .catch(() => null);
      if (!tableDesc || !tableDesc[column]) {
        console.warn(
          `Skipping data update: column '${column}' not found in table '${table}'.`
        );
        continue;
      }

      const [metaRows] = await queryInterface.sequelize.query(`
        SELECT evaluation_id, value
        FROM evaluations_metadata
        WHERE name = ${queryInterface.sequelize.escape(metaKey)}
      `);

      for (const { evaluation_id, value } of metaRows) {
        const [existing] = await queryInterface.sequelize.query(`
          SELECT \`${column}\`
          FROM \`${table}\`
          WHERE evaluation_id = ${evaluation_id}
        `);

        if (
          existing.length === 0 ||
          existing[0][column] === null ||
          existing[0][column] === ""
        ) {
          await queryInterface.sequelize.query(`
            UPDATE \`${table}\`
            SET \`${column}\` = ${queryInterface.sequelize.escape(value)}
            WHERE evaluation_id = ${evaluation_id}
          `);
        }
      }
    }
  },

  down: async () => {
    console.warn("Down migration skipped — no column removal defined.");
  },
};
