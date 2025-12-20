# Evaluation Wizard Documentation

## Overview

The Evaluation Wizard is a multi-step workflow system that guides users through creating property evaluations in the Harken v2 platform. The wizard supports three property types: **Commercial**, **Residential**, and **Land**, each with different valuation approaches and requirements.

---

## Table of Contents

1. [Wizard Structure](#wizard-structure)
2. [Property Types Overview](#property-types-overview)
3. [Step-by-Step Workflow](#step-by-step-workflow)
4. [Valuation Approaches](#valuation-approaches)
5. [Multi-Scenario Evaluations](#multi-scenario-evaluations)
6. [Differences Between Property Types](#differences-between-property-types)
7. [Technical Implementation](#technical-implementation)

---

## Wizard Structure

The Evaluation Wizard consists of the following main steps:

1. **Setup** - Property type, scenario configuration, approach selection, and client selection
2. **Overview** - Property details, specifications, analysis, amenities, zoning, tax assessment, and maps
3. **Approach Pages** - Dynamic steps based on selected valuation approaches
4. **Exhibits** - Document and image uploads
5. **Review** - Final reconciliation and value determination

### Navigation Flow

```
Setup → Overview → [Dynamic Approach Steps] → Exhibits → Review
```

The approach steps are dynamically generated based on the user's selections during setup. For example, if a user selects Sales Comparison and Income approaches, only those two approach pages will appear in the wizard.

---

## Property Types Overview

### Database Tables by Property Type

| Property Type | Evaluations Table | Comps Table | Scenarios Table |
|--------------|-------------------|-------------|-----------------|
| **Commercial** | `evaluations` | `comps` | `evaluation_scenarios` |
| **Residential** | `res_evaluations` | `res_comps` | `res_evaluation_scenarios` |
| **Land** | `evaluations` | `comps` | `evaluation_scenarios` |

### Property Type Identification

**Commercial:**
- `active_type: 'building_with_land'`
- `building_size > 0`
- Used for office buildings, retail centers, industrial properties, etc.

**Residential:**
- Separate database tables (`res_evaluations`, `res_comps`)
- Contains residential-specific fields (bedrooms, bathrooms, garage, stories, etc.)
- Used for single-family homes, duplexes, triplexes, fourplexes (2-4 units)

**Land:**
- `active_type: 'land_only'`
- `building_size: 0`
- Focus on land characteristics (topography, utilities, road access, frontage)

---

## Step-by-Step Workflow

### Step 1: Setup

**Location:** 
- Commercial/Land: `packages/frontend/src/pages/evaluation/set-up/evaluation-setup.tsx`
- Residential: `packages/frontend/src/pages/evaluation/set-up/residential-setup.tsx`

**Purpose:** Configure the evaluation's basic parameters, scenarios, and approaches.

#### Fields:

1. **Evaluation Type** (Required)
   - Dropdown selection from global codes
   - Options filtered by property type (Commercial/Residential/Land)
   - Examples: Office, Retail, Industrial, Multi-Family, Residential, Land Only

2. **Valuation Scenario** (Required)
   - Users can create one or multiple scenarios
   - Each scenario must have at least one approach selected
   - Scenario names required only when creating multiple scenarios
   - Single scenario defaults to name "Primary"

3. **Approach Selection** (Required)
   - Multi-select checkboxes for different valuation approaches
   - Approaches vary by property type (see Valuation Approaches section)
   - At least one approach must be selected per scenario

4. **Client Details** (Required)
   - Select from existing clients or create new client
   - Client selection synced with localStorage

#### User Actions:
- Select evaluation type from dropdown
- Choose one or more valuation approaches via checkboxes
- Optionally create multiple scenarios with "Add More" button
- Select or create client
- Click "Save & Continue" to proceed to Overview

---

### Step 2: Overview

**Location:**
- Commercial/Land: `packages/frontend/src/pages/evaluation/overview/overview.tsx`
- Residential: `packages/frontend/src/pages/evaluation/residential/residential-overview/residential-overview.tsx`

**Purpose:** Capture comprehensive property information across multiple categories.

#### Navigation Style:
- **Left sidebar navigation** with sections:
  1. Property Details
  2. Specifications
  3. Analysis
  4. Amenities
  5. Zoning
  6. Tax Assessment
  7. Map Boundaries

- **Top dropdown** for accessing:
  - Images
  - Photo Sheet
  - Area Info
  - Map Boundaries
  - Aerial Map

#### Sections Detail:

##### 1. PROPERTY DETAILS
Fields include:
- Property Name
- Street Address, Suite, City, County, State, Zipcode
- Property Type
- Parcel ID/APN
- Year Built, Year Remodeled
- Property Rights (Fee Simple, Leasehold, etc.)
- Property Class (A, B, C, D)
- Owner of Record
- Most Likely Owner/User
- Building Size, Land Size, Land Dimensions
- Price per Square Foot
- Number of Stories

**Residential-Specific Additional Fields:**
- Bedrooms, Bathrooms
- Garage (# of cars)
- Exterior type, Roof type
- Electrical system
- Plumbing system
- Heating/Cooling system
- Windows type
- Basement type

**Land-Specific Additional Fields:**
- Land Type (from global codes)
- Topography
- Water source
- Sewer type
- Road access
- Frontage

##### 2. SPECIFICATIONS
Technical details about the property:
- Foundation type
- Construction/Structure type
- Main structure base
- Building class
- Condition
- ADA Compliance

##### 3. ANALYSIS
- Neighborhood analysis
- Market conditions
- Property strengths/weaknesses
- Highest and best use analysis

##### 4. AMENITIES
Checkbox list of property amenities:
- Pool, Spa, Tennis Court
- Fitness Center, Clubhouse
- Security Systems
- Parking facilities
- And more...

##### 5. ZONING
- Zoning classification
- Permitted uses
- Restrictions
- Variances

##### 6. TAX ASSESSMENT
- Land assessment value
- Structure assessment value
- Total tax assessment
- Tax year
- Tax liability
- Taxes in arrears

##### 7. MAP BOUNDARIES
- Interactive Google Maps integration
- Draw property boundaries
- Mark property location
- View aerial imagery
- Save boundary coordinates

#### Additional Overview Pages:

**IMAGES:**
- Drag & drop image upload
- Image reordering
- Assign images to specific report pages (Cover, Executive Summary, Property Summary, etc.)
- Set image orientation (Horizontal/Vertical)

**PHOTO SHEET:**
- Upload multiple property photos
- Add captions/descriptions
- Organize photos for report inclusion

**AREA INFO:**
- City information (rich text editor)
- County information (rich text editor)
- Wikipedia data integration for auto-populating city/county information
- Market trends tracking

**AERIAL MAP:**
- Google Maps satellite view
- Property location marking
- Boundary visualization

---

### Step 3: Approach Pages (Dynamic)

Based on the approaches selected in Step 1, users will see different approach-specific pages. Each approach page is dynamically added to the wizard navigation.

---

## Valuation Approaches

### Commercial & Land Property Approaches

Commercial and Land properties have access to **7 valuation approaches**:

#### 1. Sales Comparison Approach
- **Field:** `has_sales_approach`
- **Label:** "Sales Comparison Approach"
- **Purpose:** Value property based on recent sales of comparable properties
- **Location:** `packages/frontend/src/pages/evaluation/sales-approach/`
- **Key Features:**
  - Search and select comparable sales
  - Apply quantitative adjustments (location, size, condition, etc.)
  - Apply qualitative adjustments
  - Calculate adjusted values
  - Map view of comparables
  - Advanced filtering

**Process:**
1. Search for comparable properties in database or upload comps
2. Select 3-10 comparable properties
3. Review property characteristics
4. Make quantitative adjustments ($/SF or percentage)
5. Make qualitative adjustments (+/-/=)
6. Calculate adjusted value per SF
7. Determine indicated value

**Key Functionality:**
- Database comp search and filtering
- Map view of comparables with markers
- Upload comps from external sources
- Side-by-side comparison grid

#### 2. Cost Approach
- **Field:** `has_cost_approach`
- **Label:** "Cost Approach"
- **Purpose:** Value property based on replacement cost less depreciation
- **Location:** `packages/frontend/src/pages/evaluation/evaluation-cost-approach/`
- **Hidden For:** Land-only properties (no building to value)
- **Key Features:**
  - Subject property valuation
  - Comparable cost data
  - Depreciation calculations
  - Improvement breakdowns

**Process:**
1. Determine land value (from sales comparison or extraction)
2. Estimate replacement cost new
   - Building cost per SF
   - Site improvements cost
   - Entrepreneurial profit
3. Calculate depreciation:
   - Physical deterioration
   - Functional obsolescence
   - External obsolescence
4. Calculate: Land Value + (Replacement Cost - Depreciation) = Indicated Value

**Key Functionality:**
- Detailed improvement categories
- Multiple depreciation calculation methods
- Cost comparable analysis
- Subject property and comparable cost tracking

#### 3. Income Approach
- **Field:** `has_income_approach`
- **Label:** "Income Approach"
- **Purpose:** Value property based on income-producing capability
- **Location:** `packages/frontend/src/pages/evaluation/evaluation-income-approach/`
- **Key Features:**
  - Income sources (rental, parking, laundry, etc.)
  - Operating expenses
  - Net Operating Income (NOI) calculation
  - Capitalization rate determination

**Process:**
1. Determine Potential Gross Income (PGI)
   - Base rent
   - Additional income sources (parking, storage, amenities)
2. Subtract Vacancy & Collection Loss = Effective Gross Income (EGI)
3. Subtract Operating Expenses:
   - Property taxes
   - Insurance
   - Utilities
   - Maintenance & Repairs
   - Management fees
   - Reserves for replacement
4. Calculate Net Operating Income (NOI)
5. Apply Capitalization Rate: Value = NOI / Cap Rate

**Key Functionality:**
- Detailed income source tracking
- Operating expense categorization
- Cap rate input and calculation
- Net Operating Income (NOI) computation

#### 4. Lease Comps Approach
- **Field:** `has_lease_approach`
- **Label:** "Lease Comps"
- **Purpose:** Value property based on comparable lease rates
- **Location:** `packages/frontend/src/pages/evaluation/evaluation-lease-approach/`
- **Key Features:**
  - Lease comparable selection
  - Rental rate adjustments
  - Lease term analysis
  - Market rent determination

**Process:**
1. Search for comparable lease transactions
2. Select 3-8 lease comparables
3. Compare lease characteristics:
   - Lease rate ($/SF/month or $/SF/year)
   - Lease type (Gross, Net, Triple Net)
   - Lease term
   - Tenant improvements
   - Concessions
4. Make adjustments for differences
5. Reconcile to market rent
6. Capitalize market rent to value

**Key Functionality:**
- Lease comparable search and selection
- Rental rate adjustments
- Lease term comparison
- Market rent analysis

#### 5. Cap Rate Comps Approach
- **Field:** `has_cap_approach`
- **Label:** "Cap Rate Comps"
- **Purpose:** Extract capitalization rates from comparable sales
- **Location:** `packages/frontend/src/pages/evaluation/evaluation-cap-rate-approach/`
- **Hidden For:** Land-only properties
- **Key Features:**
  - Sales with income data
  - Cap rate extraction
  - Market cap rate determination
  - Band of Investment analysis

**Process:**
1. Search for comparable sales with income data
2. Select 3-10 income-producing sales
3. Extract cap rate from each: Cap Rate = NOI / Sale Price
4. Analyze cap rate factors:
   - Property type
   - Location quality
   - Property condition
   - Tenant quality
   - Lease terms
5. Reconcile to subject cap rate
6. Apply to subject NOI: Value = NOI / Cap Rate

**Key Functionality:**
- Direct cap rate extraction from sales
- Income-producing property comparison
- Cap rate calculation (NOI / Sale Price)
- Market cap rate determination

#### 6. Multi-Family Approach
- **Field:** `has_multi_family_approach`
- **Label:** "Multi-Family"
- **Purpose:** Specialized approach for apartment complexes using Gross Rent Multiplier (GRM)
- **Location:** `packages/frontend/src/pages/evaluation/evaluation-multi-family-approach/`
- **Hidden For:** Land-only properties
- **Key Features:**
  - Unit mix analysis
  - GRM calculation
  - Per-unit valuation
  - Occupancy analysis

**Process:**
1. Determine subject's rent roll:
   - Unit type mix (studio, 1BR, 2BR, 3BR)
   - Current rents per unit type
   - Occupancy rates
2. Calculate Monthly Gross Income (MGI)
3. Select comparable multi-family sales
4. Extract GRM from comps: GRM = Sale Price / Monthly Gross Income
5. Apply to subject: Value = Subject MGI × Market GRM
6. Alternative: Value = # Units × Price per Unit

**Key Functionality:**
- Unit mix analysis by bedroom count
- GRM calculation from comparables
- Occupancy tracking
- Per-unit and per-SF metrics

#### 7. Rent Roll Approach
- **Field:** `has_rent_roll_approach`
- **Label:** "Rent Roll"
- **Purpose:** Detailed unit-by-unit income analysis for multi-tenant properties
- **Hidden For:** Land-only properties
- **Key Features:**
  - Unit-by-unit rent tracking
  - Lease expiration analysis
  - In-place vs. market rent
  - Rollover risk assessment

**Process:**
1. Import or enter detailed rent roll:
   - Tenant name
   - Unit/suite number
   - Square footage
   - Monthly rent
   - Lease start/end dates
   - Security deposits
2. Compare in-place rents to market rents
3. Project lease rollover
4. Calculate stabilized income
5. Apply to income approach methodology

**Key Functionality:**
- Unit-by-unit rent entry
- Lease date tracking
- In-place vs. market rent comparison
- Income stabilization calculation

---

### Residential Property Approaches

Residential properties have access to **3 valuation approaches**:

#### 1. Sales Comparison Approach (Residential)
- **Field:** `has_sales_approach`
- **Label:** "Sales Comparison Approach"
- **Location:** `packages/frontend/src/pages/evaluation/residential/residential-sales-approach/`
- **Purpose:** Value property based on recent sales of comparable residential properties

**Process:** Similar to commercial but with residential-specific fields:
1. Select comparable residential sales (3-6 typically)
2. Compare characteristics:
   - Bedrooms, Bathrooms
   - Square footage
   - Lot size
   - Age/Condition
   - Garage
   - Basement
   - Location
3. Make adjustments for differences
4. Reconcile to indicated value

**Residential-Specific Adjustments:**
- Per bedroom (+/- $X,000)
- Per bathroom (+/- $X,000)
- Garage adjustment
- Basement finished/unfinished
- Pool, deck, patio
- Updates/renovations

#### 2. Cost Approach (Residential)
- **Field:** `has_cost_approach`
- **Label:** "Cost Approach"
- **Location:** `packages/frontend/src/pages/evaluation/residential/residential-cost-approach/`
- **Purpose:** Value based on replacement cost for residential structures

**Process:**
1. Estimate land value (from comparable land sales)
2. Estimate dwelling replacement cost:
   - Square footage × cost per SF by quality class
   - Garage cost
   - Other improvements (deck, pool, etc.)
3. Estimate depreciation:
   - Age-life method
   - Physical deterioration
   - Functional obsolescence
4. Calculate: Land Value + (Replacement Cost - Depreciation)

**Residential-Specific Features:**
- Quality class adjustment (Economy, Average, Custom, Luxury)
- Effective age vs. actual age
- Detached improvements valuation

#### 3. Income Approach (Residential)
- **Field:** `has_income_approach`
- **Label:** "Income Approach"
- **Location:** `packages/frontend/src/pages/evaluation/residential/residential-income-approach/`
- **Purpose:** Value based on rental income potential for investment properties

**Process:**
1. Determine market rent (from rental comps)
2. Estimate Potential Gross Income
3. Subtract vacancy (typically 5-8% for residential)
4. Subtract operating expenses:
   - Property taxes
   - Insurance
   - Maintenance
   - Management (typically 8-10% of gross)
5. Calculate NOI
6. Apply residential cap rate or GRM

**Residential-Specific Considerations:**
- Lower cap rates than commercial (typically 4-8%)
- Higher management % than commercial
- Tenant turnover costs
- Furnished vs. unfurnished

---

### Approaches NOT Available for Residential

The following approaches are **disabled** for residential properties:

- ❌ Lease Comps Approach
- ❌ Cap Rate Comps Approach
- ❌ Multi-Family Approach (unless 5+ units)
- ❌ Rent Roll Approach

**Why?** Residential properties (1-4 units) typically don't have:
- Commercial lease structures
- Sufficient income data for cap rate analysis
- Multiple units requiring rent roll analysis

---

### Approach Visibility Logic

```typescript
// Commercial/Land (7 approaches)
const commercialApproaches = [
  'Sales Comparison',
  'Cost Approach',        // Hidden if land_only
  'Income Approach',
  'Lease Comps',
  'Cap Rate Comps',       // Hidden if land_only
  'Multi-Family',         // Hidden if land_only
  'Rent Roll'             // Hidden if land_only
];

// Residential (3 approaches)
const residentialApproaches = [
  'Sales Comparison',
  'Cost Approach',
  'Income Approach'
];

// Land Only (4 approaches)
const landOnlyApproaches = [
  'Sales Comparison',
  'Income Approach',      // For income-producing land
  'Lease Comps',          // For ground leases
  'Rent Roll'             // For leased land
];
```

---

## Multi-Scenario Evaluations

### What are Scenarios?

Scenarios allow users to value the same property under different conditions or assumptions within a single evaluation report. This is particularly useful for development projects or properties undergoing changes.

### Common Scenario Types

1. **As-Is** - Current condition, no assumptions
2. **As-Completed** - After planned construction/improvements
3. **As-Stabilized** - After completion and reaching stabilized occupancy
4. **As-Renovated** - After completing specific improvements
5. **Prospective** - Future value at specified date
6. **Retrospective** - Historical value
7. **Hypothetical Condition** - Under assumed conditions

### Scenario Configuration

Users can create multiple scenarios in the Setup step:

**Single Scenario (Default):**
- One valuation under current conditions
- Scenario name defaults to "Primary"
- Simplest and most common use case

**Dual Scenario Example:**
```
Scenario 1: As-Is Value
  ✓ Sales Comparison Approach
  ✓ Cost Approach
  
Scenario 2: As-Completed Value
  ✓ Sales Comparison Approach
  ✓ Cost Approach
  ✓ Income Approach
```

**Triple Scenario Example:**
```
Scenario 1: As-Is
  ✓ Sales Comparison Approach
  
Scenario 2: As-Stabilized
  ✓ Income Approach
  ✓ Sales Comparison Approach
  
Scenario 3: As-Completed
  ✓ Income Approach
  ✓ Sales Comparison Approach
  ✓ Cost Approach
```

### Data Flow with Multiple Scenarios

1. **Setup:** User creates scenarios and selects approaches for each
2. **Overview:** Property details entered once (shared across scenarios)
3. **Approach Pages:** User completes approaches for each scenario separately
4. **Review:** Reconcile values for each scenario independently

### Database Storage

**Commercial/Land:**
- Table: `evaluation_scenarios`
- Fields: `evaluation_id`, `name`, `has_*_approach`, `weighted_market_value`

**Residential:**
- Table: `res_evaluation_scenarios`
- Fields: `res_evaluation_id`, `name`, `has_*_approach`, `weighted_market_value`

Each scenario tracks:
- Which approaches are enabled
- The final weighted market value
- Rounding preferences

---

## Differences Between Property Types

### Commercial vs. Residential vs. Land

| Feature | Commercial | Residential | Land |
|---------|-----------|-------------|------|
| **Database Tables** | `evaluations` | `res_evaluations` | `evaluations` |
| **Available Approaches** | 7 approaches | 3 approaches | 4 approaches |
| **Multi-Family Approach** | ✅ Yes | ❌ No | ❌ No |
| **Lease/Cap Rate Approaches** | ✅ Yes | ❌ No | ✅ Yes (Lease only) |
| **Cost Approach** | ✅ Yes | ✅ Yes | ❌ No (no building) |
| **Residential Fields** | ❌ No | ✅ Yes (beds/baths/garage) | ❌ No |
| **Land-Specific Fields** | Limited | ❌ No | ✅ Yes (topography/utilities) |
| **Unit Mix Analysis** | ✅ Yes | ❌ No | ❌ No |
| **Rent Roll** | ✅ Yes | ❌ No | ✅ Limited |

### Field Differences

**Fields ONLY in Residential:**
```typescript
- bedrooms: number
- bathrooms: number
- garage: number (car capacity)
- basement: string (Finished/Unfinished/None)
- stories: number
- exterior: string (Brick, Vinyl, Stucco, etc.)
- roof: string (Asphalt, Tile, Metal, etc.)
- electrical: string (100 amp, 200 amp, etc.)
- plumbing: string (Copper, PEX, etc.)
- heating_cooling: string (Central AC, Heat Pump, etc.)
- windows: string (Double-pane, Single-pane, etc.)
```

**Fields ONLY in Land/Commercial:**
```typescript
- land_type: string (Residential, Commercial, Industrial, etc.)
- topography: string (Level, Sloped, Hillside, etc.)
- water_source: string (Municipal, Well, None)
- sewer_type: string (Public, Septic, None)
- road_access: string (Paved, Gravel, Dirt)
- frontage: number (feet of street frontage)
```

**Shared Fields:**
```typescript
- property_name: string
- street_address: string
- city, county, state, zipcode: string
- building_size: number (0 for land-only)
- land_size: number
- year_built: number
- condition: string
- property_class: string
- parcel_id_apn: string
```

---

## Step 4: Exhibits

**Location:**
- Commercial/Land: `packages/frontend/src/pages/evaluation/evaluation-exhibits/`
- Residential: `packages/frontend/src/pages/evaluation/residential/residential-exhibits/`

**Purpose:** Upload supporting documents and exhibits for the evaluation report.

### Features:
- Drag & drop file upload
- Multiple file types supported (PDF, JPG, PNG, Excel, Word)
- Organize exhibits by category
- Add descriptions/captions
- Reorder exhibits
- Delete exhibits

### Common Exhibit Types:
- Zoning letters/maps
- Environmental reports
- Survey documents
- Title reports
- Lease agreements
- Building plans/specifications
- Property photos (additional beyond photo sheet)
- Market reports

---

## Step 5: Review

**Location:**
- Commercial/Land: `packages/frontend/src/pages/evaluation/evaluation-review/evaluation-review.tsx`
- Residential: `packages/frontend/src/pages/evaluation/residential/residential-review/residential-review.tsx`

**Purpose:** Final reconciliation of all approaches and determination of final value opinion.

### Features:

1. **Approach Summary Table**
   - Lists all completed approaches
   - Shows indicated value from each approach
   - Allows assigning weights to each approach

2. **Reconciliation**
   - Apply percentage weights to each approach (must total 100%)
   - Calculate weighted average value
   - Rounding options (to nearest $1,000, $5,000, $10,000, etc.)

3. **Final Value Opinion**
   - Display final reconciled value
   - Add reconciliation comments/narrative
   - Explain reasoning for weights assigned

4. **Multi-Scenario Review**
   - Separate reconciliation for each scenario
   - Compare scenario values
   - Value variance analysis

### Example Reconciliation:

**Single Scenario:**
```
Sales Comparison Approach:  $2,450,000  →  Weight: 50%  =  $1,225,000
Cost Approach:              $2,380,000  →  Weight: 20%  =    $476,000
Income Approach:            $2,500,000  →  Weight: 30%  =    $750,000
                                         _______________
Weighted Average:                                         $2,451,000
Rounded To:                                               $2,450,000
```

**Multi-Scenario:**
```
Scenario 1 (As-Is):           $2,450,000
Scenario 2 (As-Completed):    $3,200,000
Scenario 3 (As-Stabilized):   $3,450,000

Value Increase from As-Is to As-Stabilized: $1,000,000 (41%)
```

---

## Technical Implementation

### File Structure

```
packages/frontend/src/pages/evaluation/
├── set-up/
│   ├── evaluation-setup.tsx              # Commercial/Land setup
│   ├── residential-setup.tsx             # Residential setup
│   └── components/
│       ├── ApproachCheckbox.tsx
│       ├── ScenarioItem.tsx
│       └── ClientSection.tsx
├── overview/
│   ├── overview.tsx                      # Main overview page
│   ├── evaluation-overview-sidebar.tsx   # Section navigation
│   ├── evaluation-property-details.tsx
│   ├── evaluation-specification.tsx
│   ├── evaluation-analysis.tsx
│   ├── evaluation-amenities.tsx
│   ├── evaluation-zoning.tsx
│   ├── evaluation-tax-assessment.tsx
│   └── evaluation-map-boundaries.tsx
├── sales-approach/
│   └── evaluation-sales-approach.tsx
├── evaluation-cost-approach/
│   └── evaluation-cost-approach.tsx
├── evaluation-income-approach/
│   └── index.tsx
├── evaluation-lease-approach/
│   └── ...
├── evaluation-cap-rate-approach/
│   └── ...
├── evaluation-multi-family-approach/
│   └── ...
├── evaluation-exhibits/
│   └── ...
├── evaluation-review/
│   └── evaluation-review.tsx
└── residential/
    ├── residential-overview/
    ├── residential-sales-approach/
    ├── residential-cost-approach/
    ├── residential-income-approach/
    ├── residential-exhibits/
    └── residential-review/
```

### Key Components

**Setup Configuration:**
```typescript
// packages/frontend/src/components/modals/evaluation-approach-config.ts

export const getApproachOptions = (activeType: string | null) => {
  return [
    { key: 'has_sales_approach', label: 'Sales Comparison Approach' },
    { key: 'has_cost_approach', label: 'Cost Approach', hide: activeType === 'land_only' },
    { key: 'has_income_approach', label: 'Income Approach' },
    { key: 'has_multi_family_approach', label: 'Multi-Family', hide: activeType === 'land_only' },
    { key: 'has_cap_approach', label: 'Cap Rate Comps', hide: activeType === 'land_only' },
    { key: 'has_lease_approach', label: 'Lease Comps' },
  ];
};
```

**Navigation Logic:**
```typescript
// packages/frontend/src/pages/evaluation/overview/utils/navigation.ts

export const findNextRoute = (scenarios: any[], id: string | null) => {
  // Priority order for approach navigation
  const forwardApproachChecks = [
    { key: 'has_income_approach', route: '/evaluation-income-approach' },
    { key: 'has_cap_approach', route: '/evaluation-cap-approach' },
    { key: 'has_multi_family_approach', route: '/evaluation-multi-family-approach' },
  ];
  
  const backwardApproachChecks = [
    { key: 'has_sales_approach', route: '/evaluation-sales-approach' },
    { key: 'has_lease_approach', route: '/evaluation-lease-approach' },
    { key: 'has_cost_approach', route: '/evaluation-cost-approach' },
  ];
  
  // Navigate to first enabled approach, or exhibits if none
};
```

### Database Schema

**Commercial/Land Scenario:**
```typescript
// packages/backend/src/models/evaluation_scenario.sequelize.ts

interface EvaluationScenario {
  id: number;
  evaluation_id: number;
  name: string;
  has_income_approach: boolean;
  has_lease_approach: boolean;
  has_cap_approach: boolean;
  has_multi_family_approach: boolean;
  has_rent_roll_approach: boolean;
  has_sales_approach: boolean;
  has_cost_approach: boolean;
  weighted_market_value: number;
  rounding: number;
}
```

**Residential Scenario:**
```typescript
// packages/backend/src/models/res_evaluation_scenario.sequelize.ts

interface ResEvaluationScenario {
  id: number;
  res_evaluation_id: number;
  name: string;
  has_income_approach: boolean;
  has_sales_approach: boolean;
  has_cost_approach: boolean;
  weighted_market_value: number;
  rounding: number;
}
```

### API Endpoints

**Setup:**
- `POST /api/evaluations/save-setup` - Save commercial/land evaluation setup
- `POST /api/res-evaluations/save-setup` - Save residential evaluation setup

**Overview:**
- `PATCH /api/evaluations/update-overview/:id` - Update overview data
- `GET /api/evaluations/:id` - Fetch evaluation data

**Approaches:**
- `POST /api/evaluations/sales-approach` - Save sales approach
- `POST /api/evaluations/cost-approach` - Save cost approach
- `POST /api/evaluations/income-approach` - Save income approach
- Similar endpoints for lease, cap, multi-family approaches

**Review:**
- `POST /api/evaluations/reconciliation` - Save final reconciliation
- `PATCH /api/evaluations/update-value/:id` - Update final value opinion

---

## Validation & Business Rules

### Setup Validation

1. **Evaluation Type:** Must be selected (required)
2. **Scenarios:** 
   - At least one scenario must exist
   - Each scenario must have at least one approach selected
   - Scenario names must be unique (if multiple scenarios)
   - Single scenario can have empty name (defaults to "Primary")
3. **Client:** Must be selected (required)

### Overview Validation

1. **Property Details:**
   - Property name required
   - Address required (street, city, state, zip)
   - Building size required (except land-only can be 0)
   - Land size required

2. **Residential-Specific:**
   - Bedrooms must be > 0
   - Bathrooms must be > 0
   - Stories must be > 0

3. **Commercial-Specific:**
   - Building size must be > 0 (unless land-only)
   - Property class required

### Approach Validation

1. **Sales Comparison:**
   - Minimum 3 comparables required
   - All adjustments must have values or be marked N/A
   - Final adjusted values must be calculated

2. **Cost Approach:**
   - Land value required
   - Replacement cost required
   - Depreciation percentage required (0-100%)

3. **Income Approach:**
   - At least one income source required
   - Operating expenses must be entered
   - Cap rate required (> 0 and < 100%)

### Review Validation

1. **Weights:**
   - Must sum to exactly 100%
   - Each approach must have weight > 0%
2. **Final Value:**
   - Must be > 0
   - Must include reconciliation narrative

---

## User Experience Features

### Data Persistence
- Form data saved on submission
- Draft evaluations can be saved and resumed
- Validation before proceeding to next step

### Navigation
- Top menu bar showing evaluation type and location
- Current step highlighted in navigation menu
- Direct navigation to completed sections
- "Save & Continue" button to proceed to next step
- Direct navigation via menu options
- Dynamic routing based on selected approaches

### Smart Defaults
- Property type pre-filters approaches
- Land-only hides building-related approaches
- Single scenario doesn't require scenario name
- Client selection persists across session

### Responsive Design
- Adaptive layout for different screen sizes
- Scrollable content areas
- Collapsible sidebars
- Touch-friendly controls

---

## Common Use Cases

### Case 1: Simple Residential Evaluation
```
1. Setup: Select "Residential" type, Sales Comparison approach, client
2. Overview: Enter property details (3 bed, 2 bath, 1,800 SF)
3. Sales Approach: Select 5 comparable sales, make adjustments
4. Exhibits: Upload photos
5. Review: 100% weight to Sales Comparison = $425,000
```

### Case 2: Commercial Office Building
```
1. Setup: Select "Office" type, all 3 income approaches (Income, Sales, Cost), client
2. Overview: Enter property details (25,000 SF, 3 stories)
3. Income Approach: Enter rent roll, expenses, cap rate = $3,500,000
4. Sales Approach: Select 8 comparable sales = $3,450,000
5. Cost Approach: Replacement cost less depreciation = $3,200,000
6. Exhibits: Upload leases, rent roll, environmental report
7. Review: 
   - Income: 50% → $1,750,000
   - Sales: 40% → $1,380,000
   - Cost: 10% → $320,000
   - Total: $3,450,000 (rounded)
```

### Case 3: Development Project (Multi-Scenario)
```
1. Setup: 
   - Scenario 1: "As-Is" → Sales Comparison
   - Scenario 2: "As-Completed" → Sales Comparison, Cost, Income
   - Client selection
2. Overview: Enter current property details
3. Sales Approach (As-Is): Comparable land sales = $1,200,000
4. Sales Approach (As-Completed): Improved property sales = $4,500,000
5. Cost Approach (As-Completed): Land + Construction = $4,200,000
6. Income Approach (As-Completed): NOI capitalized = $4,800,000
7. Review:
   - Scenario 1 (As-Is): $1,200,000
   - Scenario 2 (As-Completed): $4,500,000 (weighted average)
   - Development profit: $3,300,000 (275% increase)
```

### Case 4: Land-Only Valuation
```
1. Setup: 
   - Property type: Land
   - Active type: land_only
   - Approach: Sales Comparison (only approach needed)
   - Client
2. Overview: 
   - Enter land details (10 acres, topography, utilities, zoning)
   - No building size
   - Land characteristics emphasized
3. Sales Approach: 
   - Select comparable land sales
   - Adjust for size, location, zoning, utilities
   - Calculate value per acre
4. Review: Final value per acre × acres = Total Value
```

---

## Troubleshooting

### Common Issues

**Issue:** "Can't proceed from Setup - no approaches selected"
- **Solution:** Check at least one approach checkbox for each scenario

**Issue:** "Client dropdown is empty"
- **Solution:** Click "Add New Client" button to create a client first

**Issue:** "Can't save Overview - missing required fields"
- **Solution:** Check for red asterisks (*) indicating required fields

**Issue:** "Approach page not appearing in navigation"
- **Solution:** Verify approach was selected in Setup step for current scenario

**Issue:** "Can't complete Review - weights don't add to 100%"
- **Solution:** Adjust approach weights to sum exactly to 100%

---

## Conclusion

The Evaluation Wizard provides a comprehensive, user-friendly workflow for creating professional property evaluations across all property types. Its modular approach system, multi-scenario support, and type-specific configurations make it flexible enough to handle simple residential evaluations to complex commercial development projects.

Key takeaways:
- **Property type determines available approaches** (7 for Commercial/Land, 3 for Residential)
- **Scenarios enable multiple valuations** within one evaluation
- **Each approach has specific purpose** and methodology
- **Wizard guides users step-by-step** from setup to final value opinion
- **Separation of concerns** between property types (separate tables, separate components)

---

## Quick Reference

### Property Type → Approaches Available

| Property Type | Sales | Cost | Income | Lease | Cap | Multi-Family | Rent Roll |
|--------------|-------|------|--------|-------|-----|--------------|-----------|
| Commercial   | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Residential  | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Land         | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |

### Wizard Step Order

```
Setup → Overview → Approaches* → Exhibits → Review
                    (*dynamic based on selections)
```

### API Endpoints Quick Reference

- Setup: `POST /api/evaluations/save-setup` or `/api/res-evaluations/save-setup`
- Overview: `PATCH /api/evaluations/update-overview/:id`
- Approaches: `POST /api/evaluations/{approach-type}`
- Review: `POST /api/evaluations/reconciliation`

---

**Document Version:** 1.0  
**Last Updated:** November 4, 2025  
**Maintained By:** Development Team

