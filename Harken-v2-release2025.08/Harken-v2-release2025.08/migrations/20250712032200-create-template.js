"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("template"));

    if (!tableExists) {
      await queryInterface.createTable("template", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        account_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "accounts",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        parent_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        appraisal_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "appraisals",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        date_created: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        last_updated: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
          ),
        },
      });

      // Add indexes
      await queryInterface.addIndex("template", ["account_id"]);
      await queryInterface.addIndex("template", ["appraisal_id"]);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("template");
  },
};
