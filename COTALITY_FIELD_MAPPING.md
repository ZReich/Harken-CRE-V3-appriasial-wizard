# Cotality Property v2 API Field Mapping Documentation

This document outlines the field mappings between Cotality Property v2 API responses and Harken's data models for comps and evaluation approaches.

## API Endpoint

**Base URL:** `https://api.gateway.attomdata.com/property/v2`

**Endpoints Used:**
- `ExpandedProfile/PropId/{propId}` - Get property by PropId
- `ExpandedProfile/Address?address1={address}&city={city}&state={state}&postalcode={zipcode}` - Get property by address

**Authentication:** API key passed in `apikey` header

## Response Structure

The Cotality API returns property data in a nested structure. The main property object contains:
- `address` - Address information
- `identifier` - Property identifiers (APN, CLIP, etc.)
- `location` - Geographic coordinates
- `building` - Building characteristics
- `lot` - Land characteristics
- `sale` - Sale history and transaction data
- `owner` - Owner information
- `zoning` - Zoning information
- `income` - Income data (if available)
- `expenses` - Expense data (if available)
- `lease` - Lease data (if available)

## Field Mappings

### Comps Table Mapping (Base Property Data)

These fields map directly to the `comps` table and are used across all evaluation approaches.

| Harken Field | Cotality Field Path | Data Type | Notes |
|--------------|---------------------|-----------|-------|
| `street_address` | `property.address.oneLine` or `property.address.line1` | String | Full address line or street address |
| `street_suite` | `property.address.line2` | String | Suite/unit number |
| `city` | `property.address.city` | String | City name |
| `state` | `property.address.state` | String | State abbreviation |
| `zipcode` | `property.address.postal1` | String/Integer | ZIP code |
| `county` | `property.address.county` | String | County name |
| `parcel_id_apn` | `property.identifier.apn` | String | Assessor Parcel Number |
| `latitude` | `property.location.latitude` | String | Latitude coordinate |
| `longitude` | `property.location.longitude` | String | Longitude coordinate |
| `map_pin_lat` | `property.location.latitude` | String | Map pin latitude (same as latitude) |
| `map_pin_lng` | `property.location.longitude` | String | Map pin longitude (same as longitude) |
| `year_built` | `property.building.yearBuilt` | String | Year built |
| `building_size` | `property.building.size.totalSquareFeet` | Double | Building square footage |
| `property_class` | `property.building.propertyType` | String | Property classification |
| `stories` | `property.building.stories` | String | Number of stories |
| `construction_class` | `property.building.constructionType` | String | Construction type |
| `land_size` | `property.lot.size.acres` | Double | Land size in acres (converted to square feet: acres × 43,560) |
| `frontage` | `property.lot.frontage` | String | Frontage measurement |
| `sale_price` | `property.sale.lastSalePrice` | Double | Last sale price |
| `date_sold` | `property.sale.lastSaleDate` | Date | Last sale date |
| `owner_of_record` | `property.owner.name` | String | Owner name |
| `grantor` | `property.sale.grantor` | String | Grantor name |
| `grantee` | `property.sale.grantee` | String | Grantee name |
| `zoning_type` | `property.zoning.code` | String | Zoning code |

#### Calculated Fields

| Harken Field | Calculation | Notes |
|--------------|-------------|-------|
| `price_square_foot` | `sale_price / building_size` | Price per square foot (only if both values exist and building_size > 0) |

### Sales Comparison Approach Mapping

Fields relevant for comparing properties in the Sales Comparison Approach.

**Mapped Fields:**
- `sale_price` - Sale price for comparison
- `date_sold` - Sale date for time adjustments
- `building_size` - Building size for SF comparison
- `land_size` - Land size for comparison
- `year_built` - Age for condition adjustments
- `property_class` - Property type for comparability
- `latitude` / `longitude` - Location for proximity analysis
- `price_square_foot` - Price per SF for comparison

**Potentially Available but Not Currently Mapped:**
- `property.sale.saleHistory` - Multiple sale records (could be used for trend analysis)
- `property.building.condition` - Property condition (could be used for condition adjustments)
- `property.building.quality` - Building quality grade (could be used for quality adjustments)

### Cost Approach Mapping

Fields relevant for estimating replacement cost and depreciation in the Cost Approach.

**Mapped Fields:**
- `year_built` - Year built for age calculation
- `construction_class` - Construction type for cost estimation
- `building_size` - Building size for cost calculation
- `land_size` - Land size for land value
- `stories` - Number of stories
- `gross_building_area` - Set equal to `building_size`
- `effective_age` - Calculated as: Current Year - Year Built

**Potentially Available but Not Currently Mapped:**
- `property.building.roofType` - Roof type (could be used for replacement cost estimation)
- `property.building.exteriorWalls` - Exterior wall material (could be used for replacement cost estimation)
- `property.building.heatingType` - Heating system type (could be used for replacement cost estimation)
- `property.building.coolingType` - Cooling system type (could be used for replacement cost estimation)
- `property.improvements` - Improvement details (could be used for cost approach improvements)

### Income Approach Mapping

Fields relevant for income-producing property valuation in the Income Approach.

**Mapped Fields:**
- `building_size` - Building size for income per SF calculations
- `net_operating_income` - NOI if available from `property.income.netOperatingIncome`
- `cap_rate` - Calculated as: `net_operating_income / sale_price` (if both available)
- `operating_expense_psf` - Calculated as: `operating_expenses / building_size` (if both available)
- `total_operating_expense` - Total operating expenses if available

**Potentially Available but Not Currently Mapped:**
- `property.income.rentalIncome` - Rental income data (could be used for income sources)
- `property.expenses.propertyTax` - Property tax expenses (could be used for operating expenses)
- `property.expenses.insurance` - Insurance expenses (could be used for operating expenses)
- `property.occupancy.occupancyRate` - Occupancy rate (could be used for vacancy calculation)

### Lease Comps Approach Mapping

Fields relevant for comparing lease rates in the Lease Comps Approach.

**Mapped Fields:**
- `building_size` - Leased space size
- `lease_rate` - Lease rate if available from `property.lease.leaseRate`, or calculated from rental income
- `term` - Lease term in months from `property.lease.leaseTerm`

**Calculation:**
- If `property.income.rentalIncome` is available and `building_size` exists, `lease_rate` is calculated as: `rentalIncome / building_size`

**Potentially Available but Not Currently Mapped:**
- `property.lease.leaseType` - Lease type (Gross, Net, Triple Net) (could be used for lease type comparison)
- `property.lease.concessions` - Lease concessions (could be used for concessions adjustments)
- `property.lease.tenantImprovements` - TI allowance (could be used for TI allowance comparison)
- `property.lease.escalations` - Rent escalations (could be used for escalation analysis)

### Cap Rate Approach Mapping

Fields relevant for extracting capitalization rates from comparable sales in the Cap Rate Approach.

**Mapped Fields:**
- `sale_price` - Sale price for cap rate extraction
- `net_operating_income` - NOI for cap rate calculation
- `building_size` - Building size
- `cap_rate` - Calculated as: `net_operating_income / sale_price` (if both available and sale_price > 0)

**Potentially Available but Not Currently Mapped:**
- `property.occupancy.occupancyRate` - Occupancy rate (could be used as risk factor for cap rate adjustments)
- `property.location.quality` - Location quality grade (could be used as risk factor for cap rate adjustments)
- `property.building.condition` - Property condition (could be used as risk factor for cap rate adjustments)
- `property.tenant.creditRating` - Tenant credit rating (could be used as risk factor for cap rate adjustments)

## API Usage Examples

### Get Property by PropId
```
GET /api/cotality/property/{propId}
```

### Get Property by Address
```
POST /api/cotality/property/address
Body: {
  "address": "123 Main St",
  "city": "Billings",
  "state": "MT",
  "zipcode": "59101" // optional
}
```

### Get Field Mapping Documentation
```
GET /api/cotality/field-mapping
```

### Explore Property (Raw + Mapped Data)
```
GET /api/cotality/explore/{propId}
```

Returns:
- Raw API response
- Mapped fields for comps table
- Mapped fields for each evaluation approach (sales, cost, income, lease, cap rate)

## Notes

1. **Data Availability**: Not all properties will have all fields available. Income, expense, and lease data are typically only available for income-producing properties.

2. **Data Transformations**: Some fields require transformations:
   - Land size: Converted from acres to square feet (1 acre = 43,560 sq ft)
   - Effective age: Calculated from current year and year built
   - Price per SF: Calculated from sale price and building size
   - Cap rate: Calculated from NOI and sale price

3. **Field Paths**: The actual API response structure may vary. These mappings are based on typical Cotality API responses. Actual field paths should be verified by inspecting the raw API response.

4. **Unmapped Fields**: Many Cotality fields are not currently mapped but could be useful. These are documented in the "Potentially Available but Not Currently Mapped" sections above.

5. **Error Handling**: The API may return errors for invalid PropIds or addresses. Always check the response status before accessing data.

## Future Enhancements

- Map additional fields as needed for specific evaluation approaches
- Add support for multiple sale history records
- Map improvement details for cost approach
- Map detailed income and expense breakdowns for income approach
- Map lease terms and concessions for lease approach
- Map risk factors for cap rate adjustments


