"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("appraisal_files"));

    if (!tableExists) {
      await queryInterface.createTable("appraisal_files", {
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
        type: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        size: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        height: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        width: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        title: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        dir: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        filename: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        origin: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        storage: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        order: {
          type: Sequelize.INTEGER,
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
      // await queryInterface.addIndex("appraisal_files", ["appraisal_id"]);
      // await queryInterface.addConstraint("appraisal_files", {
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
      "appraisal_files",
      "appraisal_files_ibfk_1"
    );
    await queryInterface.dropTable("appraisal_files");
  },
};
