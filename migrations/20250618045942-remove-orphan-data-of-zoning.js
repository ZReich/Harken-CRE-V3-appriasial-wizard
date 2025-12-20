"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Helper: check if table exists
    async function tableExists(tableName) {
      try {
        await queryInterface.describeTable(tableName);
        return true;
      } catch {
        console.warn(`Skipping: Table '${tableName}' does not exist.`);
        return false;
      }
    }

    // zoning.comp_id vs comps.id
    if ((await tableExists("zoning")) && (await tableExists("comps"))) {
      await queryInterface.sequelize.query(`
        DELETE FROM zoning
        WHERE comp_id IS NOT NULL
          AND comp_id NOT IN (SELECT id FROM comps)
      `);
    }

    // zoning.listing_id vs listings.id
    if ((await tableExists("zoning")) && (await tableExists("listings"))) {
      await queryInterface.sequelize.query(`
        DELETE FROM zoning
        WHERE listing_id IS NOT NULL
          AND listing_id NOT IN (SELECT id FROM listings)
      `);
    }

    // Optional: Uncomment if needed
    // if (await tableExists("zoning") && await tableExists("appraisals")) {
    //   await queryInterface.sequelize.query(`
    //     DELETE FROM zoning
    //     WHERE appraisal_id IS NOT NULL
    //       AND appraisal_id NOT IN (SELECT id FROM appraisals)
    //   `);
    // }

    // res_zoning.res_comp_id vs res_comps.id
    if ((await tableExists("res_zoning")) && (await tableExists("res_comps"))) {
      await queryInterface.sequelize.query(`
        DELETE FROM res_zoning
        WHERE res_comp_id IS NOT NULL
          AND res_comp_id NOT IN (SELECT id FROM res_comps)
      `);
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.warn(
      "Skipping down migration for cleanup-orphan-data: irreversible operation."
    );
  },
};
