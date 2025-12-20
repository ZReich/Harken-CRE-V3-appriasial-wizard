"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if section_item table exists before running the query
    const sectionItemExists = await queryInterface.sequelize.query(
      "SHOW TABLES LIKE 'section_item'"
    );
    if (sectionItemExists[0].length > 0) {
      await queryInterface.sequelize.query(`
        DELETE FROM section_item
          WHERE appraisal_approach_id IS NOT NULL
          AND appraisal_approach_id NOT IN (SELECT id FROM appraisal_approaches);
      `);
    }

    // Check if template table exists before running the query
    const templateExists = await queryInterface.sequelize.query(
      "SHOW TABLES LIKE 'template'"
    );
    if (templateExists[0].length > 0) {
      await queryInterface.sequelize.query(`
        DELETE FROM template
          WHERE appraisal_id IS NOT NULL
          AND appraisal_id NOT IN (SELECT id FROM appraisals);
      `);
    }

    // Check if zoning table exists before running the query
    // const zoningExists = await queryInterface.sequelize.query(
    //   "SHOW TABLES LIKE 'zoning'"
    // );
    // if (zoningExists[0].length > 0) {
    //   await queryInterface.sequelize.query(`
    //     DELETE FROM zoning
    //       WHERE appraisal_id IS NOT NULL
    //       AND appraisal_id NOT IN (SELECT id FROM appraisals);
    //   `);
    // }
  },

  async down(queryInterface, Sequelize) {
    // This cleanup migration is irreversible (data is deleted),
    // so the down method will be left empty or log a warning.
    console.warn(
      "Skipping down migration for cleanup-orphan-data: irreversible operation."
    );
  },
};
