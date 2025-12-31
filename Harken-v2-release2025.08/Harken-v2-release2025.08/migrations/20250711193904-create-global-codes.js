"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("global_codes"));

    if (!tableExists) {
      await queryInterface.createTable("global_codes", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        global_code_category_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        code: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        parent_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        status: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
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
        appraisal_default: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        evaluation_default: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        comps_default: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
      });
      await queryInterface.addIndex("global_codes", ["global_code_category_id"], {
        name: "global_code_category_id",
      });
      await queryInterface.addIndex("global_codes", ["parent_id"], {
        name: "global_codes_parent_id",
      });
      await queryInterface.addConstraint("global_codes", {
        fields: ["global_code_category_id"],
        type: "foreign key",
        name: "global_codes_global_code_category_id",
        references: {
          table: "global_code_categories",
          field: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      await queryInterface.addConstraint("global_codes", {
        fields: ["parent_id"],
        type: "foreign key",
        name: "global_codes_parent_id",
        references: {
          table: "global_codes",
          field: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeConstraint(
    //   'global_codes',
    //   'global_codes_global_code_category_id'
    // );
    // await queryInterface.removeConstraint(
    //   'global_codes',
    //   'global_codes_parent_id'
    // );
    await queryInterface.dropTable("global_codes");
  },
};
