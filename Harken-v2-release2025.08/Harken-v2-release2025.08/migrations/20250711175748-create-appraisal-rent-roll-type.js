"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("appraisal_rent_roll_type"));

    if (!tableExists) {
      await queryInterface.createTable("appraisal_rent_roll_type", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        appraisal_approach_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        type: {
          type: Sequelize.TEXT,
          allowNull: false,
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
      // await queryInterface.addIndex(
      //   "appraisal_rent_roll_type",
      //   ["appraisal_approach_id"],
      //   { name: "appraisal_approach_id" }
      // );
      // await queryInterface.addConstraint("appraisal_rent_roll_type", {
      //   fields: ["appraisal_approach_id"],
      //   type: "foreign key",
      //   name: "appraisal_approach_id",
      //   references: {
      //     table: "appraisal_approaches",
      //     field: "id",
      //   },
      //   onDelete: "CASCADE",
      //   onUpdate: "CASCADE",
      // });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "appraisal_rent_roll_type",
      "appraisal_rent_roll_type_ibfk_1"
    );
    await queryInterface.dropTable("appraisal_rent_roll_type");
  },
};
