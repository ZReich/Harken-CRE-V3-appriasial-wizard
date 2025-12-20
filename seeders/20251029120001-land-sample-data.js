'use strict';

/**
 * Land Sample Data Seeder
 * 
 * This seeder creates sample land comps, appraisals, and evaluations for testing
 * the land-only property type navigation and filtering.
 * 
 * Run with: npx sequelize-cli db:seed --seed 20251029120001-land-sample-data.js
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get the first user and account from the database
    const [users] = await queryInterface.sequelize.query(
      `SELECT id, account_id FROM users LIMIT 1`
    );
    
    if (!users || users.length === 0) {
      console.log('No users found. Please create a user first.');
      return;
    }

    const userId = users[0].id;
    const accountId = users[0].account_id;

    // Insert Land Comps (using comps table with type='land')
    const landComps = [
      {
        user_id: userId,
        account_id: accountId,
        business_name: 'Mountain Vista Lot',
        street_address: '1000 Mountain View Road',
        street_suite: 'Lot 15',
        city: 'Evergreen',
        county: 'Jefferson County',
        state: 'Colorado',
        zipcode: 80439,
        type: 'sales',
        property_image_url: null,
        condition: 'Vacant',
        property_class: 'Land',
        year_built: null,
        year_remodeled: null,
        sale_price: 185000,
        price_square_foot: 4.25,
        building_size: 0,
        land_size: 43560, // 1 acre
        land_dimension: '200 x 218',
        date_sold: new Date('2024-08-20'),
        summary: 'Prime mountain lot with panoramic views and utilities to lot line.',
        parcel_id_apn: 'JF-123-456-789',
        frontage: '200',
        utilities_select: 'Electric,Water,Gas,Sewer',
        topography: 'Sloped',
        water_source: 'Public',
        sewer_type: 'Public Sewer',
        road_access: 'Paved',
        zoning_code: 'R-1',
        zoning_description: 'Single Family Residential',
        active_type: 'land_only',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        user_id: userId,
        account_id: accountId,
        business_name: 'Commercial Development Parcel',
        street_address: '5500 Highway 85',
        street_suite: null,
        city: 'Littleton',
        county: 'Arapahoe County',
        state: 'Colorado',
        zipcode: 80120,
        type: 'sales',
        property_image_url: null,
        condition: 'Vacant',
        property_class: 'Land',
        year_built: null,
        year_remodeled: null,
        sale_price: 875000,
        price_square_foot: 10.05,
        building_size: 0,
        land_size: 87120, // 2 acres
        land_dimension: '290 x 300',
        date_sold: new Date('2024-07-15'),
        summary: 'Highway frontage commercial land with excellent visibility and traffic count.',
        parcel_id_apn: 'AR-987-654-321',
        frontage: '290',
        utilities_select: 'Electric,Water,Gas,Sewer',
        topography: 'Level',
        water_source: 'Public',
        sewer_type: 'Public Sewer',
        road_access: 'Paved',
        zoning_code: 'C-1',
        zoning_description: 'Commercial',
        active_type: 'land_only',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        user_id: userId,
        account_id: accountId,
        business_name: 'Agricultural Land Parcel',
        street_address: 'County Road 52',
        street_suite: null,
        city: 'Brighton',
        county: 'Adams County',
        state: 'Colorado',
        zipcode: 80601,
        type: 'sales',
        property_image_url: null,
        condition: 'Farmland',
        property_class: 'Land',
        year_built: null,
        year_remodeled: null,
        sale_price: 450000,
        price_square_foot: 2.59,
        building_size: 0,
        land_size: 174240, // 4 acres
        land_dimension: '400 x 435',
        date_sold: new Date('2024-09-10'),
        summary: 'Agricultural land with water rights and irrigation access.',
        parcel_id_apn: 'AD-111-222-333',
        frontage: '400',
        utilities_select: 'Electric,Well',
        topography: 'Level',
        water_source: 'Well',
        sewer_type: 'Septic',
        road_access: 'Gravel',
        zoning_code: 'A-1',
        zoning_description: 'Agricultural',
        active_type: 'land_only',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        user_id: userId,
        account_id: accountId,
        business_name: 'Subdivision Lot',
        street_address: '2345 Oakwood Circle',
        street_suite: 'Lot 8, Block 3',
        city: 'Parker',
        county: 'Douglas County',
        state: 'Colorado',
        zipcode: 80134,
        type: 'sales',
        property_image_url: null,
        condition: 'Vacant',
        property_class: 'Land',
        year_built: null,
        year_remodeled: null,
        sale_price: 165000,
        price_square_foot: 5.50,
        building_size: 0,
        land_size: 30000,
        land_dimension: '150 x 200',
        date_sold: new Date('2024-10-01'),
        summary: 'Ready-to-build lot in established subdivision with all utilities.',
        parcel_id_apn: 'DG-444-555-666',
        frontage: '150',
        utilities_select: 'Electric,Water,Gas,Sewer',
        topography: 'Level',
        water_source: 'Public',
        sewer_type: 'Public Sewer',
        road_access: 'Paved',
        zoning_code: 'R-3',
        zoning_description: 'Residential Subdivision',
        active_type: 'land_only',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        user_id: userId,
        account_id: accountId,
        business_name: 'Infill Development Site',
        street_address: '3456 Downtown Boulevard',
        street_suite: null,
        city: 'Denver',
        county: 'Denver County',
        state: 'Colorado',
        zipcode: 80202,
        type: 'sales',
        property_image_url: null,
        condition: 'Cleared',
        property_class: 'Land',
        year_built: null,
        year_remodeled: null,
        sale_price: 1250000,
        price_square_foot: 28.68,
        building_size: 0,
        land_size: 43560, // 1 acre
        land_dimension: '200 x 218',
        date_sold: new Date('2024-06-30'),
        summary: 'Urban infill site near downtown with high development potential.',
        parcel_id_apn: 'DV-777-888-999',
        frontage: '200',
        utilities_select: 'Electric,Water,Gas,Sewer',
        topography: 'Level',
        water_source: 'Public',
        sewer_type: 'Public Sewer',
        road_access: 'Paved',
        zoning_code: 'MU-3',
        zoning_description: 'Mixed Use',
        active_type: 'land_only',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      }
    ];

    await queryInterface.bulkInsert('comps', landComps, {});
    console.log('✓ Inserted 5 land comps');

    // Insert Land Appraisals
    const landAppraisals = [
      {
        user_id: userId,
        account_id: accountId,
        street_address: '7890 Development Drive',
        street_suite: null,
        city: 'Aurora',
        county: 'Arapahoe County',
        state: 'Colorado',
        zipcode: 80015,
        type: 'Land',
        appraisal_type: 'Complete Appraisal',
        business_name: 'Industrial Land Parcel - Subject',
        condition: 'Vacant',
        property_class: 'Land',
        year_built: null,
        year_remodeled: null,
        building_size: 0,
        land_size: 217800, // 5 acres
        land_dimension: '450 x 484',
        summary: 'Subject property for land appraisal - industrial zoning.',
        owner_of_record: 'ABC Development LLC',
        property_rights: 'Fee Simple',
        zoning_code: 'I-2',
        zoning_description: 'Light Industrial',
        frontage: '450',
        parcel_id_apn: 'AR-555-666-777',
        active_type: 'land_only',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        user_id: userId,
        account_id: accountId,
        street_address: 'Highway 36 and County Road 19',
        street_suite: null,
        city: 'Westminster',
        county: 'Jefferson County',
        state: 'Colorado',
        zipcode: 80030,
        type: 'Land',
        appraisal_type: 'Complete Appraisal',
        business_name: 'Corner Commercial Land',
        condition: 'Vacant',
        property_class: 'Land',
        year_built: null,
        year_remodeled: null,
        building_size: 0,
        land_size: 130680, // 3 acres
        land_dimension: '300 x 435',
        summary: 'Corner lot with excellent visibility for commercial development.',
        owner_of_record: 'Mountain View Properties',
        property_rights: 'Fee Simple',
        zoning_code: 'C-2',
        zoning_description: 'General Commercial',
        frontage: '300',
        parcel_id_apn: 'JF-888-999-000',
        active_type: 'land_only',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      }
    ];

    await queryInterface.bulkInsert('appraisals', landAppraisals, {});
    console.log('✓ Inserted 2 land appraisals');

    // Insert Land Evaluations
    const landEvaluations = [
      {
        user_id: userId,
        account_id: accountId,
        street_address: '12345 Rural Route 45',
        street_suite: null,
        city: 'Castle Rock',
        county: 'Douglas County',
        state: 'Colorado',
        zipcode: 80108,
        type: 'Land',
        property_name: 'Ranch Land Evaluation',
        condition: 'Grazing Land',
        year_built: null,
        year_remodeled: null,
        building_size: 0,
        land_size: 871200, // 20 acres
        land_dimension: '900 x 968',
        summary: 'Large ranch parcel for evaluation - potential subdivision.',
        owner: 'Double R Ranch LLC',
        property_rights: 'Fee Simple',
        zoning_code: 'A-35',
        zoning_description: 'Agricultural - 35 acre minimum',
        active_type: 'land_only',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      }
    ];

    await queryInterface.bulkInsert('evaluations', landEvaluations, {});
    console.log('✓ Inserted 1 land evaluation');

    console.log('✅ Land sample data seeded successfully!');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('comps', { active_type: 'land_only' }, {});
    await queryInterface.bulkDelete('appraisals', { active_type: 'land_only' }, {});
    await queryInterface.bulkDelete('evaluations', { active_type: 'land_only' }, {});
    console.log('✓ Removed land sample data');
  }
};













