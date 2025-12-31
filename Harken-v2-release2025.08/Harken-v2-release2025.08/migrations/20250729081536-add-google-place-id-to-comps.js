'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("comps", "google_place_id", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("res_comps", "google_place_id", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("comps", "google_place_id");
    await queryInterface.removeColumn("res_comps", "google_place_id");
  },
};
