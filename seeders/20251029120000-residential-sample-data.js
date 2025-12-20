'use strict';

/**
 * Residential Sample Data Seeder
 * 
 * This seeder creates sample residential comps and evaluations for testing
 * the residential property type navigation and filtering.
 * 
 * Run with: npx sequelize-cli db:seed --seed 20251029120000-residential-sample-data.js
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

    // Insert Residential Comps
    const residentialComps = [
      {
        user_id: userId,
        account_id: accountId,
        property_name: 'Mountain View Residence',
        street_address: '1234 Pine Street',
        city: 'Denver',
        county: 'Denver County',
        state: 'Colorado',
        zipcode: 80202,
        type: 'sales',
        property_image_url: null,
        condition: 'Good',
        exterior: 'Brick',
        roof: 'Asphalt Shingle',
        electrical: 'Updated',
        plumbing: 'Copper',
        heating_cooling: 'Forced Air/Central AC',
        windows: 'Double Pane',
        year_built: '2015',
        year_remodeled: null,
        sale_price: 485000,
        price_square_foot: 242.50,
        building_size: 2000,
        land_size: 7200,
        land_dimension: '80 x 90',
        date_sold: new Date('2024-08-15'),
        summary: 'Well-maintained single family home in desirable neighborhood with mountain views.',
        frontage: '80',
        bedrooms: 4,
        bathrooms: 2.5,
        garage: 'Attached 2-car',
        basement: 'Finished',
        stories: '2',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        user_id: userId,
        account_id: accountId,
        property_name: 'Riverside Family Home',
        street_address: '5678 River Road',
        city: 'Boulder',
        county: 'Boulder County',
        state: 'Colorado',
        zipcode: 80301,
        type: 'sales',
        property_image_url: null,
        condition: 'Excellent',
        exterior: 'Stucco',
        roof: 'Tile',
        electrical: 'New',
        plumbing: 'PEX',
        heating_cooling: 'Radiant/Central AC',
        windows: 'Triple Pane',
        year_built: '2020',
        year_remodeled: null,
        sale_price: 625000,
        price_square_foot: 260.42,
        building_size: 2400,
        land_size: 8800,
        land_dimension: '100 x 88',
        date_sold: new Date('2024-09-20'),
        summary: 'Modern home with energy-efficient features and proximity to creek.',
        frontage: '100',
        bedrooms: 5,
        bathrooms: 3,
        garage: 'Attached 3-car',
        basement: 'Finished',
        stories: '2',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        user_id: userId,
        account_id: accountId,
        property_name: 'Historic Downtown House',
        street_address: '910 Main Street',
        city: 'Fort Collins',
        county: 'Larimer County',
        state: 'Colorado',
        zipcode: 80521,
        type: 'sales',
        property_image_url: null,
        condition: 'Average',
        exterior: 'Wood Siding',
        roof: 'Metal',
        electrical: 'Updated',
        plumbing: 'Galvanized/Copper',
        heating_cooling: 'Forced Air/Window Units',
        windows: 'Original/Replacement Mix',
        year_built: '1925',
        year_remodeled: '2018',
        sale_price: 395000,
        price_square_foot: 246.88,
        building_size: 1600,
        land_size: 6000,
        land_dimension: '60 x 100',
        date_sold: new Date('2024-07-10'),
        summary: 'Charming historic home with period details and modern updates.',
        frontage: '60',
        bedrooms: 3,
        bathrooms: 2,
        garage: 'Detached 1-car',
        basement: 'Unfinished',
        stories: '1.5',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        user_id: userId,
        account_id: accountId,
        property_name: 'Suburban Ranch',
        street_address: '2468 Oak Avenue',
        city: 'Aurora',
        county: 'Arapahoe County',
        state: 'Colorado',
        zipcode: 80012,
        type: 'sales',
        property_image_url: null,
        condition: 'Good',
        exterior: 'Vinyl Siding',
        roof: 'Asphalt Shingle',
        electrical: 'Original',
        plumbing: 'Copper',
        heating_cooling: 'Forced Air/Central AC',
        windows: 'Double Pane',
        year_built: '2010',
        year_remodeled: null,
        sale_price: 425000,
        price_square_foot: 236.11,
        building_size: 1800,
        land_size: 7500,
        land_dimension: '75 x 100',
        date_sold: new Date('2024-06-25'),
        summary: 'Ranch-style home in family-friendly neighborhood with good schools.',
        frontage: '75',
        bedrooms: 3,
        bathrooms: 2,
        garage: 'Attached 2-car',
        basement: 'Partially Finished',
        stories: '1',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        user_id: userId,
        account_id: accountId,
        property_name: 'Lakeview Contemporary',
        street_address: '1357 Lakeshore Drive',
        city: 'Lakewood',
        county: 'Jefferson County',
        state: 'Colorado',
        zipcode: 80226,
        type: 'sales',
        property_image_url: null,
        condition: 'Excellent',
        exterior: 'Stone/Stucco',
        roof: 'Asphalt Shingle',
        electrical: 'New',
        plumbing: 'PEX',
        heating_cooling: 'Geothermal/Central AC',
        windows: 'Triple Pane',
        year_built: '2022',
        year_remodeled: null,
        sale_price: 725000,
        price_square_foot: 268.52,
        building_size: 2700,
        land_size: 10000,
        land_dimension: '100 x 100',
        date_sold: new Date('2024-10-05'),
        summary: 'Luxury contemporary home with lake access and high-end finishes.',
        frontage: '100',
        bedrooms: 4,
        bathrooms: 3.5,
        garage: 'Attached 3-car',
        basement: 'Finished',
        stories: '2',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      }
    ];

    await queryInterface.bulkInsert('res_comps', residentialComps, {});
    console.log('✓ Inserted 5 residential comps');

    // Insert Residential Evaluations
    const residentialEvaluations = [
      {
        user_id: userId,
        account_id: accountId,
        street_address: '789 Maple Drive',
        city: 'Highlands Ranch',
        county: 'Douglas County',
        state: 'Colorado',
        zipcode: 80126,
        type: 'Residential',
        property_name: 'Executive Residence - Subject Property',
        condition: 'Good',
        year_built: '2018',
        year_remodeled: null,
        building_size: 3200,
        land_size: 9500,
        land_dimension: '95 x 100',
        summary: 'Subject property for residential evaluation.',
        owner: 'John and Jane Smith',
        property_rights: 'Fee Simple',
        zoning_code: 'R-1',
        zoning_description: 'Single Family Residential',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        user_id: userId,
        account_id: accountId,
        street_address: '456 Elm Street',
        city: 'Castle Rock',
        county: 'Douglas County',
        state: 'Colorado',
        zipcode: 80104,
        type: 'Residential',
        property_name: 'Suburban Home Evaluation',
        condition: 'Average',
        year_built: '2005',
        year_remodeled: '2019',
        building_size: 2600,
        land_size: 8000,
        land_dimension: '80 x 100',
        summary: 'Residential property evaluation for refinancing.',
        owner: 'Sarah Thompson',
        property_rights: 'Fee Simple',
        zoning_code: 'R-2',
        zoning_description: 'Residential District',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      }
    ];

    await queryInterface.bulkInsert('res_evaluations', residentialEvaluations, {});
    console.log('✓ Inserted 2 residential evaluations');

    console.log('✅ Residential sample data seeded successfully!');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('res_comps', null, {});
    await queryInterface.bulkDelete('res_evaluations', null, {});
    console.log('✓ Removed residential sample data');
  }
};













