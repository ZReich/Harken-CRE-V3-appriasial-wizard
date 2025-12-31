"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = "eval_multi_family_comparison_attributes";

    // Step 1: Empty the table
    await queryInterface.sequelize.query(`DELETE FROM ${tableName};`);

    // Step 2: Fetch all multi-family approaches with comparison_basis
    const [approaches] = await queryInterface.sequelize.query(`
      SELECT mf.id AS mf_id, eval.comparison_basis
      FROM evaluation_multi_family_approaches AS mf
      JOIN evaluations AS eval ON eval.id = mf.evaluation_id
    `);

    for (const approach of approaches) {
      const { mf_id, comparison_basis: comparisonBasis } = approach;

      let defaultAttributes = [];

      // Step 3: Define defaultAttributes based on comparisonBasis
      if (comparisonBasis === "Unit") {
        defaultAttributes = [
          { comparison_key: "parking", comparison_value: "Parking" },
          {
            comparison_key: "year_built_year_remodeled",
            comparison_value: "Year Built / Remodeled",
          },
          {
            comparison_key: "quality_condition",
            comparison_value: "Quality / Condition",
          },
        ];
      }

      // Step 4: Insert default attributes for each row
      for (let i = 0; i < defaultAttributes.length; i++) {
        const { comparison_key, comparison_value } = defaultAttributes[i];

        await queryInterface.sequelize.query(`
          INSERT INTO ${tableName} (
            evaluation_multi_family_approach_id,
            comparison_key,
            comparison_value,
            \`order\`,
            date_created,
            last_updated
          )
          SELECT
            ${mf_id},
            '${comparison_key}',
            '${comparison_value}',
            ${i + 1},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          FROM DUAL
          WHERE NOT EXISTS (
            SELECT 1
            FROM ${tableName} AS existing
            WHERE existing.evaluation_multi_family_approach_id = ${mf_id}
              AND existing.comparison_key = '${comparison_key}'
          );
        `);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DELETE FROM eval_multi_family_comparison_attributes;
    `);
  },
};
