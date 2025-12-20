"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("evaluation_photo_pages"));

    if (!tableExists) {
      await queryInterface.createTable("evaluation_photo_pages", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        evaluation_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        image_url: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        caption: {
          type: Sequelize.STRING(255),
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
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      });
      await queryInterface.addIndex(
        "evaluation_photo_pages",
        ["evaluation_id"],
        {
          name: "evaluation_id",
        }
      );
      await queryInterface.addConstraint("evaluation_photo_pages", {
        fields: ["evaluation_id"],
        type: "foreign key",
        name: "evaluation_photo_pages_evaluation_id",
        references: {
          table: "evaluations",
          field: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeConstraint(
    //   'evaluation_photo_pages',
    //   'evaluation_photo_pages_evaluation_id'
    // );
    await queryInterface.dropTable("evaluation_photo_pages");
  },
};
