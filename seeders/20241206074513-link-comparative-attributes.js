"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const appraisal_sale_comparative_attribute_list = [
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 115,
        default: 1,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 116,
        default: 1,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 117,
        default: 1,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 118,
        default: 1,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 119,
        default: 1,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 120,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 121,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 122,
        default: 1,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 123,
        default: 1,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 124,
        default: 1,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 125,
        default: 1,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 126,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 127,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 128,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 129,
        default: 1,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 130,
        default: 1,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 131,
        default: 1,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 132,
        default: 1,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 133,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 134,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 135,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 136,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 137,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 138,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 139,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 140,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 141,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 142,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 143,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 144,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 145,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 146,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 147,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 148,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 149,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 150,
        default: 0,
      },
      {
        appraisal_type_id: 180,
        sales_comparative_attribute_id: 151,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 115,
        default: 1,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 116,
        default: 1,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 117,
        default: 1,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 118,
        default: 1,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 119,
        default: 1,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 120,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 121,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 122,
        default: 1,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 123,
        default: 1,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 124,
        default: 1,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 125,
        default: 1,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 126,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 127,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 128,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 129,
        default: 1,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 130,
        default: 1,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 131,
        default: 1,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 132,
        default: 1,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 133,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 134,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 135,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 136,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 137,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 138,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 139,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 140,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 141,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 142,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 143,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 144,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 145,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 146,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 147,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 148,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 149,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 150,
        default: 0,
      },
      {
        appraisal_type_id: 181,
        sales_comparative_attribute_id: 151,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 115,
        default: 1,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 116,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 117,
        default: 1,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 118,
        default: 1,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 119,
        default: 1,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 120,
        default: 1,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 121,
        default: 1,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 122,
        default: 1,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 123,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 124,
        default: 1,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 125,
        default: 1,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 126,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 127,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 128,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 129,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 130,
        default: 1,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 131,
        default: 1,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 132,
        default: 1,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 133,
        default: 1,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 134,
        default: 1,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 135,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 136,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 137,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 138,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 139,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 140,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 141,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 142,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 143,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 144,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 145,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 146,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 147,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 148,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 149,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 150,
        default: 0,
      },
      {
        appraisal_type_id: 182,
        sales_comparative_attribute_id: 151,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 115,
        default: 1,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 116,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 117,
        default: 1,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 118,
        default: 1,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 119,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 120,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 121,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 122,
        default: 1,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 123,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 124,
        default: 1,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 125,
        default: 1,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 126,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 127,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 128,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 129,
        default: 1,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 130,
        default: 1,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 131,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 132,
        default: 1,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 133,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 134,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 135,
        default: 1,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 136,
        default: 1,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 137,
        default: 1,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 138,
        default: 1,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 139,
        default: 1,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 140,
        default: 1,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 141,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 142,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 143,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 144,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 145,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 146,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 147,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 148,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 149,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 150,
        default: 0,
      },
      {
        appraisal_type_id: 183,
        sales_comparative_attribute_id: 151,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 115,
        default: 1,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 116,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 117,
        default: 1,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 118,
        default: 1,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 119,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 120,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 121,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 122,
        default: 1,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 123,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 124,
        default: 1,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 125,
        default: 1,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 126,
        default: 1,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 127,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 128,
        default: 1,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 129,
        default: 1,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 130,
        default: 1,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 131,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 132,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 133,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 134,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 135,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 136,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 137,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 138,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 139,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 140,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 141,
        default: 1,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 142,
        default: 1,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 143,
        default: 1,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 144,
        default: 1,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 145,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 146,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 147,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 148,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 149,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 150,
        default: 0,
      },
      {
        appraisal_type_id: 184,
        sales_comparative_attribute_id: 151,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 115,
        default: 1,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 116,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 117,
        default: 1,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 118,
        default: 1,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 119,
        default: 1,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 120,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 121,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 122,
        default: 1,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 123,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 124,
        default: 1,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 125,
        default: 1,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 126,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 127,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 128,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 129,
        default: 1,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 130,
        default: 1,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 131,
        default: 1,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 132,
        default: 1,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 133,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 134,
        default: 1,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 135,
        default: 1,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 136,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 137,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 138,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 139,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 140,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 141,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 142,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 143,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 144,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 145,
        default: 1,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 146,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 147,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 148,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 149,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 150,
        default: 0,
      },
      {
        appraisal_type_id: 185,
        sales_comparative_attribute_id: 151,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 115,
        default: 1,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 116,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 117,
        default: 1,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 118,
        default: 1,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 119,
        default: 1,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 120,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 121,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 122,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 123,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 124,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 125,
        default: 1,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 126,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 127,
        default: 1,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 128,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 129,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 130,
        default: 1,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 131,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 132,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 133,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 134,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 135,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 136,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 137,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 138,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 139,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 140,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 141,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 142,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 143,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 144,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 145,
        default: 0,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 146,
        default: 1,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 147,
        default: 1,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 148,
        default: 1,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 149,
        default: 1,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 150,
        default: 1,
      },
      {
        appraisal_type_id: 186,
        sales_comparative_attribute_id: 151,
        default: 1,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 115,
        default: 1,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 116,
        default: 1,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 117,
        default: 1,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 118,
        default: 1,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 119,
        default: 1,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 120,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 121,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 122,
        default: 1,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 123,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 124,
        default: 1,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 125,
        default: 1,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 126,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 127,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 128,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 129,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 130,
        default: 1,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 131,
        default: 1,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 132,
        default: 1,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 133,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 134,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 135,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 136,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 137,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 138,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 139,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 140,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 141,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 142,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 143,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 144,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 145,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 146,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 147,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 148,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 149,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 150,
        default: 0,
      },
      {
        appraisal_type_id: 187,
        sales_comparative_attribute_id: 151,
        default: 0,
      },
    ];

    await queryInterface.sequelize.query(
      `TRUNCATE TABLE appraisal_sale_comparative_attribute_list;`
    );

    // Add created and last_updated timestamps
    const currentTime = new Date();
    const attributeWithTimestamps =
      appraisal_sale_comparative_attribute_list.map((attribute) => ({
        ...attribute,
        created: currentTime,
        last_updated: currentTime,
      }));

    // Insert only new records
    if (attributeWithTimestamps.length > 0) {
      await queryInterface.bulkInsert(
        "appraisal_sale_comparative_attribute_list",
        attributeWithTimestamps
      );
    } else {
      console.log("No new comparative attributes to insert");
    }
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete(
      "appraisal_sale_comparative_attribute_list",
      null,
      {}
    );
  },
};
