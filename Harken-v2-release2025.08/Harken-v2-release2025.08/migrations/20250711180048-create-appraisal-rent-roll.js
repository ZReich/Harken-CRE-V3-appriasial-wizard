"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("appraisal_rent_roll"));

    if (!tableExists) {
      await queryInterface.createTable("appraisal_rent_roll", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        appraisal_rent_roll_type_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        beds: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        baths: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        unit: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        rent: {
          type: Sequelize.DOUBLE,
          allowNull: true,
          defaultValue: 0,
        },
        tenant_exp: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        lease_expiration: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        sq_ft: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        unit_count: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        avg_monthly_rent: {
          type: Sequelize.DOUBLE,
          allowNull: true,
          defaultValue: 0,
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
        "appraisal_rent_roll",
        ["appraisal_rent_roll_type_id"],
        { name: "appraisal_rent_roll_type_id" }
      );
      await queryInterface.addConstraint("appraisal_rent_roll", {
        fields: ["appraisal_rent_roll_type_id"],
        type: "foreign key",
        name: "appraisal_rent_roll_type_id",
        references: {
          table: "appraisal_rent_roll_type",
          field: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "appraisal_rent_roll",
      "appraisal_rent_roll_ibfk_1"
    );
    await queryInterface.dropTable("appraisal_rent_roll");
  },
};
