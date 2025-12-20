"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Change the 'sales_approach_indicated_val' field in the 'appraisal_sales_approaches' table to DOUBLE
    // Helper function to check if a table and column exist
    async function columnExists(tableName, columnName) {
      const tableDesc = await queryInterface.describeTable(tableName).catch(() => null);
      return tableDesc && tableDesc[columnName];
    }

    if (await columnExists("appraisal_sales_approaches", "sales_approach_indicated_val")) {
      await queryInterface.changeColumn(
      "appraisal_sales_approaches",
      "sales_approach_indicated_val",
      {
        type: Sequelize.DOUBLE,
      }
      );
    }

    if (await columnExists("appraisal_sales_approach_comps", "adjustment_note")) {
      await queryInterface.changeColumn(
      "appraisal_sales_approach_comps",
      "adjustment_note",
      {
        type: Sequelize.TEXT,
      }
      );
    }

    if (await columnExists("appraisal_lease_approach_comps", "adjustment_note")) {
      await queryInterface.changeColumn(
      "appraisal_lease_approach_comps",
      "adjustment_note",
      {
        type: Sequelize.TEXT,
      }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // Revert the 'sales_approach_indicated_val' field back to its original data type
    await queryInterface.changeColumn(
      "appraisal_sales_approaches",
      "sales_approach_indicated_val",
      {
        type: Sequelize.INTEGER(11), // Set this to the previous data type
      }
    );
  },
};
