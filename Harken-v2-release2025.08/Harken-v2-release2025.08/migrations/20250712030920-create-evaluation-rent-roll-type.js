"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("evaluation_rent_roll_type"));

    if (!tableExists) {
      await queryInterface.createTable("evaluation_rent_roll_type", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        evaluation_scenario_id: {
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
      await queryInterface.addIndex(
        "evaluation_rent_roll_type",
        ["evaluation_scenario_id"],
        { name: "evaluation_scenario_id" }
      );
      await queryInterface.addConstraint("evaluation_rent_roll_type", {
        fields: ["evaluation_scenario_id"],
        type: "foreign key",
        name: "evaluation_rent_roll_type_evaluation_scenario_id",
        references: {
          table: "evaluation_scenarios",
          field: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeConstraint(
    //   'evaluation_rent_roll_type',
    //   'evaluation_rent_roll_type_evaluation_scenario_id'
    // );
    await queryInterface.dropTable("evaluation_rent_roll_type");
  },
};
