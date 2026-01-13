# Commercial Appraisal Report Structure Analysis

> **Document Purpose**: Reference guide for building the Harken Appraisal Wizard report generation system.
> **Created**: January 2026
> **Source Files Analyzed**: 8 professional appraisal reports from the Harken Docs folder

---

## Executive Summary

This analysis documents the structure of professional commercial appraisal reports to inform the development of a comprehensive 150+ page report generation system. The key finding is that professional reports require **scenario-specific valuation sections** (As Is, As Completed, As Stabilized), each containing their own complete set of approaches with individual comparable detail pages.

---

## Sample Appraisals Analyzed

| File | Property Type | Page Count | Key Features |
|------|---------------|------------|--------------|
| 20180131-CBRE-Appraisal.pdf | Commercial (National Western Life) | 93 pages | CBRE institutional format, comprehensive |
| 34_N_Bozeman_Appraisal_Oct_2021.pdf | Commercial | ~80+ pages | Local market analysis |
| 40 N Last Chance Gulch.Bay Holdings LLC.pdf | Mixed-Use/Commercial | ~70+ pages | Helena, MT market |
| 750 Southgate Appraisal.pdf | Commercial | ~60+ pages | Standard format |
| Final Appraisal Report - 6907 Entryway Drive.pdf | Commercial | ~80+ pages | Industrial/flex space |
| Final Appraisal Report-Stevensville Development.pdf | Development/Land | ~70+ pages | Development potential |
| NW MT Human Resource Inc - 214 S Main.pdf | Office | ~50+ pages | Single-tenant office |
| Zimmerman Trail Apartments Billings MT-2.pdf | Multi-Family | ~90+ pages | Apartment complex |

---

## Standard Report Structure (USPAP Compliant)

### SECTION 1: FRONT MATTER (10-15 pages)

#### 1.1 Cover Page
- Property photograph (primary exterior)
- Property name and address
- Client name
- Appraisal firm name and logo
- File/reference number
- Effective date of value
- Report date

#### 1.2 Letter of Transmittal (2-3 pages)
- Addressed to client
- Property identification
- Purpose and intended use
- Effective date(s) of value - **ALL SCENARIOS LISTED**
- Value conclusion(s) - **ALL SCENARIOS LISTED**
- Scope of work summary
- Extraordinary assumptions (if any)
- Hypothetical conditions (if any)
- Appraiser signature and credentials

#### 1.3 Table of Contents (2-4 pages)
- Detailed section listing with page numbers
- Nested structure for approach subsections
- Addenda listing

#### 1.4 Certification (2-3 pages)
- USPAP-required certification statements
- Appraiser qualifications summary
- License information
- Signature blocks (lead appraiser + any additional signers)

#### 1.5 Executive Summary / Summary of Salient Facts (2-4 pages)
**Property Identification:**
- Property name
- Address
- Legal description
- Tax parcel ID
- Owner/client information

**Property Characteristics:**
- Property type/subtype
- Land area (acres/SF)
- Building area (GBA/NRA)
- Year built
- Number of units/tenants
- Current occupancy

**Value Conclusions (ALL SCENARIOS):**
| Scenario | Effective Date | Value Conclusion | Value per SF |
|----------|----------------|------------------|--------------|
| As Is | [Date] | $X,XXX,XXX | $XXX.XX |
| As Completed | [Date] | $X,XXX,XXX | $XXX.XX |
| As Stabilized | [Date] | $X,XXX,XXX | $XXX.XX |

**Key Dates:**
- Inspection date
- Report date
- Effective date(s)

---

### SECTION 2: REGIONAL & AREA ANALYSIS (15-25 pages)

#### 2.1 Regional Economic Overview (3-5 pages)
- State/MSA economic conditions
- Population trends
- Employment statistics
- Major employers
- Economic outlook

#### 2.2 Local Area Analysis (3-5 pages)
- City/county overview
- Government and infrastructure
- Transportation access
- Development trends

#### 2.3 Neighborhood Description (3-5 pages)
- Immediate surroundings
- Land use patterns
- Access and visibility
- Demographic profile
- Growth trends

#### 2.4 Demographics Analysis (3-5 pages)
- Population (1-mile, 3-mile, 5-mile radii)
- Households
- Income levels (median, average)
- Age distribution
- Employment by sector

#### 2.5 Market Analysis (5-8 pages)
- Property type-specific market data
- Supply analysis (inventory, new construction)
- Demand analysis (absorption, vacancy trends)
- Rent trends
- Cap rate trends
- Competitive property analysis
- Market cycle position
- Supply/demand conclusion

---

### SECTION 3: SUBJECT PROPERTY ANALYSIS (20-35 pages)

#### 3.1 Site Description (4-6 pages)
- Location and access
- Size and dimensions
- Topography
- Utilities
- Zoning (current and compliant uses)
- Easements and restrictions
- Environmental considerations
- Flood zone status
- Site improvements (parking, landscaping)
- **Site photographs (2-4 photos)**

#### 3.2 Improvements Description (6-10 pages)
- Building summary (type, size, stories)
- Construction details
  - Foundation
  - Structural frame
  - Exterior walls
  - Roof
  - Windows/doors
- Interior finish
  - Flooring
  - Walls/ceilings
  - Lighting
- Mechanical systems
  - HVAC
  - Plumbing
  - Electrical
  - Fire protection
- Building condition assessment
- Effective age analysis
- Remaining economic life
- **Building photographs (6-12 photos with captions)**

#### 3.3 Real Property Taxes (1-2 pages)
- Current assessed value
- Tax rate
- Annual taxes
- Tax comparables (if applicable)

#### 3.4 Zoning Analysis (2-3 pages)
- Current zoning designation
- Permitted uses
- Bulk regulations (FAR, setbacks, height)
- Parking requirements
- Zoning compliance status

---

### SECTION 4: HIGHEST & BEST USE (8-15 pages)

#### 4.1 As Vacant Analysis (4-6 pages)
**Four Tests:**
1. **Legally Permissible** - What uses are allowed by zoning?
2. **Physically Possible** - What can the site physically support?
3. **Financially Feasible** - Which uses would generate positive return?
4. **Maximally Productive** - Which use generates highest value?

**Conclusion:** [Identified highest and best use as vacant]

#### 4.2 As Improved Analysis (4-6 pages)
**Considerations:**
- Current use vs. alternative uses
- Demolition analysis (if applicable)
- Renovation/conversion analysis
- Expansion potential

**Conclusion:** [Identified highest and best use as improved]

#### 4.3 Most Probable Buyer (1-2 pages)
- Investor profile
- Typical buyer characteristics
- Market participant analysis

---

## SECTION 5: VALUATION - AS IS SCENARIO (35-50 pages)

> **CRITICAL**: For multi-scenario appraisals, this entire section is REPEATED for each scenario (As Completed, As Stabilized, etc.) with scenario-specific data and analysis.

### 5.1 Scenario Introduction (1 page)
- Scenario definition
- Effective date
- Key assumptions specific to this scenario
- Property condition/status at effective date

---

### 5.2 LAND VALUATION (8-12 pages)

#### 5.2.1 Land Valuation Methodology (1-2 pages)
- Sales comparison approach
- Unit of comparison (per acre, per SF, per unit)
- Data sources

#### 5.2.2 Land Comparable Sales - INDIVIDUAL PAGES (4-8 pages)
**Each comparable gets a FULL PAGE containing:**

```
┌─────────────────────────────────────────────────────────────────┐
│  LAND SALE 1                                                    │
├─────────────────────────────────────────────────────────────────┤
│  [PHOTOGRAPH - Half page]                                       │
│                                                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Property Data:                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  Address:           123 Example Street, City, ST 12345          │
│  Sale Date:         January 15, 2024                            │
│  Sale Price:        $1,250,000                                  │
│  Grantor:           ABC Holdings LLC                            │
│  Grantee:           XYZ Development Corp                        │
│  Document #:        2024-001234                                 │
│  Verification:      Buyer's representative                      │
│  ─────────────────────────────────────────────────────────────  │
│  Site Data:                                                     │
│  ─────────────────────────────────────────────────────────────  │
│  Land Area:         2.50 Acres                                  │
│  Price/Acre:        $500,000                                    │
│  Zoning:            C-2 (Commercial)                            │
│  Topography:        Generally level                             │
│  Utilities:         All available                               │
│  ─────────────────────────────────────────────────────────────  │
│  Comments:                                                      │
│  This sale represents an arm's-length transaction of a          │
│  commercial site with similar characteristics to the subject.   │
│  The site was purchased for development of a retail center.     │
└─────────────────────────────────────────────────────────────────┘
```

#### 5.2.3 Land Sales Comparison Grid (1-2 pages)
- Subject property column
- All comparables in columns
- Adjustment rows for each element
- Net/gross adjustment calculations
- Adjusted price indications

#### 5.2.4 Land Value Conclusion (1 page)
- Range of adjusted values
- Reconciliation narrative
- Concluded land value

---

### 5.3 SALES COMPARISON APPROACH (15-25 pages)

#### 5.3.1 Methodology (2-3 pages)
- Approach description
- Unit of comparison selection (per SF, per unit, overall)
- Data sources
- Selection criteria for comparables

#### 5.3.2 Improved Sales - INDIVIDUAL PAGES (6-12 pages)
**Each comparable gets a FULL PAGE containing:**

```
┌─────────────────────────────────────────────────────────────────┐
│  IMPROVED SALE 1                                                │
├─────────────────────────────────────────────────────────────────┤
│  [PHOTOGRAPH - Half page]                                       │
│                                                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Transaction Data:                                              │
│  ─────────────────────────────────────────────────────────────  │
│  Address:           456 Commercial Blvd, City, ST 12345         │
│  Sale Date:         March 20, 2024                              │
│  Sale Price:        $4,500,000                                  │
│  Price/SF:          $185.00                                     │
│  Financing:         Cash to seller                              │
│  Conditions:        Arm's length                                │
│  Verification:      CoStar, Buyer interview                     │
│  ─────────────────────────────────────────────────────────────  │
│  Property Data:                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  Property Type:     Retail - Strip Center                       │
│  Year Built:        2018                                        │
│  Building Size:     24,324 SF (GBA)                             │
│  Land Area:         2.10 Acres                                  │
│  Occupancy:         95%                                         │
│  Cap Rate:          6.75%                                       │
│  ─────────────────────────────────────────────────────────────  │
│  Comments:                                                      │
│  Multi-tenant retail center located on major arterial with      │
│  good visibility. National credit tenants anchor the center.    │
│  Property was well-maintained at time of sale.                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 5.3.3 Sales Comparison Grid (2-4 pages)
**Adjustment Categories:**
- Property rights conveyed
- Financing terms
- Conditions of sale
- Market conditions (time)
- Location
- Physical characteristics (size, age, condition, quality)
- Economic characteristics (occupancy, lease terms)

**Grid Format:**
| Element | Subject | Sale 1 | Sale 2 | Sale 3 | Sale 4 | Sale 5 |
|---------|---------|--------|--------|--------|--------|--------|
| Sale Price | - | $4,500,000 | ... | ... | ... | ... |
| Price/SF | - | $185.00 | ... | ... | ... | ... |
| Property Rights | Fee Simple | 0% | ... | ... | ... | ... |
| Financing | Cash | 0% | ... | ... | ... | ... |
| Conditions of Sale | Arm's Length | 0% | ... | ... | ... | ... |
| Market Conditions | [Date] | +3% | ... | ... | ... | ... |
| Location | [Subject] | -5% | ... | ... | ... | ... |
| Size | XX,XXX SF | +3% | ... | ... | ... | ... |
| Age/Condition | [Year] | 0% | ... | ... | ... | ... |
| Quality | Average | -2% | ... | ... | ... | ... |
| **Net Adjustment** | | -1% | ... | ... | ... | ... |
| **Adjusted Price/SF** | | $183.15 | ... | ... | ... | ... |

#### 5.3.4 Qualitative Analysis (1-2 pages)
- Relative comparison (inferior/similar/superior)
- Bracketing analysis
- Range narrowing

#### 5.3.5 Sales Comparison Conclusion (1-2 pages)
- Value range
- Reconciliation narrative
- Concluded value via Sales Comparison

---

### 5.4 INCOME APPROACH (15-25 pages)

#### 5.4.1 Methodology (2-3 pages)
- Direct capitalization vs. DCF explanation
- Method selection rationale
- Market participant analysis

#### 5.4.2 Rent Comparables - INDIVIDUAL PAGES (4-8 pages)
**Each rent comparable gets a FULL PAGE:**

```
┌─────────────────────────────────────────────────────────────────┐
│  RENT COMPARABLE 1                                              │
├─────────────────────────────────────────────────────────────────┤
│  [PHOTOGRAPH - Half page]                                       │
│                                                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Property Data:                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  Property Name:     Sunset Business Center                      │
│  Address:           789 Business Park Drive, City, ST           │
│  Property Type:     Office - Class B                            │
│  Year Built:        2015                                        │
│  Building Size:     45,000 SF                                   │
│  ─────────────────────────────────────────────────────────────  │
│  Lease Data:                                                    │
│  ─────────────────────────────────────────────────────────────  │
│  Tenant:            Regional Insurance Co.                      │
│  Leased Space:      5,500 SF                                    │
│  Lease Date:        October 2024                                │
│  Lease Term:        5 years                                     │
│  Base Rent:         $18.50/SF NNN                               │
│  Escalations:       3% annually                                 │
│  TI Allowance:      $15.00/SF                                   │
│  Free Rent:         2 months                                    │
│  ─────────────────────────────────────────────────────────────  │
│  Comments:                                                      │
│  New lease to regional credit tenant in similar quality         │
│  building. Market rate transaction with standard terms.         │
└─────────────────────────────────────────────────────────────────┘
```

#### 5.4.3 Rent Comparable Grid (1-2 pages)
- Comparison of rental rates
- Adjustments for differences
- Concluded market rent

#### 5.4.4 Expense Analysis (2-4 pages)
- Historical operating expenses (if available)
- Expense comparables
- Expense ratio analysis
- Stabilized expense projection

#### 5.4.5 Reconstructed Operating Statement (2-3 pages)
```
RECONSTRUCTED OPERATING STATEMENT

Potential Gross Income (PGI)
  Rental Income - Contract Rent        $XXX,XXX
  Rental Income - Market Rent          $XXX,XXX
  Other Income                         $XX,XXX
  ─────────────────────────────────────────────
  Total PGI                            $XXX,XXX

Less: Vacancy & Collection Loss (X%)   ($XX,XXX)
  ─────────────────────────────────────────────
Effective Gross Income (EGI)           $XXX,XXX

Less: Operating Expenses
  Real Estate Taxes                    $XX,XXX
  Insurance                            $X,XXX
  Utilities                            $XX,XXX
  Repairs & Maintenance                $XX,XXX
  Management (X%)                      $XX,XXX
  Reserves                             $X,XXX
  ─────────────────────────────────────────────
  Total Operating Expenses             $XX,XXX

NET OPERATING INCOME (NOI)             $XXX,XXX
```

#### 5.4.6 Capitalization Rate Analysis (2-3 pages)
- Market extraction from sales
- Investor survey data
- Band of investment
- Debt coverage ratio analysis
- Concluded cap rate

#### 5.4.7 Direct Capitalization (1-2 pages)
```
NOI / Cap Rate = Value
$XXX,XXX / X.XX% = $X,XXX,XXX
```

#### 5.4.8 DCF Analysis (if applicable) (3-5 pages)
- Holding period
- Income/expense projections
- Reversion analysis
- Discount rate selection
- NPV calculation

#### 5.4.9 Income Approach Conclusion (1-2 pages)
- Reconciliation of methods
- Concluded value via Income Approach

---

### 5.5 COST APPROACH (10-15 pages)

#### 5.5.1 Methodology (1-2 pages)
- Replacement cost new approach
- Cost sources (Marshall & Swift, contractor estimates)

#### 5.5.2 Land Value (1 page)
- Reference to land valuation section
- Concluded land value

#### 5.5.3 Replacement Cost Estimate (2-4 pages)
- Base cost per SF
- Quality adjustments
- Size adjustments
- Regional modifiers
- Soft costs
- Entrepreneurial profit
- Total RCN

#### 5.5.4 Depreciation Analysis (3-5 pages)
**Physical Depreciation:**
- Age-life method
- Component breakdown (if applicable)

**Functional Obsolescence:**
- Curable items
- Incurable items
- Superadequacy

**External Obsolescence:**
- Market conditions
- Location factors

#### 5.5.5 Cost Approach Conclusion (1-2 pages)
```
Replacement Cost New                   $X,XXX,XXX
Less: Physical Depreciation           ($XXX,XXX)
Less: Functional Obsolescence         ($XX,XXX)
Less: External Obsolescence           ($XX,XXX)
  ─────────────────────────────────────────────
Depreciated Cost of Improvements       $X,XXX,XXX
Plus: Land Value                       $XXX,XXX
Plus: Site Improvements                $XX,XXX
  ─────────────────────────────────────────────
INDICATED VALUE - COST APPROACH        $X,XXX,XXX
```

---

### 5.6 SCENARIO RECONCILIATION (3-5 pages)

#### 5.6.1 Value Indications Summary
| Approach | Value Indication | Weight |
|----------|------------------|--------|
| Sales Comparison | $X,XXX,XXX | XX% |
| Income Approach | $X,XXX,XXX | XX% |
| Cost Approach | $X,XXX,XXX | XX% |

#### 5.6.2 Approach Weighting Rationale
- Discussion of each approach's applicability
- Market participant analysis
- Data quality assessment

#### 5.6.3 Final Value Conclusion - [SCENARIO NAME]
- Concluded market value
- Effective date
- Exposure time
- Marketing time

---

## SECTION 6: AS COMPLETED VALUATION (25-35 pages)

> **Repeat the entire valuation section (5.1-5.6) with:**
> - Prospective effective date
> - Completed improvements assumption
> - Adjusted comparables reflecting completed condition
> - Pro forma income projections

**Additional Requirements:**
- Description of proposed improvements
- Construction budget analysis
- Development timeline
- Entrepreneurial profit consideration

---

## SECTION 7: AS STABILIZED VALUATION (20-30 pages)

> **Repeat the entire valuation section (5.1-5.6) with:**
> - Prospective stabilization date
> - Stabilized occupancy assumption (typically 93-95%)
> - Market rent projections at stabilization

**Additional Requirements:**
- Absorption analysis
- Lease-up timeline
- Stabilization assumptions
- Discount for lease-up (if applicable)

---

## SECTION 8: FINAL RECONCILIATION (5-8 pages)

### 8.1 Multi-Scenario Value Summary
| Scenario | Effective Date | Market Value | Per SF |
|----------|----------------|--------------|--------|
| As Is | [Date] | $X,XXX,XXX | $XXX |
| As Completed | [Date] | $X,XXX,XXX | $XXX |
| As Stabilized | [Date] | $X,XXX,XXX | $XXX |

### 8.2 Value Progression Analysis
- Timeline visualization
- Value creation through development
- Risk factors between scenarios

### 8.3 Exposure Time & Marketing Time
- Definition distinction
- Market-derived analysis
- Concluded periods per scenario

---

## SECTION 9: ASSUMPTIONS & LIMITING CONDITIONS (4-6 pages)

### 9.1 General Assumptions
- Standard USPAP assumptions
- Property inspection limitations
- Data source reliability

### 9.2 Limiting Conditions
- Standard limitations
- Specific limitations for this assignment

### 9.3 Extraordinary Assumptions (if any)
- Clear statement of each assumption
- Impact on value if assumption proves false

### 9.4 Hypothetical Conditions (if any)
- Clear statement of each condition
- Purpose and impact

---

## SECTION 10: ADDENDA (15-25 pages)

### 10.1 Appraiser Qualifications (2-4 pages)
- Resume/CV
- Education
- Certifications and licenses
- Relevant experience

### 10.2 License Copies (1-2 pages)
- State license(s)
- Designations

### 10.3 Engagement Letter (2-3 pages)
- Scope of work
- Fee arrangement
- Client authorization

### 10.4 Legal Description (1 page)

### 10.5 Subject Property Photographs (4-8 pages)
- Exterior views (4+ photos)
- Interior views (4+ photos)
- Site/parking areas
- Mechanical systems
- Each with captions

### 10.6 Comparable Location Maps (2-4 pages)
- Subject location map
- Land sales map
- Improved sales map
- Rent comparables map

### 10.7 Aerial Photographs (1-2 pages)

### 10.8 Supporting Documentation
- Tax records
- Rent roll (if income property)
- Operating statements
- Leases (summaries)
- Environmental reports (reference)

---

## Key Findings for Harken Implementation

### 1. Scenario-Based Architecture Required
The report structure must be **scenario-aware**. Each scenario (As Is, As Completed, As Stabilized) requires:
- Its own complete set of approaches
- Individual comparable detail pages per scenario
- Scenario-specific reconciliation

### 2. Individual Comparable Pages are Essential
Professional reports dedicate **one full page per comparable** containing:
- Large photograph
- Complete property data
- Transaction details
- Narrative comments

This significantly increases page count and provides the data justification required for USPAP compliance.

### 3. Sidebar Navigation Must Support Nesting
The report preview sidebar should organize content as:
```
├── Front Matter
├── Regional Analysis
├── Subject Property
├── Highest & Best Use
├── AS IS VALUATION
│   ├── Land Valuation
│   │   ├── Methodology
│   │   ├── Land Sale 1
│   │   ├── Land Sale 2
│   │   └── Grid & Conclusion
│   ├── Sales Comparison
│   │   ├── Methodology
│   │   ├── Improved Sale 1
│   │   ├── Improved Sale 2
│   │   └── Grid & Conclusion
│   ├── Income Approach
│   │   ├── Methodology
│   │   ├── Rent Comp 1
│   │   └── Analysis & Conclusion
│   ├── Cost Approach
│   └── As Is Reconciliation
├── AS COMPLETED VALUATION
│   └── [Same structure]
├── AS STABILIZED VALUATION
│   └── [Same structure]
├── Final Reconciliation
└── Addenda
```

### 4. Target Page Counts by Section

| Section | Single Scenario | With 3 Scenarios |
|---------|-----------------|------------------|
| Front Matter | 12 | 12 |
| Regional/Area Analysis | 20 | 20 |
| Subject Property | 25 | 25 |
| Highest & Best Use | 12 | 12 |
| Valuation (per scenario) | 45 | 135 (45 x 3) |
| Final Reconciliation | 6 | 10 |
| Addenda | 20 | 20 |
| **TOTAL** | ~140 | ~234 |

### 5. Grid Formats Identified

**Land Sales Grid**: Price per acre/SF, adjustments for location, size, zoning, utilities, topography

**Improved Sales Grid**: Price per SF, adjustments for property rights, financing, conditions, market conditions, location, size, age, condition, quality

**Rent Comparable Grid**: Base rent per SF, lease type, term, escalations, TI/concessions, effective rent

**Cost Approach Grid**: RCN calculation, depreciation by category, site improvements

---

## Implementation Priority

### Phase 1: Foundation
1. Add `scenarioId` to ReportSection type
2. Create scenario grouping in sidebar
3. Color-code scenarios (As Is = blue, Completed = green, Stabilized = purple)

### Phase 2: Comparable Detail Pages
1. Create `ComparableDetailPage` component
2. One full-page layout per comparable
3. Photo, data grid, narrative sections

### Phase 3: Dynamic Generation
1. Generate sections per scenario
2. Individual pages per comparable
3. Scenario-specific grids and conclusions

### Phase 4: Professional Polish
1. Page numbering with section prefixes
2. Headers/footers with property name
3. PDF export optimization

---

---

## Current Harken Report Preview Structure (Gap Analysis)

Based on observation of the current Report Preview interface, the existing structure is:

```
├── Property Description
├── Neighborhood Demographics
├── Economic Context
├── Market Analysis
├── Highest & Best Use
├── SWOT Analysis
├── Sales Comparison Approach  ← SINGLE INSTANCE
├── Income Approach           ← SINGLE INSTANCE
├── Cost Approach             ← SINGLE INSTANCE
├── Reconciliation of Value   ← SINGLE RECONCILIATION
├── Assumptions & Limiting Conditions
├── Appraiser Certification
├── Photo Exhibits
└── Addenda - Supporting Documents
```

### Critical Gaps Identified:

1. **No Scenario Grouping** - All approaches are at the same level with no parent grouping for "As Is", "As Completed", "As Stabilized"

2. **Single Instance of Each Approach** - Only one Sales Comparison, one Income Approach, one Cost Approach exist. Multi-scenario appraisals require each approach repeated per scenario.

3. **No Individual Comparable Pages** - Current structure uses grid views only. Professional reports require one full-page per comparable.

4. **Missing Land Valuation Section** - Land valuation should be a separate section under each scenario (distinct from Cost Approach land value).

5. **Single Reconciliation** - Should be per-scenario reconciliation PLUS final multi-scenario reconciliation.

### Required Transformation:

**FROM (Current):**
```
├── Sales Comparison Approach
├── Income Approach
├── Cost Approach
└── Reconciliation
```

**TO (Professional Standard):**
```
├── AS IS VALUATION
│   ├── Land Valuation
│   │   ├── Land Sale 1 (full page)
│   │   ├── Land Sale 2 (full page)
│   │   └── Land Sales Grid & Conclusion
│   ├── Sales Comparison
│   │   ├── Improved Sale 1 (full page)
│   │   ├── Improved Sale 2 (full page)
│   │   └── Sales Grid & Conclusion
│   ├── Income Approach
│   │   ├── Rent Comp 1 (full page)
│   │   ├── Rent Comp 2 (full page)
│   │   └── Income Analysis & Conclusion
│   ├── Cost Approach
│   └── As Is Reconciliation
├── AS COMPLETED VALUATION
│   └── [Same nested structure]
├── AS STABILIZED VALUATION
│   └── [Same nested structure]
└── Final Reconciliation (all scenarios)
```

---

## Files Requiring Modification

Based on codebase analysis, the following files need updates:

### Core Type Changes
- `prototypes/appraisal-wizard-react/src/features/review/types.ts`
  - Add `scenarioId?: number` to ReportSection
  - Add `scenarioName?: string` to ReportSection
  - Add `comparableId?: string` for individual comparable pages

### Constants
- `prototypes/appraisal-wizard-react/src/features/review/constants.ts`
  - Restructure to be scenario-template-based
  - Create `SCENARIO_SECTION_TEMPLATE` that gets cloned per scenario

### Report Editor
- `prototypes/appraisal-wizard-react/src/features/review/components/ReportEditor.tsx`
  - Update `useMemo` for sections to generate per-scenario
  - Add scenario header rendering
  - Add individual comparable page rendering

### New Components Needed
- `ComparableDetailPage.tsx` - Full page layout for individual comparables
- `ScenarioHeader.tsx` - Visual divider between scenarios
- `ScenarioReconciliationPage.tsx` - Per-scenario value conclusion

---

*This document should be updated as additional appraisal samples are analyzed or as implementation requirements evolve.*
