"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("res_evaluation_photo_pages"));

    if (!tableExists) {
      await queryInterface.createTable("res_evaluation_photo_pages", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        res_evaluation_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "res_evaluations",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
          ),
        },
      });

      // Add index for res_evaluation_id
      await queryInterface.addIndex("res_evaluation_photo_pages", [
        "res_evaluation_id",
      ]);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("res_evaluation_photo_pages");
  },
};
