"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const metaToTableColumnMap = {
      "sales-approach-notes": {
        table: "res_evaluation_sales_approaches",
        column: "notes",
        columnType: Sequelize.TEXT,
      },
      "income-approach-income-notes": {
        table: "res_evaluation_income_approaches",
        column: "income_notes",
        columnType: Sequelize.TEXT,
      },
      "income-approach-expense-notes": {
        table: "res_evaluation_income_approaches",
        column: "expense_notes",
        columnType: Sequelize.TEXT,
      },
      "cost-approach-notes": {
        table: "res_evaluation_cost_approaches",
        column: "notes",
        columnType: Sequelize.TEXT,
      },
    };

    // === Step 1: Ensure all columns exist ===
    const allTables = await queryInterface.showAllTables();
    for (const { table, column, columnType } of Object.values(
      metaToTableColumnMap
    )) {
      if (!allTables.includes(table)) continue;
      const tableDescription = await queryInterface.describeTable(table);
      if (!tableDescription[column]) {
        console.log(`Adding column '${column}' to table '${table}'`);
        await queryInterface.addColumn(table, column, {
          type: columnType,
          allowNull: true,
        });
      }
    }

    // === Step 2: Populate missing values from metadata ===
    for (const [metaKey, { table, column }] of Object.entries(
      metaToTableColumnMap
    )) {
      if (!allTables.includes(table)) continue;
      const [metaRows] = await queryInterface.sequelize.query(`
        SELECT res_evaluation_id, value
        FROM res_evaluations_metadata
        WHERE name = ${queryInterface.sequelize.escape(metaKey)}
      `);

      for (const { res_evaluation_id, value } of metaRows) {
        const [existing] = await queryInterface.sequelize.query(`
          SELECT \`${column}\`
          FROM \`${table}\`
          WHERE res_evaluation_id = ${res_evaluation_id}
        `);

        if (
          existing.length === 0 ||
          existing[0][column] === null ||
          existing[0][column] === ""
        ) {
          await queryInterface.sequelize.query(`
            UPDATE \`${table}\`
            SET \`${column}\` = ${queryInterface.sequelize.escape(value)}
            WHERE res_evaluation_id = ${res_evaluation_id}
          `);
        }
      }
    }
  },

  down: async () => {
    // No rollback for data migration
  },
};
