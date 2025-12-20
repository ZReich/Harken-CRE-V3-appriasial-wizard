"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
      async up(queryInterface, Sequelize) {
            // Change data types
            // Check if table exists before altering
            const [leaseTable] = await queryInterface.sequelize.query(
                  "SHOW TABLES LIKE 'appraisal_lease_approach';"
            );
            if (leaseTable.length > 0) {
                  await queryInterface.sequelize.query(`
                        ALTER TABLE appraisal_lease_approach CHANGE total_comp_adj total_comp_adj DOUBLE NULL DEFAULT NULL;
                  `);
            }
            const [salesTable] = await queryInterface.sequelize.query(
                  "SHOW TABLES LIKE 'appraisal_sales_approaches';"
            );
            if (salesTable.length > 0) {
                  await queryInterface.sequelize.query(`
                        ALTER TABLE appraisal_sales_approaches CHANGE total_comp_adj total_comp_adj DOUBLE NULL DEFAULT NULL;
                  `);
            }
            // Check if res_evaluations table exists before altering
            const [resEvalTable] = await queryInterface.sequelize.query(
                  "SHOW TABLES LIKE 'res_evaluations';"
            );
            if (resEvalTable.length > 0) {
                  await queryInterface.sequelize.query(`
                        ALTER TABLE res_evaluations CHANGE close_date close_date DATETIME NULL DEFAULT NULL;
                  `);
                  await queryInterface.sequelize.query(`
                        ALTER TABLE res_evaluations CHANGE last_transferred_date last_transferred_date DATETIME NULL DEFAULT NULL;
                  `);
                  await queryInterface.sequelize.query(`
                        ALTER TABLE res_evaluations CHANGE date_sold date_sold DATETIME NULL DEFAULT NULL;
                  `);
                  await queryInterface.sequelize.query(`
                        ALTER TABLE res_evaluations CHANGE date_of_analysis date_of_analysis DATETIME NULL DEFAULT NULL;
                  `);
                  await queryInterface.sequelize.query(`
                        ALTER TABLE res_evaluations CHANGE report_date report_date DATETIME NULL DEFAULT NULL;
                  `);
                  await queryInterface.sequelize.query(`
                        ALTER TABLE res_evaluations CHANGE effective_date effective_date DATETIME NULL DEFAULT NULL;
                  `);
            }
            // Check if evaluation_income_approaches table exists
            const [incomeTable] = await queryInterface.sequelize.query(
                  "SHOW TABLES LIKE 'evaluation_income_approaches';"
            );
            if (incomeTable.length > 0) {
                  try {
                        await queryInterface.sequelize.query(`
                              UPDATE evaluation_income_approaches
                              SET incremental_value = NULL
                              WHERE incremental_value IS NULL
                                OR incremental_value = ''
                                OR incremental_value REGEXP '[^0-9-]';
                            `);
                  } catch (e) {
                        // Ignore errors
                  }
                  
                  // Change column type to DOUBLE
                  try {
                        await queryInterface.changeColumn(
                              "evaluation_income_approaches",
                              "incremental_value",
                              {
                                    type: Sequelize.DOUBLE,
                                    allowNull: true,
                              }
                        );
                  } catch (e) {
                        // Ignore errors if column doesn't exist or can't be changed
                  }
            } 
            // Add new columns
            const [leaseTable2] = await queryInterface.sequelize.query(
                  "SHOW TABLES LIKE 'appraisal_lease_approach';"
            );
            if (leaseTable2.length > 0) {
                  await addColumnIfNotExists(queryInterface, 'appraisal_lease_approach', 'lease_comps_notes', 'TEXT NULL DEFAULT NULL');
            }
            
            await addColumnIfNotExists(queryInterface, 'evaluation_cap_approaches', 'area_map_zoom', 'INT(11) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_cap_approaches', 'map_type', 'VARCHAR(50) NOT NULL DEFAULT \'roadmap\'');
            await addColumnIfNotExists(queryInterface, 'evaluation_cap_approaches', 'map_center_lat', 'VARCHAR(30) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_cap_approaches', 'map_center_lng', 'VARCHAR(30) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_cap_approaches', 'area_map_zoom', 'INT(11) NULL DEFAULT NULL', 'notes');
            await addColumnIfNotExists(queryInterface, 'evaluation_cap_approaches', 'map_type', 'VARCHAR(50) NOT NULL DEFAULT \'roadmap\'', 'area_map_zoom');
            await addColumnIfNotExists(queryInterface, 'evaluation_cap_approaches', 'map_center_lat', 'VARCHAR(30) NULL DEFAULT NULL', 'map_type');
            await addColumnIfNotExists(queryInterface, 'evaluation_cap_approaches', 'map_center_lng', 'VARCHAR(30) NULL DEFAULT NULL', 'map_type');
            
            await addColumnIfNotExists(queryInterface, 'evaluations', 'boundary_map_type', 'VARCHAR(20) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluations', 'evaluation_type', 'VARCHAR(30) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluations', 'map_center_lat', 'VARCHAR(30) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluations', 'map_center_lng', 'VARCHAR(30) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluations', 'photos_taken_by', 'VARCHAR(255) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluations', 'photo_date', 'VARCHAR(50) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluations', 'traffic_street_address', 'TEXT NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluations', 'traffic_count', 'TEXT NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluations', 'traffic_input', 'DOUBLE NULL DEFAULT NULL');
            
            await addColumnIfNotExists(queryInterface, 'evaluation_cost_approaches', 'notes', 'TEXT NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_cost_approaches', 'area_map_zoom', 'INT(11) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_cost_approaches', 'map_type', 'VARCHAR(50) NOT NULL DEFAULT \'roadmap\'');
            await addColumnIfNotExists(queryInterface, 'evaluation_cost_approaches', 'map_center_lat', 'VARCHAR(30) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_cost_approaches', 'map_center_lng', 'VARCHAR(30) NULL DEFAULT NULL');
            
            await addColumnIfNotExists(queryInterface, 'evaluation_income_approaches', 'income_notes', 'TEXT NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_income_approaches', 'expense_notes', 'TEXT NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_income_approaches', 'cap_rate_notes', 'TEXT NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_income_approaches', 'other_total_monthly_income', 'DOUBLE NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_income_approaches', 'other_total_annual_income', 'DOUBLE NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_income_approaches', 'other_total_sq_ft', 'DOUBLE NULL DEFAULT NULL');
            
            await addColumnIfNotExists(queryInterface, 'evaluation_lease_approaches', 'lease_comps_notes', 'TEXT NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_lease_approaches', 'area_map_zoom', 'INT(11) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_lease_approaches', 'map_type', 'VARCHAR(255) NOT NULL DEFAULT \'roadmap\'');
            await addColumnIfNotExists(queryInterface, 'evaluation_lease_approaches', 'map_center_lat', 'VARCHAR(30) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_lease_approaches', 'map_center_lng', 'VARCHAR(30) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_lease_approaches', 'low_adjusted_comp_range', 'VARCHAR(30) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_lease_approaches', 'high_adjusted_comp_range', 'VARCHAR(30) NULL DEFAULT NULL');
            
            await addColumnIfNotExists(queryInterface, 'evaluation_multi_family_approaches', 'area_map_zoom', 'INT(11) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_multi_family_approaches', 'map_type', 'VARCHAR(255) NOT NULL DEFAULT \'roadmap\'');
            await addColumnIfNotExists(queryInterface, 'evaluation_multi_family_approaches', 'map_center_lat', 'VARCHAR(30) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_multi_family_approaches', 'map_center_lng', 'VARCHAR(30) NULL DEFAULT NULL');
            
            await addColumnIfNotExists(queryInterface, 'evaluation_sales_approaches', 'note', 'TEXT NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_sales_approaches', 'area_map_zoom', 'INT(11) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_sales_approaches', 'map_type', 'VARCHAR(255) NOT NULL DEFAULT \'roadmap\'');
            await addColumnIfNotExists(queryInterface, 'evaluation_sales_approaches', 'map_center_lat', 'VARCHAR(30) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_sales_approaches', 'map_center_lng', 'VARCHAR(30) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'evaluation_sales_approaches', 'sales_approach_indicated_val', 'DOUBLE NULL DEFAULT NULL');
            
            await addColumnIfNotExists(queryInterface, 'eval_income_approach_source', 'link_overview', 'TINYINT(1) NULL DEFAULT \'0\'');
            
            await addColumnIfNotExists(queryInterface, 'eval_sales_approach_comps', 'overall_comparability', 'VARCHAR(15) NULL DEFAULT NULL');
            
            await addColumnIfNotExists(queryInterface, 'res_evaluations', 'traffic_street_address', 'TEXT NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'res_evaluations', 'traffic_count', 'TEXT NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'res_evaluations', 'traffic_input', 'DOUBLE NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'res_evaluations', 'evaluation_type', 'VARCHAR(30) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'res_evaluations', 'weight_sf', 'INT(11) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'res_evaluations', 'photos_taken_by', 'VARCHAR(255) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'res_evaluations', 'photo_date', 'VARCHAR(255) NULL DEFAULT NULL');

            await addColumnIfNotExists(queryInterface, 'res_evaluation_amenities', 'order', 'INT(11) NULL DEFAULT NULL');
            
            await addColumnIfNotExists(queryInterface, 'res_evaluation_cost_approaches', 'notes', 'TEXT NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'res_evaluation_cost_approaches', 'area_map_zoom', 'INT(11) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'res_evaluation_cost_approaches', 'map_type', 'VARCHAR(255) NOT NULL DEFAULT \'roadmap\'');
            await addColumnIfNotExists(queryInterface, 'res_evaluation_cost_approaches', 'map_center_lat', 'VARCHAR(30) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'res_evaluation_cost_approaches', 'map_center_lng', 'VARCHAR(30) NULL DEFAULT NULL');
            
            await addColumnIfNotExists(queryInterface, 'res_evaluation_income_approaches', 'income_notes', 'TEXT NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'res_evaluation_income_approaches', 'expense_notes', 'TEXT NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'res_evaluation_income_approaches', 'other_total_monthly_income', 'DOUBLE NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'res_evaluation_income_approaches', 'other_total_annual_income', 'DOUBLE NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'res_evaluation_income_approaches', 'other_total_sq_ft', 'DOUBLE NULL DEFAULT NULL');
            
            await addColumnIfNotExists(queryInterface, 'res_evaluation_sales_approaches', 'note', 'TEXT NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'res_evaluation_sales_approaches', 'map_type', 'VARCHAR(255) NOT NULL DEFAULT \'roadmap\'');
            await addColumnIfNotExists(queryInterface, 'res_evaluation_sales_approaches', 'map_center_lat', 'VARCHAR(30) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'res_evaluation_sales_approaches', 'map_center_lng', 'VARCHAR(30) NULL DEFAULT NULL');
            await addColumnIfNotExists(queryInterface, 'res_evaluation_sales_approaches', 'area_map_zoom', 'INT(11) NULL DEFAULT NULL');
            
            await addColumnIfNotExists(queryInterface, 'res_eval_income_approach_source', 'link_overview', 'TINYINT(1) NOT NULL DEFAULT \'0\'');
            await addColumnIfNotExists(queryInterface, 'res_eval_sales_approach_comp_amenities', 'is_extra', 'TINYINT(1) NOT NULL DEFAULT \'0\'');
            await addColumnIfNotExists(queryInterface, 'res_eval_sales_approach_subject_adj', 'order', 'INT(11) NULL DEFAULT NULL');
      },

      async down(queryInterface, Sequelize) {
            /**
             * Add reverting commands here.
             *
             * Example:
             * await queryInterface.dropTable('users');
             */
      },
};
async function addColumnIfNotExists(queryInterface, table, column, definition) {
      // First check if table exists
      const [tableCheck] = await queryInterface.sequelize.query(
            `SHOW TABLES LIKE '${table}'`
      );

      if (tableCheck.length === 0) {
            // Table doesn't exist, skip
            return;
      }

      // Check if column exists
      const [results] = await queryInterface.sequelize.query(
            `SHOW COLUMNS FROM \`${table}\` LIKE '${column}'`
      );

      if (results.length === 0) {
            try {
                  await queryInterface.sequelize.query(
                        `ALTER TABLE \`${table}\` ADD \`${column}\` ${definition}`
                  );
            } catch (e) {
                  // Ignore errors if column can't be added
            }
      }
}