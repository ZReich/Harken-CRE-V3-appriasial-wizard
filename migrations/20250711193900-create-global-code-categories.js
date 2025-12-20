"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Only create the table if it does not exist
    const tableExists = await queryInterface.sequelize.query(
      "SHOW TABLES LIKE 'global_code_categories'"
    );
    if (tableExists[0].length === 0) {
      await queryInterface.createTable("global_code_categories", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        type: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        label: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        status: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        created: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        last_updated: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("global_code_categories");
  },
};
