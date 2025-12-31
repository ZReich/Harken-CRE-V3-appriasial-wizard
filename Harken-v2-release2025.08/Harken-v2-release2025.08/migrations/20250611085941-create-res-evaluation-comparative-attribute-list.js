"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = "res_evaluation_comparative_attribute_list";

    const tableExists = await queryInterface.sequelize.query(
      `SHOW TABLES LIKE '${tableName}'`,
      { type: Sequelize.QueryTypes.SHOWTABLES }
    );
    if (tableExists.length === 0) {
      await queryInterface.createTable(
        "res_evaluation_comparative_attribute_list",
        {
          id: {
            type: Sequelize.INTEGER(11),
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
          },
          res_evaluation_type_id: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
          },
          comparative_attribute_id: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
          },
          default: {
            type: Sequelize.TINYINT(1),
            allowNull: false,
            defaultValue: 1,
          },
          created: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          },
          last_updated: {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: Sequelize.literal(
              "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
            ),
          },
        }
      );
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("res_evaluation_comparative_attribute_list");
  },
};
