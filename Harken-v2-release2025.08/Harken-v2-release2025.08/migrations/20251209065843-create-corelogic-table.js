'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('corelogic', {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      property_id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        references: {
          model: 'properties',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      property_detail: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      building_detail: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      site_location: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      tax_assessments: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      ownership: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      ownership_transfer: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      transaction_history: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },

      date_created: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // INDEX
    await queryInterface.addIndex('corelogic', ['property_id'], {
      name: 'idx_corelogic_property_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('corelogic');
  },
};