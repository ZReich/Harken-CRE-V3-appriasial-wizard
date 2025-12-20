"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = "evaluations_metadata";
    const column = "name";

    // Helper to check if the column exists
    async function columnExists(tableName, columnName) {
      const tableDesc = await queryInterface
        .describeTable(tableName)
        .catch(() => null);
      return tableDesc && tableDesc[columnName];
    }

    const replacements = [
      { from: "city-info", to: "city_info" },
      { from: "county-info", to: "county_info" },
      {
        from: "property-summary-sales-arrow",
        to: "property_summary_sales_arrow",
      },
      {
        from: "property-summary-vacancy-arrow",
        to: "property_summary_vacancy_arrow",
      },
      {
        from: "property-summary-net-absorption-arrow",
        to: "property_summary_net_absorption_arrow",
      },
      {
        from: "property-summary-construction-arrow",
        to: "property_summary_construction_arrow",
      },
      {
        from: "property-summary-lease-rates-arrow",
        to: "property_summary_lease_rates_arrow",
      },
    ];

    if (await columnExists(table, column)) {
      for (const { from, to } of replacements) {
        await queryInterface.sequelize.query(
          `
          UPDATE ${table}
          SET ${column} = :to
          WHERE ${column} = :from
        `,
          {
            replacements: { from, to },
          }
        );
      }
    } else {
      console.warn(
        `Skipping: Column '${column}' not found in table '${table}'.`
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = "evaluations_metadata";
    const column = "name";

    async function columnExists(tableName, columnName) {
      const tableDesc = await queryInterface
        .describeTable(tableName)
        .catch(() => null);
      return tableDesc && tableDesc[columnName];
    }

    const replacements = [
      { to: "city-info", from: "city_info" },
      { to: "county-info", from: "county_info" },
      {
        to: "property-summary-sales-arrow",
        from: "property_summary_sales_arrow",
      },
      {
        to: "property-summary-vacancy-arrow",
        from: "property_summary_vacancy_arrow",
      },
      {
        to: "property-summary-net-absorption-arrow",
        from: "property_summary_net_absorption_arrow",
      },
      {
        to: "property-summary-construction-arrow",
        from: "property_summary_construction_arrow",
      },
      {
        to: "property-summary-lease-rates-arrow",
        from: "property_summary_lease_rates_arrow",
      },
    ];

    if (await columnExists(table, column)) {
      for (const { from, to } of replacements) {
        await queryInterface.sequelize.query(
          `
          UPDATE ${table}
          SET ${column} = :to
          WHERE ${column} = :from
        `,
          {
            replacements: { from, to },
          }
        );
      }
    } else {
      console.warn(
        `Skipping revert: Column '${column}' not found in table '${table}'.`
      );
    }
  },
};
