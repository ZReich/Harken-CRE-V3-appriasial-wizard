# Quick Start - Sample Data for Property Type Navigation

## Overview
You now have sample data for Residential and Land property types to test the property type navigation (Commercial/Residential/Land tabs).

## Running the Sample Data Seeders

### Option 1: Using PowerShell Script (Recommended for Windows)

```powershell
cd packages\backend
.\seed-sample-data.ps1
```

### Option 2: Manual Commands

```powershell
cd packages\backend

# Seed residential data
npx sequelize-cli db:seed --seed 20251029120000-residential-sample-data.js

# Seed land data
npx sequelize-cli db:seed --seed 20251029120001-land-sample-data.js
```

### Option 3: Seed Everything at Once

```powershell
cd packages\backend
npx sequelize-cli db:seed:all
```

## What Gets Created

### Residential Data
- **5 Residential Comps** in `res_comps` table
  - Single-family homes in various Colorado cities
  - Price range: $395k - $725k
  - Different conditions, sizes, and features
  
- **2 Residential Evaluations** in `res_evaluations` table
  - Subject properties for evaluation testing

### Land Data
- **5 Land Comps** in `comps` table (with `active_type: 'land_only'`)
  - Residential lots, commercial parcels, agricultural land
  - Various sizes from 0.69 to 4 acres
  - Price range: $165k - $1.25M
  
- **2 Land Appraisals** in `appraisals` table
  - Industrial and commercial land parcels
  
- **1 Land Evaluation** in `evaluations` table
  - 20-acre ranch parcel

## Testing the Navigation

### Test COMPS

1. **Click "COMPS"** in main navigation
2. **Click "Commercial" tab** → Navigate to `/comps` (existing commercial data)
3. **Click "Residential" tab** → Navigate to `/res_comps` (5 new residential properties)
4. **Click "Land" tab** → Navigate to `/land_comps` (5 new land properties)

### Test APPRAISAL

1. **Click "APPRAISAL"** in main navigation
2. **Click "Commercial" tab** → Navigate to `/appraisal-list`
3. **Click "Residential" tab** → Navigate to `/approach-residential`
4. **Click "Land" tab** → Navigate to `/appraisal-list-land-only` (2 new land appraisals)

### Test EVALUATION

1. **Click "EVALUATION"** in main navigation
2. **Click "Commercial" tab** → Navigate to `/evaluation-list`
3. **Click "Residential" tab** → Navigate to `/evaluation/residential-list` (2 new residential evaluations)
4. **Click "Land" tab** → Navigate to `/evaluation-list-land-only` (1 new land evaluation)

## Removing Sample Data

If you need to remove the sample data:

```powershell
cd packages\backend

# Remove residential data
npx sequelize-cli db:seed:undo --seed 20251029120000-residential-sample-data.js

# Remove land data
npx sequelize-cli db:seed:undo --seed 20251029120001-land-sample-data.js

# Or remove all seeded data
npx sequelize-cli db:seed:undo:all
```

## Troubleshooting

### "No users found" Error

The seeders require at least one user in the database. If you see this error:

1. Make sure you have a user account created
2. Check the database:
   ```powershell
   # Connect to MySQL and check
   mysql -u root -p
   USE harken_db;
   SELECT id, account_id FROM users LIMIT 1;
   ```

### Data Not Showing

If you don't see the data after seeding:

1. **Check console output** - Did the seeder run successfully?
2. **Verify localStorage** - Open browser DevTools → Application → Local Storage
   - `activeButton` should be "Commercial", "Residential", or "Land"
   - `activeType` should match: "building_with_land", "residential", or "land_only"
   - `activeMain` should be "COMPS", "APPRAISAL", or "EVALUATION"
3. **Clear cache and reload** the page
4. **Check the correct route** - Make sure you're on the expected URL

### Database Connection Issues

Ensure your database configuration is correct in `.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DATABASE=harken_db
```

## Next Steps

After seeding the data:

1. ✅ **Test navigation** - Click through all property type tabs
2. ✅ **Verify filtering** - Each view should show only the appropriate property type
3. ✅ **Check localStorage** - Values should update when switching tabs
4. ✅ **Test list/map views** - Data should appear in both views
5. ✅ **Create new records** - Try creating new comps/appraisals for each type

## Sample Data Details

For complete details about the sample data structure, see:
- `SAMPLE_DATA_IMPLEMENTATION.md` - Full documentation
- `seeders/20251029120000-residential-sample-data.js` - Residential seeder source
- `seeders/20251029120001-land-sample-data.js` - Land seeder source

## Related Changes

- ✅ **Property type navigation** implemented in `packages/frontend/src/components/header/index.tsx`
- ✅ **localStorage management** for property type state
- ✅ **Route definitions** for all property type variations
- ✅ **Sample data seeders** for residential and land types













