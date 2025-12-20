"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const res_evaluation_comparative_attribute_list = [
      {
        res_evaluation_type_id: 414,
        comparative_attribute_id: 395,
        default: 1,
      },
      {
        res_evaluation_type_id: 414,
        comparative_attribute_id: 396,
        default: 1,
      },
      {
        res_evaluation_type_id: 414,
        comparative_attribute_id: 397,
        default: 1,
      },
      {
        res_evaluation_type_id: 414,
        comparative_attribute_id: 398,
        default: 1,
      },
      {
        res_evaluation_type_id: 414,
        comparative_attribute_id: 399,
        default: 1,
      },
      {
        res_evaluation_type_id: 414,
        comparative_attribute_id: 400,
        default: 1,
      },
      {
        res_evaluation_type_id: 414,
        comparative_attribute_id: 401,
        default: 1,
      },
      {
        res_evaluation_type_id: 414,
        comparative_attribute_id: 402,
        default: 1,
      },
      {
        res_evaluation_type_id: 414,
        comparative_attribute_id: 403,
        default: 1,
      },
      {
        res_evaluation_type_id: 414,
        comparative_attribute_id: 404,
        default: 1,
      },
      {
        res_evaluation_type_id: 414,
        comparative_attribute_id: 405,
        default: 1,
      },
      {
        res_evaluation_type_id: 414,
        comparative_attribute_id: 406,
        default: 1,
      },
      {
        res_evaluation_type_id: 414,
        comparative_attribute_id: 407,
        default: 1,
      },
      {
        res_evaluation_type_id: 414,
        comparative_attribute_id: 408,
        default: 1,
      },
      {
        res_evaluation_type_id: 414,
        comparative_attribute_id: 409,
        default: 1,
      },
      {
        res_evaluation_type_id: 414,
        comparative_attribute_id: 410,
        default: 1,
      },
      {
        res_evaluation_type_id: 414,
        comparative_attribute_id: 411,
        default: 1,
      },
      {
        res_evaluation_type_id: 414,
        comparative_attribute_id: 412,
        default: 1,
      },
      {
        res_evaluation_type_id: 414,
        comparative_attribute_id: 413,
        default: 1,
      },
      {
        res_evaluation_type_id: 414,
        comparative_attribute_id: 424,
        default: 1,
      },
    ];
    await queryInterface.sequelize.query(
      `TRUNCATE TABLE res_evaluation_comparative_attribute_list;`
    );
    // Add created and last_updated timestamps
    const currentTime = new Date();
    const attributeWithTimestamps =
      res_evaluation_comparative_attribute_list.map((attribute) => ({
        ...attribute,
        created: currentTime,
        last_updated: currentTime,
      }));

    // Insert only new records
    if (attributeWithTimestamps.length > 0) {
      await queryInterface.bulkInsert(
        "res_evaluation_comparative_attribute_list",
        attributeWithTimestamps
      );
    } else {
      console.log("No new comparative attributes to insert");
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete(
      "res_evaluation_comparative_attribute_list",
      null,
      {}
    );
  },
};
