"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("snippets_category"));

    if (!tableExists) {
      // 1. Create the 'snippets_category' table
      await queryInterface.createTable("snippets_category", {
        id: {
          type: Sequelize.INTEGER(11),
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        account_id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
        },
        category_name: {
          type: Sequelize.STRING(100),
        },
        created_by: {
          type: Sequelize.INTEGER(11),
        },
        date_created: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        last_updated: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
          ),
        },
      });

    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("snippets"));

      if (tableExists) {
        // 2. Add foreign key column to 'snippets' table
        const tableDescription = await queryInterface.describeTable("snippets");

        if (!tableDescription.snippets_category_id) {
          await queryInterface.addColumn("snippets", "snippets_category_id", {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            references: {
              model: "snippets_category",
              key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
          });
        }
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // 1. Remove the foreign key column
    await queryInterface.removeColumn("snippets", "snippets_category_id");

    // 2. Drop the 'snippets_category' table
    await queryInterface.dropTable("snippets_category");
  },
};
