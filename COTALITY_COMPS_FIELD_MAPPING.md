# Cotality to Harken Comp Field Mapping

**For:** Development Team  
**Purpose:** Field mapping for Cotality bulk data to existing Harken comp database fields  
**Date:** November 2025  
**Version:** 1.0

---

## Commercial Comp Field Mapping

**Database Table:** `comps`  
**Comp Type:** `building_with_land`

### Core Identifiers (10 fields)

| Harken Field | Cotality Field | Field # | Notes |
|--------------|----------------|---------|-------|
| `parcel_id_apn` | APN (PARCEL NUMBER UNFORMATTED) | 3 | Primary parcel identifier |
| `street_address` | PROPERTY STREET NAME - ENRICHED | 69 | Full street name |
| `street_suite` | PROPERTY UNIT NUMBER - ENRICHED | 73 | Suite/unit number |
| `city` | PROPERTY CITY - ENRICHED | 74 | City name |
| `county` | PROPERTY COUNTY NAME - ENRICHED | 78 | County name |
| `state` | PROPERTY STATE - ENRICHED | 75 | Two-letter state code |
| `zipcode` | PROPERTY ZIPCODE 5 - ENRICHED | 76 | 5-digit zip |
| `latitude` | PARCEL LEVEL LATITUDE | 48 | Parcel-level coordinates |
| `longitude` | PARCEL LEVEL LONGITUDE | 49 | Parcel-level coordinates |
| `google_place_id` | (Generate from address) | - | Generate via Google Geocoding API |

### Property Details (15 fields)

| Harken Field | Cotality Field | Field # | Notes |
|--------------|----------------|---------|-------|
| `type` | LAND USE CODE - ENRICHED | 34 | CoreLogic property type code |
| `property_class` | PROPERTY INDICATOR CODE - ENRICHED | 40 | SFR, Condo, Commercial, etc. |
| `condition` | BUILDING IMPROVEMENT CONDITION CODE | 226 | Good, Fair, Under Construction, etc. |
| `year_built` | YEAR BUILT - ENRICHED | 194 | Original construction year (YYYY) |
| `year_remodeled` | EFFECTIVE YEAR BUILT - ENRICHED | 195 | Effective year if different from year_built |
| `building_size` | UNIVERSAL BUILDING SQUARE FEET | 246 | Most accurate building SF |
| `land_size` | TOTAL LAND SQUARE FOOTAGE - ENRICHED | 191 | Land in square feet |
| `land_dimension` | (Calculate) | - | "SF" or "Acre" based on size |
| `frontage` | FRONT FOOTAGE | 188 | Linear frontage feet |
| `topography` | LOCATION INFLUENCE CODE | 43 | May indicate topography features |
| `lot_shape` | BUILDING SHAPE TYPE CODE - ENRICHED | 229 | May indicate lot shape |
| `utilities_select` | WATER TYPE CODE, SEWER TYPE CODE, ELECTRICITY TYPE CODE | 266, 264, 263 | Combine multiple codes |
| `utilities_text` | (Combine descriptions) | - | Text description from codes |
| `zoning_type` | ZONING CODE | 38 | County zoning code |
| `stories` | TOTAL NUMBER OF STORIES - ENRICHED | 223 | Number of stories |

### Sale Information (10 fields)

| Harken Field | Cotality Field | Field # | Notes |
|--------------|----------------|---------|-------|
| `sale_price` | SALE AMOUNT | 168 | Most recent sale price |
| `date_sold` | SALE RECORDING DATE | 166 | Sale recording date (YYYYMMDD) |
| `price_square_foot` | (Calculate) | - | SALE AMOUNT / UNIVERSAL BUILDING SQUARE FEET |
| `grantor` | SELLER NAME | 174 | Seller name from deed |
| `grantee` | (Not in Cotality) | - | Buyer name - manual entry |
| `instrument` | SALE DOCUMENT TYPE CODE | 165 | Deed type (Grant, Quit, Foreclosure) |
| `financing` | PRIMARY MORTGAGE AMOUNT | 175 | Indicates if financed; amount available |
| `sale_status` | (Set to "Sold") | - | Auto-set to "Sold" for recorded sales |
| `list_price` | (Not in Cotality) | - | Listing price - manual entry |
| `days_on_market` | (Calculate if list_date available) | - | Calculate from date_list to date_sold |

### Lease Information (6 fields) - If type = 'lease'

| Harken Field | Cotality Field | Field # | Notes |
|--------------|----------------|---------|-------|
| `lease_rate` | ESTIMATED RENTAL VALUE | 744 | Convert to $/SF/Year or $/SF/Month |
| `lease_rate_unit` | (Derive from calculation) | - | Set to "$/SF/Year" or "$/SF/Month" |
| `space` | UNIVERSAL BUILDING SQUARE FEET | 246 | Leasable space SF |
| `lease_type` | PROPERTY INDICATOR CODE - ENRICHED | 40 | May indicate lease type |
| `term` | (Not in Cotality) | - | Lease term in months - manual entry |
| `cam` | (Not in Cotality) | - | Common Area Maintenance - manual entry |

### Income Approach (4 fields)

| Harken Field | Cotality Field | Field # | Notes |
|--------------|----------------|---------|-------|
| `cap_rate` | CAP RATE | 892 | Capitalization rate |
| `net_operating_income` | (Calculate) | - | ESTIMATED RENTAL VALUE × 12 × (1 - expense ratio) |
| `total_operating_expense` | (Not in Cotality) | - | Operating expenses - manual entry |
| `operating_expense_psf` | (Calculate) | - | If operating expenses available |

**Total Mappable Fields:** ~45 fields

---

## Residential Comp Field Mapping

**Database Table:** `res_comps`  
**Comp Type:** `residential`

### All Commercial Fields (45 fields)
Residential comps include **all commercial fields** listed above, plus residential-specific fields below.

### Residential-Specific Fields (15 fields)

| Harken Field | Cotality Field | Field # | Notes |
|--------------|----------------|---------|-------|
| **Living Spaces** |
| `bedrooms` | TOTAL NUMBER OF BEDROOMS - ALL BUILDINGS - ENRICHED | 196 | Total bedrooms |
| `bathrooms` | TOTAL NUMBER OF BATHROOMS - ALL BUILDINGS - ENRICHED | 198 | Total bathrooms (full + partial count) |
| `basement` | BASEMENT TYPE CODE - ENRICHED | 213 | Basement type (Full, Partial, Crawl, None) |
| | BASEMENT PERCENTAGE FINISHED - ENRICHED | 215 | Finished percentage |
| | FINISHED BASEMENT AREA SQUARE FEET | 259 | Finished basement SF |
| | UNFINISHED BASEMENT AREA SQUARE FEET | 260 | Unfinished basement SF |
| **Building Components** |
| `exterior` | EXTERIOR WALL TYPE CODE - ENRICHED | 231 | Exterior material/finish |
| `roof` | ROOF COVER TYPE CODE - ENRICHED | 240 | Roof covering material |
| | ROOF SHAPE TYPE CODE - ENRICHED | 241 | Roof shape (Gable, Flat, Hip, etc.) |
| `heating_cooling` | HEATING TYPE CODE - ENRICHED | 221 | Heating system type |
| | AIR CONDITIONING TYPE CODE - ENRICHED | 210 | Cooling system type |
| | AIR CONDITIONING INDICATOR - ENRICHED | 209 | Y/N for AC presence |
| `electrical` | ELECTRICITY/WIRING TYPE CODE | 263 | Electrical system type |
| `plumbing` | (Not in Cotality) | - | Plumbing details - manual entry |
| `windows` | (Not in Cotality) | - | Window details - manual entry |
| **Amenities** |
| `garage` | GARAGE TYPE CODE - ENRICHED | 235 | Garage type (Attached, Detached, Carport) |
| | TOTAL NUMBER OF PARKING SPACES - ENRICHED | 236 | Number of parking spaces |
| `fireplace` | FIREPLACE INDICATOR - ENRICHED | 217 | Y = Fireplace present |
| | TOTAL NUMBER OF FIREPLACES - ENRICHED | 218 | Number of fireplaces |
| | FIREPLACE TYPE CODE - ENRICHED | 219 | Fireplace type |
| `fencing` | (Not in Cotality) | - | Fencing details - manual entry |
| `other_amenities` | (Combine multiple indicators) | - | Combine pool, patio, solar, etc. |

**Total Mappable Fields:** ~60 fields

---

## Land Comp Field Mapping

**Database Table:** `comps`  
**Comp Type:** `land_only`

### Core Identifiers (10 fields)
**Same as Commercial** - All address, APN, and coordinate fields apply.

### Land-Specific Fields (20 fields)

| Harken Field | Cotality Field | Field # | Notes |
|--------------|----------------|---------|-------|
| **Land Characteristics** |
| `land_size` | TOTAL LAND SQUARE FOOTAGE - ENRICHED | 191 | Land in square feet |
| | TOTAL NUMBER OF ACRES - ENRICHED | 190 | Land in acres |
| `land_dimension` | (Set to "Acre" or "SF") | - | Force "Acre" for land-only |
| `land_type` | LAND USE CODE - ENRICHED | 34 | Land use classification |
| | COUNTY LAND USE DESCRIPTION | 35 | Land use description |
| | STATE LAND USE DESCRIPTION | 36 | State land use description |
| **Site Details** |
| `topography` | LOCATION INFLUENCE CODE | 43 | May indicate topography (Waterfront, Mountain, etc.) |
| `lot_shape` | BUILDING SHAPE TYPE CODE - ENRICHED | 229 | May indicate lot shape |
| `frontage` | FRONT FOOTAGE | 188 | Linear frontage feet |
| `front_feet` | FRONT FOOTAGE | 188 | Same as frontage |
| `lot_depth` | DEPTH FOOTAGE | 189 | Linear depth feet |
| **Utilities & Infrastructure** |
| `utilities_select` | WATER TYPE CODE | 266 | Water availability |
| | SEWER TYPE CODE | 264 | Sewer availability |
| | ELECTRICITY/WIRING TYPE CODE | 263 | Electric availability |
| `utilities_text` | (Combine descriptions) | - | Description from utility codes |
| **Zoning & Legal** |
| `zoning_type` | ZONING CODE | 38 | Zoning classification |
| `zoning_description` | ZONING CODE DESCRIPTION | 39 | Zoning description text |
| `legal_desc` | LEGAL DESCRIPTION | 90 | Full legal description (up to 750 chars) |
| **Sale Information** |
| `sale_price` | SALE AMOUNT | 168 | Sale price |
| `date_sold` | SALE RECORDING DATE | 166 | Sale date |
| `price_square_foot` | (Calculate per acre) | - | Convert to $/acre: SALE AMOUNT / ACRES |

### Fields NOT Used for Land (Set to NULL or 0)

| Field | Value | Reason |
|-------|-------|--------|
| `building_size` | 0 or NULL | No building on vacant land |
| `year_built` | NULL | No building |
| `year_remodeled` | NULL | No building |
| `condition` | NULL | No building to assess |
| `bedrooms`, `bathrooms`, `garage` | NULL | Residential fields not applicable |
| `lease_rate`, `cap_rate`, `NOI` | NULL | No income from vacant land |

**Total Mappable Fields:** ~30 fields

---

**End of Document**
