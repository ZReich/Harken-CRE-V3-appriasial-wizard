"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("appraisals_metadata"));

    if (!tableExists) {
      await queryInterface.createTable("appraisals_metadata", {
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
        name: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        value: {
          type: Sequelize.TEXT,
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
      // await queryInterface.addIndex("appraisals_metadata", ["appraisal_id"]);
      // await queryInterface.addConstraint("appraisals_metadata", {
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
      "appraisals_metadata",
      "appraisals_metadata_ibfk_1"
    );
    await queryInterface.dropTable("appraisals_metadata");
  },
};
