#!/bin/bash

# Seed Sample Data Script
# This script populates the database with sample residential and land data

echo "================================================"
echo "  Harken CRE - Sample Data Seeder"
echo "================================================"
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "Error: This script must be run from the packages/backend directory"
    exit 1
fi

echo "📋 Checking for existing users..."
USER_COUNT=$(npx sequelize-cli db:seed:status 2>/dev/null | grep -c "up" || echo "0")

echo ""
echo "🌱 Running sample data seeders..."
echo ""

# Run residential data seeder
echo "→ Seeding residential data..."
npx sequelize-cli db:seed --seed 20251029120000-residential-sample-data.js

if [ $? -eq 0 ]; then
    echo "  ✓ Residential data seeded successfully"
else
    echo "  ✗ Failed to seed residential data"
    exit 1
fi

echo ""

# Run land data seeder
echo "→ Seeding land data..."
npx sequelize-cli db:seed --seed 20251029120001-land-sample-data.js

if [ $? -eq 0 ]; then
    echo "  ✓ Land data seeded successfully"
else
    echo "  ✗ Failed to seed land data"
    exit 1
fi

echo ""
echo "================================================"
echo "  ✅ Sample data seeded successfully!"
echo "================================================"
echo ""
echo "You can now test the property type navigation:"
echo "  • Commercial: /comps, /appraisal-list, /evaluation-list"
echo "  • Residential: /res_comps, /approach-residential, /evaluation/residential-list"
echo "  • Land: /land_comps, /appraisal-list-land-only, /evaluation-list-land-only"
echo ""













