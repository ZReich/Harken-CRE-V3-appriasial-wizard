# Seed Sample Data Script (PowerShell)
# This script populates the database with sample residential and land data

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Harken CRE - Sample Data Seeder" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the backend directory
if (-Not (Test-Path "package.json")) {
    Write-Host "Error: This script must be run from the packages\backend directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Checking environment..." -ForegroundColor Yellow
Write-Host ""

Write-Host "🌱 Running sample data seeders..." -ForegroundColor Yellow
Write-Host ""

# Run residential data seeder
Write-Host "→ Seeding residential data..." -ForegroundColor White
npx sequelize-cli db:seed --seed 20251029120000-residential-sample-data.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Residential data seeded successfully" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to seed residential data" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Run land data seeder
Write-Host "→ Seeding land data..." -ForegroundColor White
npx sequelize-cli db:seed --seed 20251029120001-land-sample-data.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Land data seeded successfully" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to seed land data" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ✅ Sample data seeded successfully!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now test the property type navigation:" -ForegroundColor White
Write-Host "  • Commercial: /comps, /appraisal-list, /evaluation-list" -ForegroundColor Gray
Write-Host "  • Residential: /res_comps, /approach-residential, /evaluation/residential-list" -ForegroundColor Gray
Write-Host "  • Land: /land_comps, /appraisal-list-land-only, /evaluation-list-land-only" -ForegroundColor Gray
Write-Host ""













