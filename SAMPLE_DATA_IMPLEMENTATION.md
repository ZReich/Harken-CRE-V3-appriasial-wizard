# Sample Data Implementation - Residential & Land Property Types

## Overview

This implementation adds comprehensive sample data for **Residential** and **Land** property types to match the existing Commercial data. This allows proper testing of the property type navigation system where users can switch between Commercial, Residential, and Land views across COMPS, APPRAISAL, and EVALUATION modules.

## Files Created

### Seeder Files

1. **`seeders/20251029120000-residential-sample-data.js`**
   - Creates residential comps in the `res_comps` table
   - Creates residential evaluations in the `res_evaluations` table
   
2. **`seeders/20251029120001-land-sample-data.js`**
   - Creates land comps in the `comps` table (with `active_type: 'land_only'`)
   - Creates land appraisals in the `appraisals` table
   - Creates land evaluations in the `evaluations` table

## Sample Data Summary

### Residential Data

#### Residential Comps (5 properties)
1. **Mountain View Residence** - Denver, CO
   - 2,000 SF | $485,000 | Built 2015
   - 4 BR / 2.5 BA | Good condition
   
2. **Riverside Family Home** - Boulder, CO
   - 2,400 SF | $625,000 | Built 2020
   - 5 BR / 3 BA | Excellent condition
   
3. **Historic Downtown House** - Fort Collins, CO
   - 1,600 SF | $395,000 | Built 1925, Remodeled 2018
   - 3 BR / 2 BA | Average condition
   
4. **Suburban Ranch** - Aurora, CO
   - 1,800 SF | $425,000 | Built 2010
   - 3 BR / 2 BA | Good condition
   
5. **Lakeview Contemporary** - Lakewood, CO
   - 2,700 SF | $725,000 | Built 2022
   - 4 BR / 3.5 BA | Excellent condition

#### Residential Evaluations (2 properties)
1. **Executive Residence** - Highlands Ranch, CO
   - 3,200 SF | Built 2018
   - Subject property for residential evaluation
   
2. **Suburban Home Evaluation** - Castle Rock, CO
   - 2,600 SF | Built 2005, Remodeled 2019

### Land Data

#### Land Comps (5 properties)
1. **Mountain Vista Lot** - Evergreen, CO
   - 1.0 acres | $185,000 | $4.25/SF
   - R-1 Zoning | Mountain views
   
2. **Commercial Development Parcel** - Littleton, CO
   - 2.0 acres | $875,000 | $10.05/SF
   - C-1 Zoning | Highway frontage
   
3. **Agricultural Land Parcel** - Brighton, CO
   - 4.0 acres | $450,000 | $2.59/SF
   - A-1 Zoning | With water rights
   
4. **Subdivision Lot** - Parker, CO
   - 0.69 acres | $165,000 | $5.50/SF
   - R-3 Zoning | Ready to build
   
5. **Infill Development Site** - Denver, CO
   - 1.0 acres | $1,250,000 | $28.68/SF
   - MU-3 Zoning | Urban infill

#### Land Appraisals (2 properties)
1. **Industrial Land Parcel** - Aurora, CO
   - 5.0 acres | I-2 Zoning
   - Subject property for land appraisal
   
2. **Corner Commercial Land** - Westminster, CO
   - 3.0 acres | C-2 Zoning
   - Corner lot with excellent visibility

#### Land Evaluations (1 property)
1. **Ranch Land Evaluation** - Castle Rock, CO
   - 20.0 acres | A-35 Zoning
   - Large ranch parcel for subdivision potential

## Installation

### Running the Seeders

To populate the database with sample data, run these commands from the project root:

```bash
# Navigate to backend directory
cd packages/backend

# Run residential data seeder
npx sequelize-cli db:seed --seed 20251029120000-residential-sample-data.js

# Run land data seeder
npx sequelize-cli db:seed --seed 20251029120001-land-sample-data.js

# Or run all seeders at once
npx sequelize-cli db:seed:all
```

### Removing Sample Data

To remove the sample data (rollback):

```bash
# Remove residential data
npx sequelize-cli db:seed:undo --seed 20251029120000-residential-sample-data.js

# Remove land data
npx sequelize-cli db:seed:undo --seed 20251029120001-land-sample-data.js

# Or undo all seeders
npx sequelize-cli db:seed:undo:all
```

## Testing the Implementation

### 1. Test COMPS Navigation

**Commercial:**
- Click "COMPS" in main navigation
- Click "Commercial" tab
- Navigate to `/comps`
- Should see commercial properties (building_with_land)

**Residential:**
- Click "COMPS" in main navigation
- Click "Residential" tab
- Navigate to `/res_comps`
- Should see 5 residential properties listed

**Land:**
- Click "COMPS" in main navigation
- Click "Land" tab
- Navigate to `/land_comps`
- Should see 5 land properties listed

### 2. Test APPRAISAL Navigation

**Commercial:**
- Click "APPRAISAL" in main navigation
- Click "Commercial" tab
- Navigate to `/appraisal-list`
- Should see commercial appraisals

**Residential:**
- Click "APPRAISAL" in main navigation
- Click "Residential" tab
- Navigate to `/approach-residential`
- Should see residential appraisals

**Land:**
- Click "APPRAISAL" in main navigation
- Click "Land" tab
- Navigate to `/appraisal-list-land-only`
- Should see 2 land appraisals

### 3. Test EVALUATION Navigation

**Commercial:**
- Click "EVALUATION" in main navigation
- Click "Commercial" tab
- Navigate to `/evaluation-list`
- Should see commercial evaluations

**Residential:**
- Click "EVALUATION" in main navigation
- Click "Residential" tab
- Navigate to `/evaluation/residential-list`
- Should see 2 residential evaluations

**Land:**
- Click "EVALUATION" in main navigation
- Click "Land" tab
- Navigate to `/evaluation-list-land-only`
- Should see 1 land evaluation

## Data Structure Details

### Residential Properties
- Stored in separate `res_comps` and `res_evaluations` tables
- Include residential-specific fields:
  - `bedrooms`, `bathrooms`
  - `garage`, `basement`, `stories`
  - `exterior`, `roof`, `electrical`, `plumbing`, `heating_cooling`, `windows`

### Land Properties
- Stored in standard `comps`, `appraisals`, and `evaluations` tables
- Distinguished by `active_type: 'land_only'` field
- `building_size: 0` (no structures)
- Focus on land characteristics:
  - `topography`, `water_source`, `sewer_type`, `road_access`
  - Larger `land_size` values (in square feet)
  - Price per square foot reflects land value

### Commercial Properties
- Stored in `comps`, `appraisals`, and `evaluations` tables
- `active_type: 'building_with_land'`
- Include both building and land data
- Commercial-specific fields like `property_class`, `business_name`

## Database Schema Notes

### User and Account Dependencies
The seeders automatically fetch the first user and account from the database:
```javascript
const [users] = await queryInterface.sequelize.query(
  `SELECT id, account_id FROM users LIMIT 1`
);
```

If no users exist, the seeders will skip with a message. **You must have at least one user created before running these seeders.**

### Property Type Filtering
The navigation system uses these keys to filter data:
- **Commercial**: `active_type: 'building_with_land'`
- **Residential**: Separate tables (`res_comps`, `res_evaluations`)
- **Land**: `active_type: 'land_only'` AND `building_size: 0`

## Geographic Distribution

All sample data is located in Colorado to provide:
- Variety across different counties
- Urban, suburban, and rural examples
- Different market conditions (Denver metro vs. mountain communities)
- Realistic comparable sales for each property type

## Troubleshooting

### Seeder Fails with "No users found"
**Solution:** Create a user account first:
```bash
# Register a new user through the UI or API
# Or check if users table has records
mysql -u root -p harken_db -e "SELECT id, account_id FROM users LIMIT 1;"
```

### Data Not Appearing in Lists
**Check:**
1. Verify seeder ran successfully (check console output)
2. Confirm `active_type` values are set correctly
3. Check localStorage values:
   - `activeButton` should be "Commercial", "Residential", or "Land"
   - `activeType` should be "building_with_land", "residential", or "land_only"
   - `activeMain` should be "COMPS", "APPRAISAL", or "EVALUATION"
4. Verify the route matches the expected path

### Duplicate Key Errors
**Solution:** The seeders create new records each time. To avoid duplicates:
```bash
# Clear existing sample data first
npx sequelize-cli db:seed:undo:all
# Then re-run the seeders
npx sequelize-cli db:seed:all
```

## Future Enhancements

Consider adding:
- More diverse property types (multi-family, mixed-use)
- Client associations for appraisals/evaluations
- Photo/image URLs for properties
- Zoning records in separate `zoning` table
- Amenities for residential properties (`res_comp_amenities`)
- Approach-specific data (sales, cost, income approaches)

## Related Files

- Navigation Implementation: `packages/frontend/src/components/header/index.tsx`
- Property Type Navigation Plan: `property-type-navigation.plan.md`
- Implementation Summary: `PROPERTY_TYPE_NAVIGATION_IMPLEMENTATION.md`













