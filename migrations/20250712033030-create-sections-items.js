"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("section_item"));

    if (!tableExists) {
      await queryInterface.createTable("section_item", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        section_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "sections",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        template_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "template",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        type: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        content: {
          type: Sequelize.TEXT("medium"),
          allowNull: true,
        },
        order: {
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
        sub_section_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "sections",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        appraisal_approach_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "appraisal_approaches",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
      });

      // Add indexes
      await queryInterface.addIndex("section_item", ["section_id"]);
      await queryInterface.addIndex("section_item", ["sub_section_id"]);
      await queryInterface.addIndex("section_item", ["appraisal_approach_id"]);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("section_item");
  },
};
