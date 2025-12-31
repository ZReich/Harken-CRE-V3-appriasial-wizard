"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tableExists = await queryInterface
      .showAllTables()
      .then((tables) => tables.includes("appraisal_income_approaches"));

    if (!tableExists) {
      await queryInterface.createTable("appraisal_income_approaches", {
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
        eval_weight: { type: Sequelize.DOUBLE, allowNull: true },
        net_income: { type: Sequelize.TEXT, allowNull: true },
        indicated_value_range: { type: Sequelize.TEXT, allowNull: true },
        indicated_value_psf: { type: Sequelize.TEXT, allowNull: true },
        incremental_value: { type: Sequelize.DOUBLE, allowNull: true },
        incremental_value_monthly: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
        },
        vacancy: { type: Sequelize.DOUBLE, allowNull: true },
        adjusted_gross_amount: { type: Sequelize.DOUBLE, allowNull: true },
        vacant_amount: { type: Sequelize.DOUBLE, allowNull: true },
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
        monthly_capitalization_rate: { type: Sequelize.DOUBLE, allowNull: true },
        annual_capitalization_rate: { type: Sequelize.DOUBLE, allowNull: true },
        unit_capitalization_rate: { type: Sequelize.DOUBLE, allowNull: true },
        sq_ft_capitalization_rate: { type: Sequelize.DOUBLE, allowNull: true },
        bed_capitalization_rate: { type: Sequelize.DOUBLE, allowNull: true },
        high_capitalization_rate: { type: Sequelize.DOUBLE, allowNull: true },
        total_net_income: { type: Sequelize.DOUBLE, allowNull: true },
        indicated_range_monthly: { type: Sequelize.DOUBLE, allowNull: true },
        indicated_range_annual: { type: Sequelize.DOUBLE, allowNull: true },
        indicated_range_unit: { type: Sequelize.DOUBLE, allowNull: true },
        indicated_range_sq_feet: { type: Sequelize.DOUBLE, allowNull: true },
        indicated_range_bed: { type: Sequelize.DOUBLE, allowNull: true },
        indicated_psf_monthly: { type: Sequelize.DOUBLE, allowNull: true },
        indicated_psf_annual: { type: Sequelize.DOUBLE, allowNull: true },
        indicated_psf_unit: { type: Sequelize.DOUBLE, allowNull: true },
        indicated_psf_sq_feet: { type: Sequelize.DOUBLE, allowNull: true },
        indicated_psf_bed: { type: Sequelize.DOUBLE, allowNull: true },
        total_monthly_income: { type: Sequelize.DOUBLE, allowNull: true },
        total_annual_income: { type: Sequelize.DOUBLE, allowNull: true },
        total_rent_unit: { type: Sequelize.DOUBLE, allowNull: true },
        total_unit: { type: Sequelize.DOUBLE, allowNull: true },
        total_oe_annual_amount: { type: Sequelize.DOUBLE, allowNull: true },
        total_oe_gross: { type: Sequelize.DOUBLE, allowNull: true },
        total_oe_per_unit: { type: Sequelize.DOUBLE, allowNull: true },
        total_sq_ft: { type: Sequelize.DOUBLE, allowNull: true },
        total_rent_sq_ft: { type: Sequelize.DOUBLE, allowNull: true },
        total_oe_per_square_feet: { type: Sequelize.DOUBLE, allowNull: true },
        total_rent_bed: { type: Sequelize.DOUBLE, allowNull: true },
        total_oe_per_bed: { type: Sequelize.DOUBLE, allowNull: true },
        total_bed: { type: Sequelize.DOUBLE, allowNull: true },
        income_notes: { type: Sequelize.TEXT, allowNull: true },
        expense_notes: { type: Sequelize.TEXT, allowNull: true },
        cap_rate_notes: { type: Sequelize.TEXT, allowNull: true },
        appraisal_id: { type: Sequelize.INTEGER, allowNull: true },
        other_total_monthly_income: { type: Sequelize.DOUBLE, allowNull: true },
        other_total_annual_income: { type: Sequelize.DOUBLE, allowNull: true },
        other_total_sq_ft: { type: Sequelize.DOUBLE, allowNull: true },
      });
      // await queryInterface.addIndex("appraisal_income_approaches", [
      //   "appraisal_approach_id",
      // ]);
      // await queryInterface.addIndex("appraisal_income_approaches", [
      //   "appraisal_id",
      // ]);
      // await queryInterface.addConstraint("appraisal_income_approaches", {
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
      // await queryInterface.addConstraint("appraisal_income_approaches", {
      //   fields: ["appraisal_id"],
      //   type: "foreign key",
      //   name: "appraisal_id",
      //   references: {
      //     table: "appraisals",
      //     field: "id",
      //   },
      //   onDelete: "SET NULL",
      //   onUpdate: "CASCADE",
      // });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "appraisal_income_approaches",
      "appraisal_income_approaches_ibfk_409"
    );
    await queryInterface.removeConstraint(
      "appraisal_income_approaches",
      "appraisal_income_approaches_ibfk_410"
    );
    await queryInterface.dropTable("appraisal_income_approaches");
  },
};
