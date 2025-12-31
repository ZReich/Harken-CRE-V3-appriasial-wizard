"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("snippets"));

    if (!tableExists) {
      await queryInterface.createTable("snippets", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        account_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        snippet: {
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
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        snippets_category_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
      });
      await queryInterface.addIndex("snippets", ["snippets_category_id"], {
        name: "snippets_category_id",
      });
      await queryInterface.addConstraint("snippets", {
        fields: ["snippets_category_id"],
        type: "foreign key",
        name: "snippets_snippets_category_id",
        references: {
          table: "snippets_category",
          field: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeConstraint(
    //   'snippets',
    //   'snippets_snippets_category_id'
    // );
    await queryInterface.dropTable("snippets");
  },
};
