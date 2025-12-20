'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Helper function to check if a table and column exist
    async function columnExists(tableName, columnName) {
      try {
        const tableDesc = await queryInterface.describeTable(tableName);
        return tableDesc && tableDesc[columnName];
      } catch (error) {
        return false;
      }
    }

    // Update evaluations table date fields from DATETIME to DATE
    if (await columnExists("evaluations", "close_date")) {
      await queryInterface.changeColumn("evaluations", "close_date", {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null
      });
    }

    if (await columnExists("evaluations", "last_transferred_date")) {
      await queryInterface.changeColumn("evaluations", "last_transferred_date", {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null
      });
    }

    if (await columnExists("evaluations", "date_of_analysis")) {
      await queryInterface.changeColumn("evaluations", "date_of_analysis", {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null
      });
    }

    if (await columnExists("evaluations", "report_date")) {
      await queryInterface.changeColumn("evaluations", "report_date", {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null
      });
    }

    if (await columnExists("evaluations", "effective_date")) {
      await queryInterface.changeColumn("evaluations", "effective_date", {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null
      });
    }

    // Update res_evaluations table date fields from DATETIME to DATE
    if (await columnExists("res_evaluations", "close_date")) {
      await queryInterface.changeColumn("res_evaluations", "close_date", {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null
      });
    }

    if (await columnExists("res_evaluations", "last_transferred_date")) {
      await queryInterface.changeColumn("res_evaluations", "last_transferred_date", {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null
      });
    }

    if (await columnExists("res_evaluations", "date_sold")) {
      await queryInterface.changeColumn("res_evaluations", "date_sold", {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null
      });
    }

    if (await columnExists("res_evaluations", "date_of_analysis")) {
      await queryInterface.changeColumn("res_evaluations", "date_of_analysis", {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null
      });
    }

    if (await columnExists("res_evaluations", "report_date")) {
      await queryInterface.changeColumn("res_evaluations", "report_date", {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null
      });
    }

    if (await columnExists("res_evaluations", "effective_date")) {
      await queryInterface.changeColumn("res_evaluations", "effective_date", {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null
      });
    }
  },

  async down (queryInterface, Sequelize) {
    // Helper function to check if a table and column exist
    async function columnExists(tableName, columnName) {
      try {
        const tableDesc = await queryInterface.describeTable(tableName);
        return tableDesc && tableDesc[columnName];
      } catch (error) {
        return false;
      }
    }

    // Revert evaluations table date fields from DATE back to DATETIME
    if (await columnExists("evaluations", "close_date")) {
      await queryInterface.changeColumn("evaluations", "close_date", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
    }

    if (await columnExists("evaluations", "last_transferred_date")) {
      await queryInterface.changeColumn("evaluations", "last_transferred_date", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
    }

    if (await columnExists("evaluations", "date_of_analysis")) {
      await queryInterface.changeColumn("evaluations", "date_of_analysis", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
    }

    if (await columnExists("evaluations", "report_date")) {
      await queryInterface.changeColumn("evaluations", "report_date", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
    }

    if (await columnExists("evaluations", "effective_date")) {
      await queryInterface.changeColumn("evaluations", "effective_date", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
    }

    // Revert res_evaluations table date fields from DATE back to DATETIME
    if (await columnExists("res_evaluations", "close_date")) {
      await queryInterface.changeColumn("res_evaluations", "close_date", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
    }

    if (await columnExists("res_evaluations", "last_transferred_date")) {
      await queryInterface.changeColumn("res_evaluations", "last_transferred_date", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
    }

    if (await columnExists("res_evaluations", "date_sold")) {
      await queryInterface.changeColumn("res_evaluations", "date_sold", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
    }

    if (await columnExists("res_evaluations", "date_of_analysis")) {
      await queryInterface.changeColumn("res_evaluations", "date_of_analysis", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
    }

    if (await columnExists("res_evaluations", "report_date")) {
      await queryInterface.changeColumn("res_evaluations", "report_date", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
    }

    if (await columnExists("res_evaluations", "effective_date")) {
      await queryInterface.changeColumn("res_evaluations", "effective_date", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
    }
  }
};
