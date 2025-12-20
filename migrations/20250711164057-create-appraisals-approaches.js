"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("appraisal_approaches"));

    if (!tableExists) {
      await queryInterface.createTable("appraisal_approaches", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        appraisal_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        type: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        name: {
          type: Sequelize.STRING(255),
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
      // await queryInterface.addIndex("appraisal_approaches", ["appraisal_id"]);
      // await queryInterface.addConstraint("appraisal_approaches", {
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
      "appraisal_approaches",
      "appraisal_approaches_ibfk_1"
    );
    await queryInterface.dropTable("appraisal_approaches");
  },
};
