# Appraisal Approaches: Adjustment Fields Analysis
**Complete Breakdown of Current vs. Industry Standard**

---

**Document Version:** 1.0  
**Date:** November 4, 2025  
**Purpose:** Comprehensive analysis of adjustment dropdown fields across all appraisal approaches  
**Audience:** Development Team, Business Owners, Appraisers

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Sales Comparison Approach](#1-sales-comparison-approach)
3. [Cost Approach](#2-cost-approach)
4. [Income Approach](#3-income-approach)
5. [Lease Comps Approach](#4-lease-comps-approach)
6. [Cap Rate Comps Approach](#5-cap-rate-comps-approach)
7. [Multi-Family/GRM Approach](#6-multi-familygrm-approach)
8. [Rent Roll Approach](#7-rent-roll-approach)
9. [Summary Comparison Table](#summary-comparison-table)
10. [Implementation Recommendations](#implementation-recommendations)

---

## Executive Summary

This document provides a detailed analysis of adjustment fields (dropdowns) used in each appraisal approach within the Harken system. Each section compares:

- **Current Implementation:** What adjustment fields exist in the codebase today
- **Industry Standard:** What SHOULD exist according to USPAP and appraisal best practices
- **Gap Analysis:** Missing critical fields and incorrect implementations
- **Recommendations:** Specific changes needed for compliance and accuracy

### Key Findings

| Approach | Should Have Adjustments? | Current Status | Action Required |
|----------|--------------------------|----------------|-----------------|
| **Sales Comparison** | ✅ YES (8-12 fields) | ⚠️ Partial (14 fields) | Refine and consolidate |
| **Cost Approach** | ❌ NO (Depreciation only) | ❌ WRONG (Uses adjustments) | **Critical Fix Required** |
| **Income Approach** | ❌ NO (Direct calculation) | ✅ CORRECT | No changes needed |
| **Lease Comps** | ⚠️ LIMITED (6-8 fields) | ⚠️ Partial | Add lease-specific fields |
| **Cap Rate Comps** | ⚠️ RISK FACTORS (5-7 fields) | ⚠️ Partial | Add risk adjustments |
| **Multi-Family/GRM** | ⚠️ SPECIALIZED (8-10 fields) | ⚠️ Partial | Add GRM calculations |
| **Rent Roll** | ❌ NO (Direct analysis) | ✅ CORRECT | No changes needed |

---

## 1. Sales Comparison Approach

### Overview
The Sales Comparison Approach values a property by comparing it to similar properties (comparables/comps) that have recently sold. Adjustments are made TO the comparable, FOR differences from the subject property.

### ✅ Adjustment Fields ARE Appropriate
This is the PRIMARY approach where dropdown adjustments are correct and necessary.

---

### Current Implementation - Residential

**File:** `packages/frontend/src/utils/staticCompData.ts`

```javascript
export const residentialCompFields = [
  { adj_key: 'time', adj_value: '$0.00', appraisal_default: true },
  { adj_key: 'location', adj_value: '$0.00', appraisal_default: true },
  { adj_key: 'gross_living_area_sf', adj_value: '$0.00', appraisal_default: true },
  { adj_key: 'basement', adj_value: '$0.00', appraisal_default: true },
  { adj_key: 'land_size', adj_value: '$0.00', appraisal_default: true },
  { adj_key: 'year_built', adj_value: '$0.00', appraisal_default: true },
  { adj_key: 'bedrooms', adj_value: '$0.00', appraisal_default: true },
  { adj_key: 'bathrooms', adj_value: '$0.00', appraisal_default: true },
  { adj_key: 'garage', adj_value: '$0.00', appraisal_default: true },
  { adj_key: 'heating_and_cooling', adj_value: '$0.00', appraisal_default: true },
  { adj_key: 'fencing', adj_value: '$0.00', appraisal_default: true },
  { adj_key: 'fireplace', adj_value: '$0.00', appraisal_default: true },
  { adj_key: 'other_amenities', adj_value: '$0.00', appraisal_default: true },
  { adj_key: 'condition', adj_value: '$0.00', appraisal_default: true }
];

// Total: 14 adjustment fields
```

---

### Current Implementation - Commercial

**File:** `packages/frontend/src/utils/comps-property-comparitive.attributes.tsx`

| Field Name | Type | Purpose | Status |
|------------|------|---------|--------|
| `property_type` | Display/Adjustment | Property classification | ✅ Required |
| `building_size_land_size` | Display/Adjustment | Size comparison | ✅ Required |
| `street_address` | Display Only | Property identification | ℹ️ Display |
| `city_state` | Display Only | Location info | ℹ️ Display |
| `date_sold` | Display Only | Sale date | ℹ️ Display |
| `year_built_year_remodeled` | Display Only | Age info | ℹ️ Display |
| `sale_price` | Display Only | Transaction price | ℹ️ Display |
| `price_per_sf` | Display Only | Unit pricing | ℹ️ Display |
| `quality_condition` | Display Only | Property quality | ℹ️ Display |
| `highest_best_use` | Optional Adjustment | Use analysis | ⚠️ Optional |
| `topography` | Adjustment | Land features | ✅ Land-specific |
| `zoning_type` | Adjustment | Legal use | ✅ Required |
| `utilities_select` | Adjustment | Infrastructure | ✅ Land-specific |
| `frontage` | Adjustment | Access | ✅ Land-specific |
| `parking` | Adjustment | Parking spaces/ratio | ✅ Commercial |

---

### Industry Standard - What SHOULD Exist

#### A. RESIDENTIAL Sales Comparison

| Category | Adjustment Field | Description | Priority | Currently Exists? |
|----------|------------------|-------------|----------|-------------------|
| **TRANSACTIONAL ADJUSTMENTS** ||||
| | `financing_terms` | Cash vs. financed, seller concessions | 🔴 HIGH | ❌ MISSING |
| | `conditions_of_sale` | Arm's length, distressed, family transfer | 🔴 HIGH | ❌ MISSING |
| | `time_market_conditions` | Market appreciation/depreciation | 🔴 HIGH | ✅ EXISTS (as 'time') |
| **PROPERTY ADJUSTMENTS** ||||
| | `location` | Neighborhood, school district, amenities | 🔴 HIGH | ✅ EXISTS |
| | `site_land_size` | Lot size, usability | 🔴 HIGH | ✅ EXISTS (as 'land_size') |
| | `gross_living_area` | Above-grade square footage | 🔴 HIGH | ✅ EXISTS |
| | `quality_condition` | Construction quality + current condition | 🔴 HIGH | ✅ EXISTS (as 'condition') |
| | `age` | Actual age or effective age | 🔴 HIGH | ✅ EXISTS (as 'year_built') |
| | `bedrooms` | Bedroom count | 🟡 MEDIUM | ✅ EXISTS |
| | `bathrooms` | Bathroom count | 🟡 MEDIUM | ✅ EXISTS |
| | `basement` | Basement size, finish level | 🟡 MEDIUM | ✅ EXISTS |
| | `garage_parking` | Garage spaces, carport | 🟡 MEDIUM | ✅ EXISTS (as 'garage') |
| | `heating_cooling` | HVAC system type/quality | 🟡 MEDIUM | ✅ EXISTS |
| | `amenities` | Fireplace, pool, deck, etc. | 🟢 LOW | ✅ EXISTS (fireplace, other_amenities) |
| | `fencing` | Fencing type/quality | 🟢 LOW | ⚠️ Should combine with amenities |

**Total Recommended:** 12 core adjustment fields  
**Currently Implemented:** 14 fields  
**Missing Critical:** 2 fields (financing_terms, conditions_of_sale)  
**Redundant/Optional:** 1 field (fencing - combine with other_amenities)

---

#### B. COMMERCIAL Sales Comparison

| Category | Adjustment Field | Description | Priority | Currently Exists? |
|----------|------------------|-------------|----------|-------------------|
| **TRANSACTIONAL ADJUSTMENTS** ||||
| | `financing_terms` | Cash, seller financing, assumption | 🔴 HIGH | ❌ MISSING |
| | `conditions_of_sale` | Market, non-market, distressed | 🔴 HIGH | ❌ MISSING |
| | `property_rights` | Fee simple, leasehold, easements | 🔴 HIGH | ❌ MISSING |
| | `time_market_conditions` | Market changes over time | 🔴 HIGH | ❌ MISSING |
| **PROPERTY ADJUSTMENTS** ||||
| | `location` | Submarket, visibility, access | 🔴 HIGH | ⚠️ Shown but no explicit adjustment |
| | `size_building` | Building square footage | 🔴 HIGH | ✅ EXISTS |
| | `size_land` | Land size, shape, usability | 🔴 HIGH | ✅ EXISTS |
| | `quality_condition` | Construction quality + condition | 🔴 HIGH | ✅ EXISTS |
| | `age_effective_age` | Year built, remodeling | 🔴 HIGH | ⚠️ Shown but unclear adjustment |
| | `functional_utility` | Layout, design efficiency | 🟡 MEDIUM | ❌ MISSING |
| | `parking_ratio` | Spaces per 1,000 SF | 🟡 MEDIUM | ✅ EXISTS (as 'parking') |
| | `zoning` | Zoning classification | 🟡 MEDIUM | ✅ EXISTS |
| **PROPERTY-TYPE SPECIFIC** ||||
| | `ceiling_height` | Clear height (industrial/warehouse) | 🟡 MEDIUM | ❌ MISSING |
| | `loading_docks` | Dock doors, drive-in doors | 🟡 MEDIUM | ❌ MISSING |
| | `office_percentage` | Office finish % (flex/industrial) | 🟡 MEDIUM | ❌ MISSING |
| | `column_spacing` | Bay depth (industrial) | 🟢 LOW | ❌ MISSING |

**Total Recommended:** 10-15 fields (varies by property type)  
**Missing Critical:** 4 transactional fields  
**Missing Property-Specific:** 4 fields for specialized property types

---

### Analysis & Recommendations

#### ✅ What's Working Well
1. **Comprehensive property adjustments** for residential (bedrooms, bathrooms, basement, etc.)
2. **Correct adjustment structure** using `adj_key` and `adj_value`
3. **Property-type specific fields** (topography, utilities for land)

#### ❌ Critical Gaps
1. **No transactional adjustments** (financing, conditions of sale, property rights)
2. **Missing property-type specific fields** for commercial (ceiling height, loading docks)
3. **No clear location adjustment mechanism** for commercial properties

#### 📋 Recommended Changes

**Add These Fields:**

```javascript
// RESIDENTIAL - Add to residentialCompFields
export const residentialCompFields = [
  // ADD THESE TWO CRITICAL FIELDS:
  { adj_key: 'financing_terms', adj_value: '$0.00', appraisal_default: true },
  { adj_key: 'conditions_of_sale', adj_value: '$0.00', appraisal_default: true },
  
  // EXISTING FIELDS (keep as-is)
  { adj_key: 'time', adj_value: '$0.00', appraisal_default: true },
  { adj_key: 'location', adj_value: '$0.00', appraisal_default: true },
  // ... rest of existing fields
  
  // CONSOLIDATE THESE:
  // Remove 'fencing' as separate field, combine into 'other_amenities'
];

// COMMERCIAL - Add property-type conditional fields
export const getCommercialAdjustments = (propertyType: string) => {
  const baseFields = [
    'financing_terms',         // NEW - CRITICAL
    'conditions_of_sale',      // NEW - CRITICAL
    'property_rights',         // NEW - CRITICAL
    'time_market_conditions',  // NEW - CRITICAL
    'location',
    'size_building',
    'size_land',
    'quality_condition',
    'age_effective_age',
    'parking_ratio',
    'zoning'
  ];
  
  // Add property-specific fields
  if (propertyType === 'Industrial' || propertyType === 'Warehouse') {
    baseFields.push('ceiling_height', 'loading_docks', 'column_spacing');
  }
  
  if (propertyType === 'Flex' || propertyType === 'Industrial') {
    baseFields.push('office_percentage');
  }
  
  return baseFields;
};
```

---

## 2. Cost Approach

### Overview
The Cost Approach estimates value by calculating the cost to replace or reproduce the property improvements, MINUS depreciation, PLUS land value.

### ❌ Adjustment Fields Should NOT Exist
**This is the CRITICAL ERROR in current implementation**

---

### Current Implementation - WRONG

**File:** `packages/frontend/src/pages/appraisal/overview/cost/cost-approach.tsx`

Currently uses the SAME adjustment structure as Sales Comparison Approach:

```javascript
// From cost comp schema
costCompSchema = {
  comp_id: number,
  order: number,
  total_adjustment: number,      // ❌ WRONG - Cost doesn't adjust comps
  adjusted_psf: number,          // ❌ WRONG - Cost uses replacement cost
  weight: number,                // ✅ Correct - for averaging
  comps_adjustments: [           // ❌ WRONG STRUCTURE
    { adj_key: string, adj_value: number }
  ]
};

// Uses same adjustments: time, location, condition (percentage-based)
```

**Observed in Code:**
```javascript
// Line 340-341 in cost-approach.tsx
const newValue = c.comps_adjustments.find(
  (adj: { adj_key: any }) => adj.adj_key === oe.adj_key
);
```

This shows cost approach is incorrectly using comp adjustments!

---

### Industry Standard - What SHOULD Exist

| Component | Type | Description | Should Have Dropdowns? |
|-----------|------|-------------|------------------------|
| **LAND VALUE** | Input Field | Value of land as if vacant | ❌ NO - from sales comparison of land |
| **REPLACEMENT COST NEW** | Calculation | Current cost to build | ❌ NO - from cost manuals |
| **DEPRECIATION** | Breakdown | Loss in value from all causes | ❌ NO - calculated amounts |
| **INDICATED VALUE** | Formula | Land + (Cost - Depreciation) | ❌ NO - auto-calculated |

#### Proper Cost Approach Structure

```javascript
// CORRECT IMPLEMENTATION - NO ADJUSTMENTS!

interface CostApproachInputs {
  // LAND VALUE (from Sales Comparison of vacant land)
  land_value: number;
  
  // REPLACEMENT COST NEW
  improvements: [
    {
      improvement_type: string,    // Building, Site Improvements, etc.
      description: string,
      size_sf: number,
      cost_per_sf: number,         // From Marshall & Swift, RS Means
      total_cost: number           // size_sf × cost_per_sf
    }
  ];
  overall_replacement_cost: number;  // Sum of all improvements
  
  // DEPRECIATION (NOT adjustments!)
  depreciation: {
    // 1. PHYSICAL DETERIORATION
    physical_deterioration: {
      curable: number,              // Deferred maintenance (fixable)
      incurable_short_lived: number, // Systems at end of life
      incurable_long_lived: number   // Age-related wear
    },
    
    // 2. FUNCTIONAL OBSOLESCENCE
    functional_obsolescence: {
      curable: number,              // Poor layout - fixable
      incurable: number             // Design flaws - not fixable
    },
    
    // 3. EXTERNAL OBSOLESCENCE
    external_obsolescence: number   // Market conditions, location issues
  };
  
  total_depreciation: number;
  total_depreciation_percentage: number;
  
  // FINAL CALCULATION (No adjustments!)
  depreciated_cost: number;  // Replacement Cost - Total Depreciation
  indicated_value: number;   // Land Value + Depreciated Cost
}

// IF using cost comps (ONLY to extract cost data)
interface CostCompsForDataExtraction {
  comp_id: number;
  building_cost_psf: number;     // Extract cost/SF data
  site_improvement_cost: number; // Extract improvement costs
  year_built: number;            // For depreciation analysis
  effective_age: number;         // For depreciation curves
  
  // NO ADJUSTMENTS - Only data extraction
  weight: number;                // For averaging costs
}
```

---

### Depreciation Categories Breakdown

| Depreciation Type | Subcategory | Description | Example | Calculation Method |
|-------------------|-------------|-------------|---------|-------------------|
| **PHYSICAL DETERIORATION** ||||
| | Curable | Deferred maintenance that's economical to fix | Needs paint ($10K) | Cost to cure |
| | Incurable Short-lived | Building components at end of life | Roof needs replacement ($50K) | Replacement cost × age/life |
| | Incurable Long-lived | Structural age-related wear | Foundation settling | Age-life method |
| **FUNCTIONAL OBSOLESCENCE** ||||
| | Curable | Fixable design deficiencies | Outdated kitchen ($30K upgrade) | Cost to cure |
| | Incurable | Permanent design flaws | Low ceilings (8 ft vs 10 ft standard) | Capitalized rent loss |
| **EXTERNAL OBSOLESCENCE** ||||
| | Market | External negative influences | Adjacent to landfill, declining area | Paired sales analysis |

---

### What Cost Comps SHOULD Be Used For

Cost comps in this approach serve a DIFFERENT purpose than sales comps:

#### ✅ Correct Use of Cost Comps
1. **Extract Building Cost Data**
   - Recent construction projects
   - Building cost per square foot
   - Site improvement costs
   
2. **Validate Cost Estimates**
   - Compare Marshall & Swift costs to actual recent construction
   - Verify local cost multipliers
   
3. **Support Depreciation Estimates**
   - Analyze actual depreciation in similar buildings
   - Build depreciation curves from market data

#### ❌ WRONG Use of Cost Comps
1. ❌ Making adjustments to comp sale prices
2. ❌ Using time, location, condition adjustments
3. ❌ Treating them like sales comps

---

### Analysis & Recommendations

#### ❌ Critical Problems

1. **Fundamental Misunderstanding of Cost Approach**
   - Currently treats cost comps like sales comps
   - Uses percentage adjustments (time, location, condition)
   - This is NOT how cost approach works

2. **Missing Depreciation Framework**
   - No structured depreciation categories
   - No physical/functional/external breakdown
   - No curable/incurable separation

3. **Incorrect Data Model**
   - `comps_adjustments` array should not exist
   - Should have `depreciation_components` instead

#### 🔧 Required Changes - CRITICAL PRIORITY

**1. Remove ALL Adjustment Fields from Cost Approach**

```javascript
// DELETE THIS:
costCompSchema = {
  comps_adjustments: [...]  // ❌ DELETE ENTIRELY
};

// REPLACE WITH:
costApproachSchema = {
  land_value: number,
  
  improvements: [{
    type: string,
    size_sf: number,
    cost_per_sf: number,
    total_cost: number
  }],
  
  depreciation: {
    physical_curable: number,
    physical_incurable_short: number,
    physical_incurable_long: number,
    functional_curable: number,
    functional_incurable: number,
    external_obsolescence: number
  },
  
  total_depreciation: number,
  depreciated_cost: number,
  indicated_value: number
};
```

**2. Restructure Cost Comps**

If using cost comps at all, use them ONLY for data extraction:

```javascript
costCompForDataOnly = {
  comp_id: number,
  recent_construction_cost_psf: number,  // Data point only
  year_built: number,                    // For depreciation analysis
  effective_age: number,                 // For depreciation curves
  actual_depreciation_observed: number,  // Market-extracted depreciation
  
  // NO adj_key/adj_value structure
  weight: number  // For averaging cost data
};
```

**3. Add Depreciation Input Interface**

Create a new depreciation entry interface:

```typescript
interface DepreciationInputs {
  // Physical Deterioration
  deferred_maintenance_items: [{
    description: string,
    cost_to_cure: number
  }],
  
  short_lived_components: [{
    component: string,        // Roof, HVAC, etc.
    replacement_cost: number,
    effective_age: number,
    total_life: number,
    depreciation: number      // (age/life) × cost
  }],
  
  long_lived_depreciation: {
    building_effective_age: number,
    total_economic_life: number,
    depreciation_percentage: number,
    depreciation_amount: number
  },
  
  // Functional Obsolescence
  functional_issues: [{
    description: string,
    curable: boolean,
    cost_to_cure_or_value_loss: number
  }],
  
  // External Obsolescence
  external_factors: [{
    description: string,
    value_loss_percentage: number,
    value_loss_amount: number
  }]
}
```

---

## 3. Income Approach

### Overview
The Income Approach values a property based on its ability to generate income. It uses direct capitalization or discounted cash flow to convert future income into present value.

### ✅ Current Implementation is CORRECT

---

### Current Implementation - Verified Correct

**File:** `packages/backend/src/services/appraisalIncomeApproach/IAppraisalIncomeApproach.ts`

```typescript
interface IAppraisalIncomeApproach {
  // INCOME ANALYSIS (✅ CORRECT)
  incomeSources: IIncomeSource[];
  total_monthly_income: number;
  total_annual_income: number;
  vacancy: number;
  adjusted_gross_amount: number;  // Effective Gross Income
  
  // EXPENSE ANALYSIS (✅ CORRECT)
  operatingExpenses: IOperatingExpense[];
  total_oe_annual_amount: number;
  
  // NET INCOME (✅ CORRECT)
  total_net_income: number;  // NOI
  
  // CAP RATES (✅ CORRECT)
  monthly_capitalization_rate: number;
  annual_capitalization_rate: number;
  
  // INDICATED VALUE (✅ CORRECT)
  indicated_range_annual: number;
  indicated_psf_annual: number;
}
```

**NO comp adjustments - CORRECT!**

---

### Industry Standard - What Should Exist

| Component | Type | Has Dropdowns? | Purpose |
|-----------|------|----------------|---------|
| **POTENTIAL GROSS INCOME** | Input/Calculation | ❌ NO | Total possible income if 100% occupied |
| **VACANCY & COLLECTION LOSS** | % Input | ❌ NO | Estimated loss (typically 5-10%) |
| **EFFECTIVE GROSS INCOME** | Calculation | ❌ NO | PGI - Vacancy Loss |
| **OPERATING EXPENSES** | Line Items | ❌ NO | Property taxes, insurance, maintenance, etc. |
| **NET OPERATING INCOME** | Calculation | ❌ NO | EGI - Operating Expenses |
| **CAPITALIZATION RATE** | % Input | ❌ NO | From market (Cap Rate Comps approach) |
| **INDICATED VALUE** | Calculation | ❌ NO | NOI ÷ Cap Rate |

#### Income Approach Structure

```javascript
// CORRECT STRUCTURE (matches current implementation)

interface IncomeApproachCalculation {
  // STEP 1: INCOME ANALYSIS
  income_sources: [{
    source_type: string,      // Rent, parking, storage, laundry, etc.
    unit_type: string,        // 1BR, 2BR, retail space, etc.
    unit_count: number,
    monthly_rent_per_unit: number,
    annual_rent: number
  }],
  
  potential_gross_income: number,      // Sum of all income sources
  
  // STEP 2: VACANCY & COLLECTION LOSS
  vacancy_rate_percentage: number,     // Market rate (5-10% typical)
  vacancy_loss_amount: number,
  
  effective_gross_income: number,      // PGI - Vacancy
  
  // STEP 3: OPERATING EXPENSES
  operating_expenses: [{
    category: string,                  // Taxes, Insurance, Utilities, etc.
    annual_amount: number,
    per_sf: number,
    per_unit: number,
    percentage_of_gross: number
  }],
  
  total_operating_expenses: number,
  
  // STEP 4: NET OPERATING INCOME
  net_operating_income: number,        // EGI - Operating Expenses
  
  // STEP 5: CAPITALIZATION
  market_cap_rate: number,             // From Cap Rate Comps (separate approach)
  
  // STEP 6: VALUE INDICATION
  indicated_value: number,             // NOI ÷ Cap Rate
  indicated_value_per_sf: number,
  indicated_value_per_unit: number
}
```

---

### Analysis & Recommendations

#### ✅ What's Working Perfectly

1. **No comp adjustments** - Income Approach doesn't use adjustments
2. **Direct calculation methodology** - Correct formula: NOI ÷ Cap Rate
3. **Proper income/expense structure** - Matches industry standards
4. **Multiple income sources** - Handles complex properties

#### ℹ️ No Changes Needed

The Income Approach implementation is **CORRECT as-is**. This approach does NOT use comparable adjustments - it's a direct income-to-value conversion.

The cap rate comes from a SEPARATE analysis (Cap Rate Comps Approach - see Section 5).

---

## 4. Lease Comps Approach

### Overview
The Lease Comps Approach analyzes comparable lease transactions to estimate market rent for a property. This is fundamentally different from sales comps.

### ⚠️ Limited Adjustments ARE Appropriate
Lease comps need specialized adjustments related to LEASE TERMS, not physical property features.

---

### Current Implementation

**Files:** `packages/frontend/src/pages/appraisal/overview/lease/`

**Currently Uses:**
```javascript
// From lease comp structure
leaseCompAdjustments = {
  adj_key: string,
  adj_value: number
};

// Visible fields (from comps-property-comparitive.attributes.tsx)
const leaseCompFields = [
  'street_address',          // Display only
  'city_state',              // Display only
  'lease_type',              // ✅ Adjustment needed (NNN, Gross, Modified)
  'term',                    // ✅ Adjustment needed (lease length)
  'space',                   // ✅ Adjustment needed (square footage)
  'price_sf_per_year',       // Display (calculated)
  'price_acre_per_year',     // Display (land leases)
  'building_size',           // Display
  'unit',                    // Display
  'beds',                    // Display (residential leases)
  'avg_monthly_rent'         // Display
];
```

---

### Industry Standard - What Should Exist

#### A. Lease-Specific Adjustments

| Category | Adjustment Field | Description | Priority | Currently Exists? |
|----------|------------------|-------------|----------|-------------------|
| **LEASE TERMS (CRITICAL)** ||||
| | `lease_type` | NNN, Gross, Modified Gross, Full Service | 🔴 HIGH | ✅ EXISTS |
| | `lease_term_years` | Length of lease (longer = typically lower rate) | 🔴 HIGH | ✅ EXISTS (as 'term') |
| | `escalations` | CPI, fixed %, market adjustments | 🔴 HIGH | ❌ MISSING |
| | `tenant_improvements` | TI allowance ($/SF) - affects effective rent | 🔴 HIGH | ❌ MISSING |
| | `free_rent_period` | Months of free rent - impacts effective rate | 🔴 HIGH | ❌ MISSING |
| | `renewal_options` | Option terms and pricing | 🟡 MEDIUM | ❌ MISSING |
| **PROPERTY CHARACTERISTICS** ||||
| | `location` | Within same submarket comparison | 🟡 MEDIUM | ❌ MISSING |
| | `space_size` | Leased square footage | 🔴 HIGH | ✅ EXISTS (as 'space') |
| | `condition_quality` | Tenant finish quality | 🟡 MEDIUM | ❌ MISSING |
| | `parking_included` | Parking spaces included/additional | 🟡 MEDIUM | ❌ MISSING |
| **TIMING** ||||
| | `time_market_conditions` | Lease market changes (rates trending) | 🟡 MEDIUM | ❌ MISSING |

#### B. Effective Rent Calculation

**CRITICAL CONCEPT:** Lease comps require "effective rent" calculation, not just contract rent.

```javascript
interface EffectiveRentCalculation {
  // Contract Terms
  contract_rent_psf_year: number,
  lease_term_months: number,
  
  // Concessions
  free_rent_months: number,
  free_rent_value: number,              // (free_months/total_months) × contract_rent
  
  // Tenant Improvements
  ti_allowance_psf: number,
  ti_amortization_rate: number,         // Amortize over lease term
  ti_annual_cost_psf: number,
  
  // Landlord Costs
  leasing_commission_psf: number,
  leasing_commission_amortized: number,
  
  // Effective Rent
  gross_effective_rent_psf: number,     // Contract rent - concessions - TI cost
  
  // If comparing NNN to Gross leases
  operating_expenses_psf: number,       // For conversion
  net_effective_rent_psf: number
}
```

---

### Proper Lease Comp Structure

```javascript
interface LeaseCompAdjustment {
  // LEASE CHARACTERISTICS (adjust for these)
  lease_characteristics: {
    lease_type: string,              // ✅ EXISTS - NNN, Gross, Modified
    lease_type_adjustment: number,   // ❌ MISSING - Convert to common basis
    
    lease_term_months: number,       // ✅ EXISTS (as 'term')
    lease_term_adjustment: number,   // ❌ MISSING - Longer term = lower rate
    
    escalations: string,             // ❌ MISSING - CPI, 3% annual, etc.
    escalation_value: number,        // ❌ MISSING - Impact on effective rent
    
    free_rent_months: number,        // ❌ MISSING
    free_rent_adjustment: number,    // ❌ MISSING
    
    ti_allowance_psf: number,        // ❌ MISSING
    ti_adjustment: number            // ❌ MISSING
  },
  
  // PROPERTY CHARACTERISTICS (limited adjustments)
  property_adjustments: {
    location_adjustment: number,     // ❌ MISSING
    space_size: number,              // ✅ EXISTS
    size_adjustment: number,         // Economies of scale
    condition_adjustment: number,    // ❌ MISSING
    parking_adjustment: number       // ❌ MISSING
  },
  
  // FINAL EFFECTIVE RENT
  contract_rent_psf_year: number,
  total_adjustments: number,
  effective_rent_psf_year: number,
  weight: number
}
```

---

### Analysis & Recommendations

#### ⚠️ Current Gaps

1. **Missing Critical Lease Terms**
   - No escalation tracking
   - No TI allowance
   - No free rent period
   - Cannot calculate effective rent

2. **No Lease Type Conversion**
   - System shows lease type but doesn't adjust for it
   - NNN vs Gross comparison requires expense adjustment

3. **Limited Property Adjustments**
   - Has space size but no other property factors

#### 📋 Required Additions

```javascript
// ADD THESE FIELDS to Lease Comps

export const leaseCompAdjustments = [
  // EXISTING - Keep these
  { adj_key: 'lease_type', adj_value: '$0.00' },
  { adj_key: 'lease_term_months', adj_value: '$0.00' },
  { adj_key: 'space_size', adj_value: '$0.00' },
  
  // ADD THESE CRITICAL FIELDS:
  { adj_key: 'escalations', adj_value: '$0.00', type: 'text_input' },
  { adj_key: 'ti_allowance_psf', adj_value: '$0.00', type: 'currency' },
  { adj_key: 'free_rent_months', adj_value: '0', type: 'number' },
  { adj_key: 'renewal_options', adj_value: '', type: 'text_input' },
  { adj_key: 'operating_expenses_psf', adj_value: '$0.00' },  // For NNN/Gross conversion
  { adj_key: 'location', adj_value: '$0.00' },
  { adj_key: 'condition_quality', adj_value: '$0.00' },
  { adj_key: 'parking_spaces', adj_value: '0', type: 'number' },
  { adj_key: 'time_market_conditions', adj_value: '$0.00' }
];

// ADD EFFECTIVE RENT CALCULATION
function calculateEffectiveRent(comp) {
  const monthlyRent = comp.contract_rent_psf_year / 12;
  const freeRentValue = (comp.free_rent_months / comp.lease_term_months) * comp.contract_rent_psf_year;
  const tiAnnualCost = comp.ti_allowance_psf / (comp.lease_term_months / 12);
  
  return comp.contract_rent_psf_year - freeRentValue - tiAnnualCost;
}
```

---

## 5. Cap Rate Comps Approach

### Overview
The Cap Rate Comps Approach analyzes comparable sales of income-producing properties to extract and derive market capitalization rates. These cap rates are then applied in the Income Approach.

### ⚠️ RISK FACTOR Adjustments ARE Appropriate
Cap rate adjustments are based on RISK FACTORS, not physical characteristics.

---

### Current Implementation

**Files:** `packages/frontend/src/pages/evaluation/evaluation-cap-rate-approach/`

**Currently Shows:**
```javascript
const capRateCompFields = [
  'street_address',           // Display only
  'city_state',               // Display only
  'date_sold',                // Display
  'sale_price',               // Display
  'building_size',            // Display
  'cap_rate',                 // ✅ PRIMARY DATA POINT
  'net_operating_income',     // ✅ PRIMARY DATA POINT (NOI)
  'price_per_sf',             // Display
  'year_built_year_remodeled', // Display
  'quality_condition',        // ⚠️ Needs adjustment capability
  'property_type',            // Display
  'effective_age'             // ⚠️ Needs adjustment capability
];
```

---

### Industry Standard - What Should Exist

#### Understanding Cap Rates

**Cap Rate = NOI ÷ Sale Price**

- **Lower Cap Rate** = Lower Risk = Higher Value = More Desirable Property
- **Higher Cap Rate** = Higher Risk = Lower Value = Less Desirable Property

#### Example:
- Class A building, prime location, credit tenant → 5.0% cap rate
- Class C building, secondary location, weak tenant → 9.0% cap rate

#### Risk-Based Adjustments

| Category | Risk Factor | Description | Impact on Cap Rate | Priority | Currently Exists? |
|----------|-------------|-------------|-------------------|----------|-------------------|
| **LOCATION QUALITY** ||||
| | `location_quality` | A, B, C, D location classification | A location = -1.0% to -2.0% | 🔴 HIGH | ❌ MISSING |
| **TENANT QUALITY** ||||
| | `tenant_credit_quality` | Investment grade, regional, local, startup | Credit tenant = -0.5% to -1.5% | 🔴 HIGH | ❌ MISSING |
| | `tenant_concentration` | Single tenant vs multi-tenant | Single = higher risk | 🟡 MEDIUM | ❌ MISSING |
| **LEASE TERMS** ||||
| | `lease_term_remaining` | Years remaining on leases | Longer = lower risk | 🔴 HIGH | ❌ MISSING |
| | `lease_rollover_risk` | % expiring in next 12 months | Higher rollover = higher risk | 🟡 MEDIUM | ❌ MISSING |
| **PROPERTY CHARACTERISTICS** ||||
| | `property_condition` | Excellent, Good, Average, Fair, Poor | Better condition = lower cap | 🟡 MEDIUM | ⚠️ EXISTS (quality_condition) |
| | `property_age` | Effective age | Newer = typically lower cap | 🟡 MEDIUM | ⚠️ EXISTS (effective_age) |
| | `property_size` | Building square footage | Larger = typically lower cap | 🟡 MEDIUM | ✅ EXISTS (building_size) |
| **MARKET FACTORS** ||||
| | `occupancy_rate` | Current occupancy % | Stabilized = lower cap | 🔴 HIGH | ❌ MISSING |
| | `market_liquidity` | Primary, secondary, tertiary market | Primary market = lower cap | 🟡 MEDIUM | ❌ MISSING |
| | `time_market_conditions` | Cap rate trends over time | Compressing/expanding | 🟡 MEDIUM | ❌ MISSING |
| **MANAGEMENT** ||||
| | `management_intensity` | Triple-net vs full-service | NNN = lower cap (less work) | 🟡 MEDIUM | ❌ MISSING |
| | `deferred_maintenance` | Capital needs | High deferred = higher cap | 🟡 MEDIUM | ❌ MISSING |

---

### Proper Cap Rate Comp Structure

```javascript
interface CapRateCompAnalysis {
  // SALE DATA (Display, for context)
  comp_id: number,
  sale_price: number,
  sale_date: string,
  building_size_sf: number,
  price_per_sf: number,
  
  // INCOME DATA (Primary data points)
  net_operating_income: number,          // Annual NOI
  cap_rate_as_sold: number,              // NOI ÷ Sale Price
  
  // RISK ADJUSTMENTS (Key differentiators)
  risk_adjustments: {
    // Location
    location_quality_grade: string,      // A, B+, B, B-, C+, C, D
    location_adjustment: number,         // -2.0% to +3.0%
    
    // Tenant
    tenant_credit_rating: string,        // Investment grade, regional, etc.
    tenant_adjustment: number,           // -1.5% to +2.0%
    
    weighted_avg_lease_term: number,     // Years
    lease_term_adjustment: number,       // -0.5% to +1.0%
    
    // Property
    occupancy_rate: number,              // 0-100%
    occupancy_adjustment: number,        // Stabilized = 0%, Vacant = +2-4%
    
    property_condition: string,          // Excellent to Poor
    condition_adjustment: number,        // -0.5% to +1.5%
    
    property_age: number,
    age_adjustment: number,              // -0.25% to +0.75%
    
    deferred_maintenance_cost: number,
    maintenance_adjustment: number,      // Based on % of value
    
    // Market
    market_tier: string,                 // Primary, Secondary, Tertiary
    market_adjustment: number,           // -1.0% to +2.0%
    
    time_since_sale_months: number,
    time_adjustment: number              // Market cap rate trends
  },
  
  // ADJUSTED CAP RATE
  total_adjustment: number,              // Sum of all adjustments
  adjusted_cap_rate: number,             // As-sold cap ± adjustments
  
  weight: number,                        // For weighted average
  weighted_cap_rate: number              // adjusted_cap_rate × weight
}

// FINAL MARKET CAP RATE
marketCapRate = {
  indicated_cap_rates: number[],         // From all adjusted comps
  low: number,
  high: number,
  average: number,
  weighted_average: number,              // Recommended
  
  reconciled_cap_rate: number,           // Appraiser's final selection
  rationale: string                      // Explanation of selection
}
```

---

### Cap Rate Adjustment Direction

**CRITICAL UNDERSTANDING:**

```
Subject Property BETTER than Comp → SUBTRACT from comp's cap rate → LOWER cap rate
Subject Property WORSE than Comp → ADD to comp's cap rate → HIGHER cap rate

Example 1:
Comp: Class B location, sold at 7.5% cap rate
Subject: Class A location (superior)
Adjustment: -1.0% (subtract because subject is better/lower risk)
Adjusted Cap for Comp: 7.5% - 1.0% = 6.5%

Example 2:
Comp: Credit tenant, sold at 6.0% cap rate
Subject: Local tenant (higher risk)
Adjustment: +1.5% (add because subject is higher risk)
Adjusted Cap for Comp: 6.0% + 1.5% = 7.5%
```

---

### Analysis & Recommendations

#### ⚠️ Current Gaps

1. **No Risk Factor Adjustments**
   - Shows quality_condition and effective_age but no adjustment mechanism
   - Missing critical tenant quality factors
   - No occupancy tracking

2. **No Location Quality Classification**
   - Location is fundamental to cap rate
   - A vs B vs C location = 1-3% cap rate difference

3. **No Tenant Analysis**
   - Tenant credit quality is major risk factor
   - Credit tenant vs startup = 1-2% cap rate difference

#### 📋 Required Additions

```javascript
// ADD THESE FIELDS to Cap Rate Comps

export const capRateCompAdjustments = [
  // EXISTING - Display only
  { field: 'cap_rate_as_sold', type: 'display' },
  { field: 'net_operating_income', type: 'display' },
  { field: 'sale_price', type: 'display' },
  
  // ADD THESE RISK ADJUSTMENT FIELDS:
  
  // Location
  { adj_key: 'location_quality_grade', 
    adj_value: '0.00%', 
    type: 'select',
    options: ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D'],
    impact: 'cap_rate_adjustment' 
  },
  
  // Tenant Quality
  { adj_key: 'tenant_credit_quality',
    adj_value: '0.00%',
    type: 'select',
    options: ['Investment Grade', 'Regional/National', 'Strong Local', 'Local', 'Startup'],
    impact: 'cap_rate_adjustment'
  },
  
  { adj_key: 'weighted_avg_lease_term_years',
    adj_value: '0',
    type: 'number',
    impact: 'cap_rate_adjustment'
  },
  
  // Occupancy
  { adj_key: 'occupancy_rate_percent',
    adj_value: '0',
    type: 'number',
    range: '0-100',
    impact: 'cap_rate_adjustment'
  },
  
  // Property Quality
  { adj_key: 'property_condition',
    adj_value: '0.00%',
    type: 'select',
    options: ['Excellent', 'Good', 'Average', 'Fair', 'Poor'],
    impact: 'cap_rate_adjustment'
  },
  
  { adj_key: 'deferred_maintenance_dollars',
    adj_value: '$0.00',
    type: 'currency',
    impact: 'cap_rate_adjustment'
  },
  
  // Market
  { adj_key: 'market_tier',
    adj_value: '0.00%',
    type: 'select',
    options: ['Primary', 'Secondary', 'Tertiary'],
    impact: 'cap_rate_adjustment'
  },
  
  { adj_key: 'time_market_conditions',
    adj_value: '0.00%',
    type: 'percentage',
    impact: 'cap_rate_adjustment'
  },
  
  // Management
  { adj_key: 'management_intensity',
    adj_value: '0.00%',
    type: 'select',
    options: ['Triple-Net', 'Modified Gross', 'Full Service'],
    impact: 'cap_rate_adjustment'
  }
];

// ADD CAP RATE ADJUSTMENT CALCULATION
function calculateAdjustedCapRate(comp, subject) {
  let totalAdjustment = 0;
  
  // Location (±1-3%)
  const locationDiff = getLocationQualityDiff(subject.location_grade, comp.location_grade);
  totalAdjustment += locationDiff;
  
  // Tenant (±1-2%)
  const tenantDiff = getTenantCreditDiff(subject.tenant_quality, comp.tenant_quality);
  totalAdjustment += tenantDiff;
  
  // Occupancy (0-4%)
  if (comp.occupancy_rate < 90) {
    totalAdjustment += (90 - comp.occupancy_rate) * 0.04;  // 4% per 10% vacancy
  }
  
  // Condition (±0.5-1.5%)
  const conditionDiff = getConditionDiff(subject.condition, comp.condition);
  totalAdjustment += conditionDiff;
  
  // ... other adjustments
  
  return comp.cap_rate_as_sold + totalAdjustment;
}
```

---

## 6. Multi-Family/GRM Approach

### Overview
The Multi-Family Approach uses Gross Rent Multiplier (GRM) analysis and per-unit pricing to value apartment complexes and multi-family properties.

### ⚠️ SPECIALIZED Adjustments ARE Appropriate
Multi-family needs unit-based and GRM-based adjustments.

---

### Current Implementation

**Files:** `packages/frontend/src/pages/evaluation/evaluation-multi-family-approach/`

```typescript
interface IMultiFamilyApproach {
  evaluation_id: number,
  evaluation_scenario_id: number,
  notes: string,
  high_rental_rate: number,
  low_rental_rate: number,
  
  subject_property_adjustments: [],
  comps: [],
  comparison_attributes: []
}
```

**Currently Shows:**
```javascript
const multiFamilyCompFields = [
  'street_address',
  'city_state',
  'date_sold',
  'sale_price',
  'unit',                    // ✅ Critical - total units
  'beds',                    // ✅ Critical - bedroom count
  'unit_mix',                // ✅ Critical - unit type breakdown
  'price_per_unit',          // ✅ Critical - $/unit metric
  'dollar_per_bed',          // ✅ Critical - $/bedroom metric
  'dollar_per_unit',         // ✅ Critical - same as price_per_unit
  'avg_monthly_rent',        // ✅ Critical - average rent/unit
  'year_built_year_remodeled',
  'quality_condition',
  'effective_age',
  'unit_size_sq_ft'          // ✅ Critical - avg SF/unit
];
```

---

### Industry Standard - What Should Exist

#### Multi-Family Key Metrics

| Metric | Formula | Purpose | Currently Exists? |
|--------|---------|---------|-------------------|
| **Price Per Unit** | Sale Price ÷ Total Units | Primary valuation metric | ✅ EXISTS |
| **Price Per Bedroom** | Sale Price ÷ Total Bedrooms | Alternative metric | ✅ EXISTS (dollar_per_bed) |
| **Gross Rent Multiplier (GRM)** | Sale Price ÷ Annual Gross Rent | Income multiplier | ❌ MISSING |
| **Monthly GRM** | Sale Price ÷ Monthly Gross Rent | Monthly version | ❌ MISSING |
| **Rent Per Unit** | Monthly Gross Rent ÷ Units | Average rent | ✅ EXISTS (avg_monthly_rent) |
| **Rent Per SF** | Monthly Rent ÷ Total SF | SF-based rent | ⚠️ Calculable but not explicit |

#### Required Adjustments

| Category | Adjustment Field | Description | Priority | Currently Exists? |
|----------|------------------|-------------|----------|-------------------|
| **PRIMARY METRICS** ||||
| | `total_units` | Total rental units | 🔴 HIGH | ✅ EXISTS (as 'unit') |
| | `total_bedrooms` | Total bedrooms all units | 🔴 HIGH | ✅ EXISTS (as 'beds') |
| | `price_per_unit` | Sale price ÷ units | 🔴 HIGH | ✅ EXISTS |
| | `price_per_bedroom` | Sale price ÷ bedrooms | 🔴 HIGH | ✅ EXISTS |
| | `gross_rent_multiplier` | Sale price ÷ annual rent | 🔴 HIGH | ❌ MISSING |
| | `avg_monthly_rent_per_unit` | Average rent | 🔴 HIGH | ✅ EXISTS |
| **UNIT MIX ANALYSIS** ||||
| | `unit_mix_breakdown` | Studio/1BR/2BR/3BR distribution | 🔴 HIGH | ⚠️ EXISTS but needs detail |
| | `unit_mix_similarity` | Comp vs subject comparison | 🟡 MEDIUM | ❌ MISSING |
| | `avg_unit_size_sf` | Average SF per unit | 🟡 MEDIUM | ✅ EXISTS (unit_size_sq_ft) |
| **PROPERTY ADJUSTMENTS** ||||
| | `location` | Submarket, school district, access | 🔴 HIGH | ❌ MISSING |
| | `time_market_conditions` | Sale date adjustment | 🔴 HIGH | ❌ MISSING |
| | `property_condition` | Overall condition | 🟡 MEDIUM | ⚠️ EXISTS (quality_condition) |
| | `property_age` | Age/effective age | 🟡 MEDIUM | ✅ EXISTS (effective_age) |
| | `amenity_package` | Pool, fitness, clubhouse, etc. | 🟡 MEDIUM | ❌ MISSING |
| | `parking_ratio` | Spaces per unit | 🟡 MEDIUM | ❌ MISSING |
| | `occupancy_rate` | % occupied at sale | 🟡 MEDIUM | ❌ MISSING |
| | `utilities_included` | Tenant vs owner paid | 🟢 LOW | ❌ MISSING |

---

### Proper Multi-Family Comp Structure

```javascript
interface MultiFamilyCompAnalysis {
  // SALE DATA
  comp_id: number,
  sale_price: number,
  sale_date: string,
  
  // UNIT ANALYSIS (Critical)
  units: {
    total_units: number,                 // ✅ EXISTS
    total_bedrooms: number,              // ✅ EXISTS
    total_bathrooms: number,
    total_rentable_sf: number,
    avg_unit_size_sf: number,            // ✅ EXISTS
    
    // Unit Mix Breakdown
    unit_mix: [{
      unit_type: string,                 // Studio, 1BR, 2BR, 3BR
      unit_count: number,
      avg_sf: number,
      avg_monthly_rent: number,
      total_monthly_rent: number
    }],
    
    // ❌ MISSING - Unit mix similarity score
    unit_mix_similarity_to_subject: number  // 0-100%
  },
  
  // PRICING METRICS
  pricing: {
    price_per_unit: number,              // ✅ EXISTS
    price_per_bedroom: number,           // ✅ EXISTS
    price_per_sf: number,                // Calculable
    
    // ❌ MISSING - GRM calculations
    monthly_gross_rent: number,          // Sum of all unit rents
    annual_gross_rent: number,           // Monthly × 12
    gross_rent_multiplier_monthly: number,  // Sale Price ÷ Monthly Rent
    gross_rent_multiplier_annual: number    // Sale Price ÷ Annual Rent
  },
  
  // RENT ANALYSIS
  rents: {
    avg_monthly_rent_per_unit: number,   // ✅ EXISTS
    avg_monthly_rent_per_bedroom: number,
    avg_monthly_rent_per_sf: number,
    
    rent_range_low: number,
    rent_range_high: number
  },
  
  // PROPERTY CHARACTERISTICS
  property: {
    year_built: number,
    effective_age: number,               // ✅ EXISTS
    condition: string,                   // ✅ EXISTS (quality_condition)
    
    // ❌ MISSING - Amenities
    amenities: {
      pool: boolean,
      fitness_center: boolean,
      clubhouse: boolean,
      playground: boolean,
      laundry_facilities: string,        // In-unit, on-site, none
      parking_type: string,              // Covered, open, garage
      parking_ratio: number,             // Spaces per unit
      elevator: boolean,
      security: string                   // Gated, patrol, cameras, none
    },
    
    utilities_tenant_pays: string[],     // Electric, gas, water, etc.
    utilities_owner_pays: string[]
  },
  
  // ADJUSTMENTS
  adjustments: {
    location_adjustment: number,         // ❌ MISSING
    time_adjustment: number,             // ❌ MISSING
    unit_mix_adjustment: number,         // ❌ MISSING
    size_adjustment: number,             // Unit count economies of scale
    condition_adjustment: number,
    age_adjustment: number,
    amenity_adjustment: number,          // ❌ MISSING
    occupancy_adjustment: number,        // ❌ MISSING
    
    total_adjustments: number
  },
  
  // ADJUSTED INDICATORS
  adjusted_price_per_unit: number,
  adjusted_grm: number,
  weight: number
}
```

---

### GRM Calculation Method

```javascript
// GROSS RENT MULTIPLIER ANALYSIS

function calculateGRM(comp) {
  // Step 1: Calculate Monthly Gross Rent
  const monthlyGrossRent = comp.units.unit_mix.reduce((total, unitType) => {
    return total + (unitType.unit_count × unitType.avg_monthly_rent);
  }, 0);
  
  // Step 2: Calculate Annual Gross Rent
  const annualGrossRent = monthlyGrossRent × 12;
  
  // Step 3: Calculate GRM
  const grmMonthly = comp.sale_price / monthlyGrossRent;
  const grmAnnual = comp.sale_price / annualGrossRent;
  
  return {
    monthly_gross_rent: monthlyGrossRent,
    annual_gross_rent: annualGrossRent,
    grm_monthly: grmMonthly,
    grm_annual: grmAnnual
  };
}

// APPLICATION TO SUBJECT
function applyGRMtoSubject(subject, marketGRM) {
  // Calculate subject's gross rent
  const subjectMonthlyRent = subject.units.unit_mix.reduce((total, unitType) => {
    return total + (unitType.unit_count × unitType.avg_monthly_rent);
  }, 0);
  
  // Apply market GRM
  const indicatedValue = subjectMonthlyRent × marketGRM.monthly;
  
  return indicatedValue;
}

// ALTERNATIVE: Per-Unit Method
function applyPerUnitMethod(subject, marketPricePerUnit) {
  return subject.total_units × marketPricePerUnit;
}
```

---

### Unit Mix Comparison

```javascript
// UNIT MIX SIMILARITY CALCULATION

function compareUnitMix(subject, comp) {
  const subjectMix = calculateMixPercentages(subject.unit_mix);
  const compMix = calculateMixPercentages(comp.unit_mix);
  
  let similarityScore = 0;
  
  ['studio', '1br', '2br', '3br', '4br'].forEach(type => {
    const diff = Math.abs(subjectMix[type] - compMix[type]);
    similarityScore += (100 - diff);  // Penalize differences
  });
  
  return similarityScore / 5;  // Average across unit types
}

function calculateMixPercentages(unitMix) {
  const total = unitMix.reduce((sum, u) => sum + u.unit_count, 0);
  
  return {
    studio: (unitMix.find(u => u.type === 'studio')?.unit_count || 0) / total × 100,
    '1br': (unitMix.find(u => u.type === '1BR')?.unit_count || 0) / total × 100,
    '2br': (unitMix.find(u => u.type === '2BR')?.unit_count || 0) / total × 100,
    '3br': (unitMix.find(u => u.type === '3BR')?.unit_count || 0) / total × 100,
    '4br': (unitMix.find(u => u.type === '4BR')?.unit_count || 0) / total × 100
  };
}

// Example:
// Subject: 40% 1BR, 50% 2BR, 10% 3BR
// Comp A:  40% 1BR, 50% 2BR, 10% 3BR → 100% similarity (perfect match)
// Comp B:  80% Studio, 20% 1BR      → 30% similarity (poor match)
```

---

### Analysis & Recommendations

#### ⚠️ Current Gaps

1. **No GRM Calculation**
   - Missing monthly GRM
   - Missing annual GRM
   - Cannot use GRM method for valuation

2. **Limited Unit Mix Analysis**
   - Shows unit mix but no similarity comparison
   - No unit mix adjustment mechanism

3. **Missing Amenity Analysis**
   - Amenities significantly affect multi-family values
   - Pool, fitness center can add $1,000-$3,000 per unit

4. **No Occupancy Tracking**
   - Stabilized vs lease-up properties value differently
   - 80% occupied vs 95% occupied is major adjustment

#### 📋 Required Additions

```javascript
// ADD THESE FIELDS to Multi-Family Comps

export const multiFamilyCompFields = [
  // EXISTING - Keep all current fields
  { field: 'total_units', type: 'display' },
  { field: 'total_bedrooms', type: 'display' },
  { field: 'price_per_unit', type: 'display' },
  { field: 'price_per_bedroom', type: 'display' },
  { field: 'avg_monthly_rent', type: 'display' },
  { field: 'unit_size_sq_ft', type: 'display' },
  { field: 'unit_mix', type: 'display' },
  
  // ADD THESE CRITICAL CALCULATIONS:
  { field: 'total_monthly_gross_rent', type: 'calculated', formula: 'sum(unit_rents)' },
  { field: 'annual_gross_rent', type: 'calculated', formula: 'monthly_rent × 12' },
  { field: 'grm_monthly', type: 'calculated', formula: 'sale_price ÷ monthly_rent' },
  { field: 'grm_annual', type: 'calculated', formula: 'sale_price ÷ annual_rent' },
  
  // ADD THESE ADJUSTMENT FIELDS:
  { adj_key: 'location', adj_value: '$0.00', per_unit: true },
  { adj_key: 'time_market_conditions', adj_value: '$0.00', per_unit: true },
  { adj_key: 'unit_mix_similarity', adj_value: '$0.00', per_unit: true },
  { adj_key: 'size_economies_of_scale', adj_value: '$0.00', per_unit: true },
  { adj_key: 'amenity_package', adj_value: '$0.00', per_unit: true },
  { adj_key: 'parking_ratio', adj_value: '$0.00', per_unit: true },
  { adj_key: 'occupancy_rate', adj_value: '$0.00', per_unit: true },
  
  // ADD AMENITY CHECKLIST:
  { field: 'amenities', type: 'checklist', options: [
    'Pool',
    'Spa/Hot Tub',
    'Fitness Center',
    'Clubhouse',
    'Business Center',
    'Playground',
    'Dog Park',
    'In-Unit Laundry',
    'On-Site Laundry',
    'Covered Parking',
    'Garage Parking',
    'Elevator',
    'Gated Access',
    'Security Patrol'
  ]}
];

// ADD PER-UNIT ADJUSTMENT CALCULATION
function calculatePerUnitAdjustment(subject, comp) {
  let adjustmentPerUnit = 0;
  
  // Location (±$2,000-$5,000/unit)
  adjustmentPerUnit += locationAdjustment(subject, comp);
  
  // Unit Mix (±$1,000-$3,000/unit)
  const mixSimilarity = compareUnitMix(subject, comp);
  if (mixSimilarity < 70) {
    adjustmentPerUnit += (70 - mixSimilarity) × 50;  // $50/unit per % difference
  }
  
  // Amenities (±$500-$3,000/unit)
  adjustmentPerUnit += amenityAdjustment(subject, comp);
  
  // Occupancy (±$1,000-$4,000/unit)
  if (comp.occupancy_rate < 90) {
    adjustmentPerUnit += (90 - comp.occupancy_rate) × 200;  // $200/unit per % vacancy
  }
  
  return {
    adjustment_per_unit: adjustmentPerUnit,
    total_adjustment: adjustmentPerUnit × comp.total_units,
    adjusted_price_per_unit: comp.price_per_unit + adjustmentPerUnit
  };
}
```

---

## 7. Rent Roll Approach

### Overview
The Rent Roll Approach involves direct analysis of a property's existing rent roll to calculate current and stabilized income. This is NOT a comparable-based approach.

### ✅ Current Implementation is CORRECT

---

### Current Implementation - Verified Correct

**Files:** Multiple rent roll components

```typescript
interface RentRollData {
  rent_rolls: [{
    unit_type: string,       // ✅ CORRECT
    beds: number,            // ✅ CORRECT
    baths: number,           // ✅ CORRECT
    sq_ft: number,           // ✅ CORRECT
    unit_count: number,      // ✅ CORRECT
    avg_monthly_rent: number // ✅ CORRECT
  }]
}
```

**NO comp adjustments - CORRECT!**

---

### Industry Standard - What Should Exist

| Component | Type | Has Dropdowns? | Purpose |
|-----------|------|----------------|---------|
| **EXISTING RENT ROLL** | Direct Input | ❌ NO | Current tenant information |
| **MARKET RENT COMPARISON** | Analysis | ❌ NO | Current vs market rent |
| **VACANCY ANALYSIS** | Calculation | ❌ NO | Occupied vs vacant units |
| **INCOME CALCULATION** | Formula | ❌ NO | Total income generation |

#### Proper Rent Roll Structure

```javascript
interface RentRollAnalysis {
  // UNIT-BY-UNIT ANALYSIS
  rent_roll: [{
    unit_number: string,              // ✅ EXISTS (as unit_type)
    unit_type: string,                // 1BR, 2BR, etc. ✅ EXISTS
    bedrooms: number,                 // ✅ EXISTS (as beds)
    bathrooms: number,                // ✅ EXISTS (as baths)
    square_feet: number,              // ✅ EXISTS (as sq_ft)
    
    // Current Lease Info
    tenant_name: string,              // ❌ MISSING
    lease_start_date: string,         // ❌ MISSING
    lease_expiration_date: string,    // ❌ MISSING
    current_monthly_rent: number,     // ✅ EXISTS (as avg_monthly_rent)
    security_deposit: number,         // ❌ MISSING
    occupied: boolean,                // ❌ MISSING
    
    // Market Analysis
    market_rent: number,              // ❌ MISSING - From market survey
    rent_variance: number,            // ❌ MISSING - Current vs market
    rent_variance_percent: number     // ❌ MISSING
  }],
  
  // SUMMARY BY UNIT TYPE
  unit_type_summary: [{
    unit_type: string,
    unit_count: number,               // ✅ EXISTS
    occupied_count: number,           // ❌ MISSING
    vacant_count: number,             // ❌ MISSING
    avg_current_rent: number,         // ✅ EXISTS (as avg_monthly_rent)
    avg_market_rent: number,          // ❌ MISSING
    avg_sf: number,                   // ✅ EXISTS (as sq_ft)
    total_monthly_income: number      // ❌ MISSING
  }],
  
  // INCOME ANALYSIS
  income: {
    // Current
    total_units: number,              // Calculable
    occupied_units: number,           // ❌ MISSING
    vacant_units: number,             // ❌ MISSING
    occupancy_rate: number,           // ❌ MISSING
    
    current_monthly_income: number,   // Sum of occupied rents
    current_annual_income: number,    // Monthly × 12
    
    // Market (if at market rents)
    market_monthly_income: number,    // ❌ MISSING
    market_annual_income: number,     // ❌ MISSING
    
    // Potential (if 100% occupied at market)
    potential_monthly_income: number, // ❌ MISSING
    potential_annual_income: number,  // ❌ MISSING
    
    // Loss to Lease
    loss_to_lease_monthly: number,    // ❌ MISSING - Market - Current
    loss_to_lease_percent: number     // ❌ MISSING
  },
  
  // NO ADJUSTMENTS - This is direct property analysis!
}
```

---

### Analysis & Recommendations

#### ✅ What's Working

1. **No comp adjustments** - Correct for rent roll analysis
2. **Unit type structure** - Has beds, baths, SF, unit count
3. **Direct income calculation** - Proper approach

#### ℹ️ Enhancement Opportunities (Not Critical)

While the core structure is correct, these additions would be helpful:

```javascript
// OPTIONAL ENHANCEMENTS to Rent Roll

// Add lease tracking
interface EnhancedRentRoll {
  // Current fields - keep as-is
  unit_type: string,
  beds: number,
  baths: number,
  sq_ft: number,
  unit_count: number,
  avg_monthly_rent: number,
  
  // Optional additions for better tracking:
  occupied_count: number,            // How many are leased
  vacant_count: number,              // How many are empty
  avg_market_rent: number,           // For comparison
  
  // Calculated fields:
  total_current_monthly_income: number,   // unit_count × avg_monthly_rent
  total_market_monthly_income: number,    // unit_count × avg_market_rent
  loss_to_lease_dollars: number           // Difference
}
```

#### 📋 Verdict

**No critical changes needed.** Rent Roll approach is correctly implemented without adjustment fields.

Optional enhancements above would improve functionality but are not required for compliance or accuracy.

---

## Summary Comparison Table

### Complete Overview: All Approaches

| Approach | Comps Used? | Should Have Adjustments? | Adjustment Type | Current Status | Priority |
|----------|-------------|-------------------------|-----------------|----------------|----------|
| **Sales Comparison** | ✅ Yes | ✅ YES | Property & Transactional | ⚠️ Partial (Missing 2 critical) | 🟡 MEDIUM |
| **Cost Approach** | ⚠️ Data Only | ❌ NO | Depreciation (not adjustments) | ❌ WRONG (Uses adjustments) | 🔴 CRITICAL |
| **Income Approach** | ❌ No | ❌ NO | Direct Calculation | ✅ CORRECT | ✅ COMPLETE |
| **Lease Comps** | ✅ Yes | ⚠️ LIMITED | Lease Terms & Property | ⚠️ Partial (Missing 7 fields) | 🟡 MEDIUM |
| **Cap Rate Comps** | ✅ Yes | ⚠️ RISK-BASED | Risk Factors | ⚠️ Partial (Missing 9 fields) | 🟡 MEDIUM |
| **Multi-Family/GRM** | ✅ Yes | ⚠️ SPECIALIZED | Unit-Based & GRM | ⚠️ Partial (Missing GRM calc) | 🟡 MEDIUM |
| **Rent Roll** | ❌ No | ❌ NO | Direct Analysis | ✅ CORRECT | ✅ COMPLETE |

---

### Missing Fields Summary

#### 🔴 CRITICAL Priority (Cost Approach)

| Approach | What's Wrong | What's Missing | Impact |
|----------|--------------|----------------|--------|
| **Cost Approach** | Uses comp adjustments (WRONG methodology) | Depreciation framework (Physical, Functional, External) | **Produces incorrect values** - violates appraisal standards |

#### 🟡 MEDIUM Priority (Sales Comparison)

| Approach | Missing Fields | Impact |
|----------|----------------|--------|
| **Sales Comparison - Residential** | `financing_terms`, `conditions_of_sale` | Cannot identify non-market transactions, financing concessions |
| **Sales Comparison - Commercial** | `financing_terms`, `conditions_of_sale`, `property_rights`, `time_market_conditions` | Missing 4 of 9 elements of comparison |

#### 🟡 MEDIUM Priority (Lease & Cap Rate Comps)

| Approach | Missing Fields | Impact |
|----------|----------------|--------|
| **Lease Comps** | `escalations`, `ti_allowance`, `free_rent`, `renewal_options`, `location`, `condition`, `time` | Cannot calculate effective rent, cannot compare different lease structures |
| **Cap Rate Comps** | `location_quality`, `tenant_credit`, `lease_terms`, `occupancy`, `market_tier`, `time`, `management_intensity` | Cannot adjust for risk factors, cap rates not comparable |
| **Multi-Family/GRM** | `GRM_calculation`, `unit_mix_comparison`, `amenities`, `occupancy`, `location`, `time` | Missing GRM method entirely, limited adjustment capability |

---

## Implementation Recommendations

### Phase 1: CRITICAL - Cost Approach Redesign (Weeks 1-3)

**Priority:** 🔴 **CRITICAL - Must Fix**

This is a fundamental error that produces incorrect valuations and violates appraisal standards.

#### Actions Required:

1. **Remove All Adjustment Fields from Cost Approach**
   ```javascript
   // DELETE FROM: packages/frontend/src/pages/appraisal/overview/cost/
   // - comps_adjustments structure
   // - adj_key/adj_value fields
   // - time, location, condition adjustments
   ```

2. **Add Depreciation Framework**
   ```typescript
   interface CostApproachDepreciation {
     physical_deterioration: {
       curable: number,
       incurable_short_lived: number,
       incurable_long_lived: number,
       total: number
     },
     functional_obsolescence: {
       curable: number,
       incurable: number,
       total: number
     },
     external_obsolescence: number,
     total_depreciation: number,
     depreciation_percentage: number
   }
   ```

3. **Redesign Cost Comps** (if used)
   - Use ONLY for extracting cost data
   - No adjustments to sale prices
   - Weight for averaging cost/SF data

4. **Update Database Schema**
   - Add depreciation tables
   - Remove adjustment tables from cost approach
   - Migration script to convert existing data

#### Files to Modify:
- `packages/frontend/src/pages/appraisal/overview/cost/cost-approach.tsx`
- `packages/frontend/src/pages/evaluation/evaluation-cost-approach/evaluation-cost-approach.tsx`
- `packages/backend/src/services/appraisalCostApproach/`
- `packages/backend/src/services/evaluationCostApproach/`
- Database migrations

---

### Phase 2: Sales Comparison Enhancement (Weeks 4-6)

**Priority:** 🟡 **MEDIUM - Important for Compliance**

Add missing transactional adjustments to fully comply with USPAP elements of comparison.

#### Actions Required:

1. **Add Transactional Adjustment Fields**
   ```javascript
   // ADD TO: packages/frontend/src/utils/staticCompData.ts
   
   // Residential
   { adj_key: 'financing_terms', adj_value: '$0.00', appraisal_default: true },
   { adj_key: 'conditions_of_sale', adj_value: '$0.00', appraisal_default: true },
   
   // Commercial (also add)
   { comparison_key: 'financing_terms', comparison_value: '' },
   { comparison_key: 'conditions_of_sale', comparison_value: '' },
   { comparison_key: 'property_rights', comparison_value: '' },
   { comparison_key: 'time_market_conditions', comparison_value: '' },
   ```

2. **Consolidate Redundant Fields**
   - Merge 'fencing' into 'other_amenities'
   - Combine quality + condition into single field

3. **Add Property-Type Conditional Logic**
   ```typescript
   function getSalesAdjustments(propertyType: string) {
     const baseAdjustments = [...];
     
     if (propertyType === 'Industrial' || propertyType === 'Warehouse') {
       baseAdjustments.push('ceiling_height', 'loading_docks');
     }
     
     return baseAdjustments;
   }
   ```

---

### Phase 3: Lease & Cap Rate Comps (Weeks 7-10)

**Priority:** 🟡 **MEDIUM - Enhances Functionality**

Add specialized adjustments for lease and cap rate analysis.

#### Lease Comps:

1. **Add Lease Term Fields**
   ```javascript
   { adj_key: 'escalations', adj_value: '', type: 'text' },
   { adj_key: 'ti_allowance_psf', adj_value: '$0.00', type: 'currency' },
   { adj_key: 'free_rent_months', adj_value: '0', type: 'number' },
   { adj_key: 'renewal_options', adj_value: '', type: 'text' },
   ```

2. **Add Effective Rent Calculation**
   ```typescript
   function calculateEffectiveRent(lease: LeaseComp) {
     const freeRentValue = (lease.free_rent_months / lease.term_months) 
                          × lease.contract_rent_psf_year;
     const tiAnnualCost = lease.ti_allowance_psf / (lease.term_months / 12);
     return lease.contract_rent_psf_year - freeRentValue - tiAnnualCost;
   }
   ```

#### Cap Rate Comps:

1. **Add Risk Factor Fields**
   ```javascript
   { adj_key: 'location_quality_grade', type: 'select', 
     options: ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D'] },
   { adj_key: 'tenant_credit_quality', type: 'select',
     options: ['Investment Grade', 'Regional', 'Local', 'Startup'] },
   { adj_key: 'occupancy_rate_percent', type: 'number', range: '0-100' },
   ```

2. **Add Cap Rate Adjustment Calculator**
   ```typescript
   function adjustCapRate(comp: CapRateComp, subject: Subject) {
     let adjustment = 0;
     
     // Location: A vs C location = 2% difference
     adjustment += locationCapAdjustment(subject, comp);
     
     // Tenant quality: Credit vs local = 1.5% difference
     adjustment += tenantCapAdjustment(subject, comp);
     
     // Occupancy: Below 90% = +4% per 10% vacancy
     if (comp.occupancy < 90) {
       adjustment += (90 - comp.occupancy) × 0.04;
     }
     
     return comp.cap_rate_as_sold + adjustment;
   }
   ```

---

### Phase 4: Multi-Family GRM (Weeks 11-13)

**Priority:** 🟡 **MEDIUM - Adds Critical Metric**

Implement GRM calculations and amenity analysis.

#### Actions Required:

1. **Add GRM Calculations**
   ```javascript
   // AUTO-CALCULATE from existing data
   monthly_gross_rent: sum(unit_rents),
   annual_gross_rent: monthly_gross_rent × 12,
   grm_monthly: sale_price ÷ monthly_gross_rent,
   grm_annual: sale_price ÷ annual_gross_rent
   ```

2. **Add Amenity Checklist**
   ```javascript
   amenities: {
     type: 'checklist',
     options: [
       'Pool', 'Fitness Center', 'Clubhouse', 'Dog Park',
       'In-Unit Laundry', 'Covered Parking', 'Elevator', 'Gated'
     ]
   }
   ```

3. **Add Unit Mix Similarity**
   ```typescript
   function compareUnitMix(subject, comp) {
     // Calculate percentage difference in unit mix
     // Return similarity score 0-100%
   }
   ```

---

### Implementation Priority Matrix

| Phase | Approach | Effort | Business Impact | Technical Risk | Priority |
|-------|----------|--------|-----------------|----------------|----------|
| **1** | Cost Approach Fix | 🔴 HIGH | 🔴 CRITICAL (Incorrect values) | 🟡 MEDIUM | **DO FIRST** |
| **2** | Sales Comparison | 🟡 MEDIUM | 🟡 HIGH (USPAP compliance) | 🟢 LOW | **DO SECOND** |
| **3** | Lease & Cap Rate | 🟡 MEDIUM | 🟡 MEDIUM (Better analysis) | 🟢 LOW | **DO THIRD** |
| **4** | Multi-Family GRM | 🟢 LOW | 🟡 MEDIUM (Missing metric) | 🟢 LOW | **DO FOURTH** |

---

### Testing Requirements

After each phase, verify:

#### Cost Approach:
- [ ] No adjustment fields visible
- [ ] Depreciation input interface working
- [ ] Calculation: Land + (Cost - Depreciation) = Value
- [ ] Cost comps used for data only, not adjusted

#### Sales Comparison:
- [ ] Financing terms field functional
- [ ] Conditions of sale field functional
- [ ] Property-type conditional fields working
- [ ] Adjustments calculate correctly

#### Lease Comps:
- [ ] Effective rent calculation working
- [ ] Lease term adjustments functional
- [ ] TI allowance and free rent tracked

#### Cap Rate Comps:
- [ ] Risk factor adjustments functional
- [ ] Cap rate adjustment calculation correct
- [ ] Adjusted cap rates display properly

#### Multi-Family:
- [ ] GRM calculations automatic
- [ ] Amenity checklist functional
- [ ] Unit mix comparison working

---

## Conclusion

This analysis reveals one **CRITICAL** issue and several **IMPORTANT** enhancements:

### Critical Finding
The **Cost Approach** is fundamentally misimplemented. It uses comp adjustments when it should use depreciation calculations. This produces incorrect values and violates appraisal standards. **This must be fixed immediately.**

### Important Findings
1. **Sales Comparison Approach** is mostly correct but missing 2 critical transactional adjustments
2. **Lease Comps** and **Cap Rate Comps** need specialized adjustments for their unique methodologies
3. **Multi-Family** approach is missing the GRM calculation method
4. **Income Approach** and **Rent Roll** are correctly implemented

### Recommended Action Plan
1. **Immediate (Weeks 1-3):** Fix Cost Approach - remove adjustments, add depreciation
2. **Short-term (Weeks 4-6):** Enhance Sales Comparison with transactional fields
3. **Medium-term (Weeks 7-13):** Add specialized fields to Lease, Cap Rate, and Multi-Family approaches

By addressing these issues, the Harken system will fully comply with industry standards and USPAP requirements while providing appraisers with the proper tools for accurate valuations.

---

**Document End**

*For questions or implementation assistance, contact the development team.*








