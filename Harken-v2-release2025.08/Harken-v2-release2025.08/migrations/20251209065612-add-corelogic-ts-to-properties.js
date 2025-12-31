'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('properties');

    // Add column only if it does NOT exist
    if (!tableInfo.corelogic_ts) {
      await queryInterface.addColumn('properties', 'corelogic_ts', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('properties');

    // Remove column only if it exists
    if (tableInfo.corelogic_ts) {
      await queryInterface.removeColumn('properties', 'corelogic_ts');
    }
  },
};
