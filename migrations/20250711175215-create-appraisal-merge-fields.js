"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("appraisal_merge_fields"));

    if (!tableExists) {
      await queryInterface.createTable("appraisal_merge_fields", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        key: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        tag: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        field: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        type: {
          type: Sequelize.STRING(100),
          allowNull: true,
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
    await queryInterface.dropTable("appraisal_merge_fields");
  },
};
