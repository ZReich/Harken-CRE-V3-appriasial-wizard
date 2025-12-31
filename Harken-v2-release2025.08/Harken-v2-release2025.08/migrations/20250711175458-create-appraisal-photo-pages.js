"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("appraisal_photo_pages"));

    if (!tableExists) {
      await queryInterface.createTable("appraisal_photo_pages", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        appraisal_id: {
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
      // await queryInterface.addIndex("appraisal_photo_pages", ["appraisal_id"], {
      //   name: "appraisal_id",
      // });
      // await queryInterface.addConstraint("appraisal_photo_pages", {
      //   fields: ["appraisal_id"],
      //   type: "foreign key",
      //   name: "appraisal_id",
      //   references: {
      //     table: "appraisals",
      //     field: "id",
      //   },
      //   onDelete: "CASCADE",
      //   onUpdate: "CASCADE",
      // });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "appraisal_photo_pages",
      "appraisal_photo_pages_ibfk_1"
    );
    await queryInterface.dropTable("appraisal_photo_pages");
  },
};
