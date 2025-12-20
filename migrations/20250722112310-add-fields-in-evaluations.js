"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add reviewed_by column if not exists
    const tableDesc = await queryInterface.describeTable("evaluations");
    if (!tableDesc.reviewed_by) {
      await queryInterface.addColumn("evaluations", "reviewed_by", {
        type: Sequelize.INTEGER(11),
        allowNull: true,
        defaultValue: null,
      });
    }

    // Add review_date column if not exists
    if (!tableDesc.review_date) {
      await queryInterface.addColumn("evaluations", "review_date", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove reviewed_by column if exists
    const tableDesc = await queryInterface.describeTable("evaluations");
    if (tableDesc.reviewed_by) {
      await queryInterface.removeColumn("evaluations", "reviewed_by");
    }
    // Remove review_date column if exists
    if (tableDesc.review_date) {
      await queryInterface.removeColumn("evaluations", "review_date");
    }
  },
};
