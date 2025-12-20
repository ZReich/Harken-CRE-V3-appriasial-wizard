# Appraisal Wizard Property-Type Architecture

This document extends the current `appraisal-wizard-prototype.html` to support property-type branching, configurable valuation approaches, automatic scenario determination, and a pre-PDF review experience aligned with the Evaluation Wizard.

---

## 1. Industry Standards & Regulatory Basis

This section establishes the regulatory foundation for automating valuation approach and scenario selection. The automation described in this document aligns with established appraisal standards and is not arbitrary—it reflects how professional appraisers already make these decisions.

### 1.1 USPAP Compliance

The Uniform Standards of Professional Appraisal Practice (USPAP) governs real estate appraisal in the United States:

- **Standards Rule 1-4**: Requires appraisers to collect, verify, and analyze information necessary to develop credible assignment results, including selecting applicable valuation approaches.
- **Standards Rule 2**: Requires appraisers to clearly communicate the approaches used and explain why certain approaches were developed or not developed.
- **Key Principle**: All three approaches (Cost, Sales Comparison, Income) must remain *accessible* to the appraiser. The system recommends but never forces—appraiser judgment is preserved.

### 1.2 Interagency Appraisal and Evaluation Guidelines

The Federal Reserve, OCC, FDIC, and NCUA jointly publish the Interagency Appraisal and Evaluation Guidelines, which provide specific guidance on prospective values:

> "A prospective market value may be appropriate for the valuation of a property interest related to a credit decision for a proposed development or renovation project."
> — Federal Reserve Interagency Guidelines

Key requirements from these guidelines:
- **Construction Loans**: Require both "As Completed" and "As Stabilized" values
- **Renovation Projects**: May require "As Is" and "As Completed" values
- **Income Properties**: Must use Income Approach when the property generates income
- **Effective Dates**: Each scenario must have a clearly stated effective date

### 1.3 Industry Practice Reference

The following table shows how appraisers already select approaches based on property type in practice:

| Property Type | Primary Approach(es) | Reason |
|--------------|---------------------|--------|
| Residential – Single Family | Sales Comparison | Abundant comparable sales data available |
| Residential – Multi-Family | Income (GRM/Direct Cap), Sales | Income-producing nature; investors value based on NOI |
| Commercial – Office/Retail | Income (Direct Cap/DCF), Sales | Tenants and lease income drive value |
| Commercial – Industrial | Income, Sales, Cost | Cost important for specialized improvements |
| Land – Finished/Entitled | Sales Comparison | Comparable lot sales most reliable |
| Land – Agricultural | Sales, Income | Crop income potential affects value |

**Why Automation is Valid**: Appraisers already make these selections based on property type. Automating the *defaults* eliminates repetitive decisions while preserving override capability. This approach is used by major appraisal software platforms including ACI, à la mode (Total), and CoreLogic commercial products.

---

## 2. Workflow Mapping

### 2.1 Entry Flow
1. **Engagement Setup**
   - User selects *Commercial*, *Residential*, or *Land* immediately after project creation (mirrors Evaluation Wizard landing screen).
   - Each choice stores `propertyType` on the project record and hydrates downstream UI.
2. **Sub-Type Selection**
   - Commercial: Industrial, Office, Retail, Medical, Mixed-Use, Specialized.
   - Residential: Single-Family, Multi-Family (2–4), Multi-Family (5+), Condo, Manufactured Housing.
   - Land: Finished Lot, Entitled Land, Agricultural, Transitional, Special Use.
   - Sub-type drives default sections, comps templates, and critical fields.
3. **Property Status Selection** (NEW)
   - User indicates: Existing, Under Construction, Proposed, or Recently Completed.
   - This triggers automatic scenario determination (see Section 6).
4. **Wizard Navigation**
   - Left navigation retains master list of 21 sections but highlights context-specific screens (e.g., Land shows Soil/Entitlements cards earlier, Residential shows Unit Mix grids only when Multi-Family).

### 2.2 Subcategory Impact
| Property Type | Key Differences | Screens Emphasized |
|---------------|-----------------|--------------------|
| Commercial – Industrial | Loading docks, clear height, flex unit mix | Improvements, Sales/Lease comps filters |
| Commercial – Office/Retail | Tenant mix, TI allowances, foot traffic metrics | Income Approach → Lease comps, Market Analysis |
| Residential – Single Family | Comparable sales weights, neighborhood amenities | Sales Comparison grid, Neighborhood/Site detail |
| Residential – Multi-Family | Unit mix, GRM, rent roll import | Income Approach (GRM), Operating Expenses |
| Land – Finished/Entitled | Entitlement milestones, absorption | Site Analysis, Cost Approach Land valuation |
| Land – Agricultural/Transitional | Soil class, water rights | Site Conditions, Market Analysis |

Each subtype toggles contextual help, default form values, and required fields. All screens remain accessible; non-applicable sections collapse with "Not required for this property" callouts to preserve USPAP coverage.

---

## 3. Approach Configuration Layer

### 3.1 Rules Matrix (Cost, Sales, Income always available)

| Property Segment | Default Enabled Approaches | Conditional Logic |
|------------------|---------------------------|-------------------|
| Commercial (all sub-types) | Cost, Sales, Income | Income auto-focus for stabilized assets; Cost emphasized for proposed construction. |
| Residential – Single Family | Sales, Cost | Income toggle exposed; when `hasRentalIntent=true`, Income becomes required. |
| Residential – Multi-Family | Sales, Income, Cost | GRM auto-enabled; Cost optional depending on construction status. |
| Land (all sub-types) | Sales, Cost | Income option remains visible for ground leases or agricultural income modeling. |

### 3.2 Detailed Sub-Type Approach Rules

The following configuration object provides granular control over approach defaults for each of the 16 property sub-types:

```ts
const subtypeApproachRules: Record<string, SubtypeConfig> = {
  // === COMMERCIAL ===
  'Industrial': {
    approaches: { cost: true, sales: true, income: true },
    incomeMode: 'DirectCap',
    requiredFields: ['clearHeight', 'loadingDocks', 'officeFinishPercent', 'craneCapacity'],
    emphasizedSections: ['improvements', 'salesLeaseComps']
  },
  'Office': {
    approaches: { cost: true, sales: true, income: true },
    incomeMode: 'DirectCap',
    requiredFields: ['tenantMix', 'tiAllowances', 'parkingRatio', 'floorPlateSize'],
    emphasizedSections: ['incomeApproach', 'leaseComps', 'marketAnalysis']
  },
  'Retail': {
    approaches: { cost: true, sales: true, income: true },
    incomeMode: 'DirectCap',
    requiredFields: ['tenantMix', 'tiAllowances', 'footTraffic', 'anchorTenants'],
    emphasizedSections: ['incomeApproach', 'leaseComps', 'marketAnalysis']
  },
  'Medical': {
    approaches: { cost: true, sales: true, income: true },
    incomeMode: 'DirectCap',
    requiredFields: ['medicalBuildout', 'licensure', 'parkingRatio'],
    emphasizedSections: ['incomeApproach', 'costApproach']
  },
  'Mixed-Use': {
    approaches: { cost: true, sales: true, income: true },
    incomeMode: 'DirectCap',
    requiredFields: ['useBreakdown', 'separateEntrances', 'zoningCompliance'],
    emphasizedSections: ['incomeApproach', 'improvements']
  },
  'Specialized': {
    approaches: { cost: true, sales: true, income: true },
    incomeMode: 'DCF', // Often requires longer projection period
    requiredFields: ['specialUseDescription', 'conversionCost'],
    emphasizedSections: ['costApproach', 'marketAnalysis']
  },

  // === RESIDENTIAL ===
  'Single-Family': {
    approaches: { cost: true, sales: true, income: false },
    incomeMode: null,
    requiredFields: ['comparableSales', 'siteAnalysis', 'neighborhoodAmenities'],
    emphasizedSections: ['salesComparison', 'neighborhoodSite'],
    conditionalIncome: { trigger: 'hasRentalIntent', mode: 'GRM' }
  },
  'Multi-Family (2-4)': {
    approaches: { cost: true, sales: true, income: true },
    incomeMode: 'GRM',
    requiredFields: ['unitMix', 'rentRoll', 'operatingExpenses'],
    emphasizedSections: ['incomeApproach', 'salesComparison']
  },
  'Multi-Family (5+)': {
    approaches: { cost: true, sales: true, income: true },
    incomeMode: 'DirectCap', // Larger properties use cap rate
    requiredFields: ['unitMix', 'rentRoll', 'operatingExpenses', 'vacancyHistory'],
    emphasizedSections: ['incomeApproach', 'operatingExpenses']
  },
  'Condo': {
    approaches: { cost: false, sales: true, income: false },
    incomeMode: null,
    requiredFields: ['comparableSales', 'hoaFees', 'commonAreas'],
    emphasizedSections: ['salesComparison', 'neighborhoodSite'],
    conditionalIncome: { trigger: 'hasRentalIntent', mode: 'GRM' }
  },
  'Manufactured Housing': {
    approaches: { cost: true, sales: true, income: false },
    incomeMode: null,
    requiredFields: ['comparableSales', 'landOwnership', 'parkLotRent'],
    emphasizedSections: ['salesComparison', 'costApproach']
  },

  // === LAND ===
  'Finished Lot': {
    approaches: { cost: true, sales: true, income: false },
    incomeMode: null,
    requiredFields: ['lotComparables', 'utilities', 'entitlements'],
    emphasizedSections: ['salesComparison', 'siteAnalysis']
  },
  'Entitled Land': {
    approaches: { cost: true, sales: true, income: false },
    incomeMode: null,
    requiredFields: ['entitlementMilestones', 'absorption', 'developmentBudget'],
    emphasizedSections: ['siteAnalysis', 'costApproach'],
    conditionalIncome: { trigger: 'hasGroundLease', mode: 'DirectCap' }
  },
  'Agricultural': {
    approaches: { cost: false, sales: true, income: true },
    incomeMode: 'DirectCap', // Crop income capitalization
    requiredFields: ['soilClass', 'waterRights', 'cropYield', 'irrigationSystem'],
    emphasizedSections: ['siteConditions', 'incomeApproach', 'marketAnalysis']
  },
  'Transitional': {
    approaches: { cost: true, sales: true, income: false },
    incomeMode: null,
    requiredFields: ['currentUse', 'highestBestUse', 'rezoningPotential'],
    emphasizedSections: ['marketAnalysis', 'siteAnalysis']
  },
  'Special Use': {
    approaches: { cost: true, sales: true, income: false },
    incomeMode: null,
    requiredFields: ['specialUseDescription', 'restrictedUses', 'conversionFeasibility'],
    emphasizedSections: ['costApproach', 'marketAnalysis']
  }
};
```

### 3.3 Income Approach Mode Selection

The Income Approach has three primary modes. The system auto-selects based on property type and characteristics:

| Mode | When to Use | Property Types |
|------|-------------|----------------|
| **GRM (Gross Rent Multiplier)** | Small residential income properties; quick valuation | Multi-Family (2-4), Single-Family rentals |
| **Direct Capitalization** | Stabilized income properties with predictable NOI | Office, Retail, Industrial, Multi-Family (5+), Agricultural |
| **DCF (Discounted Cash Flow)** | Properties with irregular income, lease-up, or long projection needs | Specialized commercial, Development projects, Hotels |

**Automatic Mode Selection Logic:**
```ts
function determineIncomeMode(subType: string, context: AssignmentContext): IncomeMode | null {
  const rules = subtypeApproachRules[subType];
  
  // Check conditional triggers first
  if (rules.conditionalIncome && context.intents[rules.conditionalIncome.trigger]) {
    return rules.conditionalIncome.mode;
  }
  
  // Check property status - proposed/construction often needs DCF
  if (context.propertyStatus === 'proposed' || context.propertyStatus === 'under_construction') {
    return 'DCF';
  }
  
  // Check occupancy - lease-up properties need DCF
  if (context.occupancyStatus === 'lease_up') {
    return 'DCF';
  }
  
  // Use default mode for subtype
  return rules.incomeMode;
}
```

### 3.4 Conditional Approach Triggers

Beyond property type, these flags modify approach requirements:

| Flag | Effect | Example |
|------|--------|---------|
| `hasRentalIntent` | Enables Income Approach on residential | Single-family being purchased as rental |
| `isProposedConstruction` | Emphasizes Cost Approach; requires prospective scenarios | New development appraisal |
| `hasGroundLease` | Enables Income Approach on land | Land with existing ground lease |
| `isSpecialPurpose` | Emphasizes Cost Approach (limited market data) | Church, school, government building |
| `hasSignificantDeferred` | Requires Cost Approach for depreciation analysis | Property with major deferred maintenance |

### 3.5 UI Controls
- **Approach Selector Panel** (new card above "Valuation Approaches" section)
  - Checkboxes for Cost, Sales, Income.
  - Microcopy reminding users all three are available regardless of property type.
  - Pre-checked options follow the table above; users can toggle additional approaches anytime.
  - Badge showing "Recommended" vs "Optional" for each approach.
- **Per-Approach Badges** inside Section 13/14/15 navigation entries to show enabled state.
- **Income Mode Selector** appears when Income is enabled (GRM / Direct Cap / DCF radio buttons).
- Validation ensures at least one approach is active before final review.

### 3.6 Data Representation

```ts
// Enums for property and scenario configuration
type PropertyType = 'commercial' | 'residential' | 'land';

type PropertyStatus = 'existing' | 'under_construction' | 'proposed' | 'recently_completed';

type PlannedChanges = 'none' | 'minor' | 'major' | 'change_of_use';

type OccupancyStatus = 'stabilized' | 'lease_up' | 'vacant' | 'not_applicable';

type LoanPurpose = 'purchase' | 'refinance' | 'construction' | 'bridge' | 'internal';

type IncomeMode = 'DirectCap' | 'DCF' | 'GRM';

type ScenarioName = 'As Is' | 'As Completed' | 'As Stabilized' | 'As Proposed' | string;

// Approach configuration
type ApproachConfig = {
  cost: { enabled: boolean; required: boolean };
  sales: { enabled: boolean; required: boolean };
  income: { enabled: boolean; required: boolean; mode?: IncomeMode };
};

// Sub-type specific configuration
interface SubtypeConfig {
  approaches: { cost: boolean; sales: boolean; income: boolean };
  incomeMode: IncomeMode | null;
  requiredFields: string[];
  emphasizedSections: string[];
  conditionalIncome?: { trigger: string; mode: IncomeMode };
}

// Scenario configuration
interface ScenarioConfig {
  id: number;
  name: ScenarioName;
  effectiveDate: string | null;
  approaches: string[]; // Which approaches apply to this scenario
  isRequired: boolean; // Required by lender/regulatory guidelines
  requirementSource?: string; // e.g., "Interagency Guidelines", "Lender requirement"
}

// Complete assignment context
interface AssignmentContext {
  // Property identification
  propertyType: PropertyType;
  subType: string;
  
  // Status triggers for scenario determination
  propertyStatus: PropertyStatus;
  plannedChanges: PlannedChanges;
  occupancyStatus: OccupancyStatus;
  loanPurpose: LoanPurpose;
  
  // Intent flags for conditional approach enabling
  intents: {
    rental: boolean;
    development: boolean;
    disposition: boolean;
    groundLease: boolean;
    specialPurpose: boolean;
  };
  
  // Configured approaches and scenarios
  approaches: ApproachConfig;
  scenarios: ScenarioConfig[];
}
```

This structure can live beside the existing `wizardSteps` map to determine which sections render and what calculators to expose.

---

## 4. Dynamic Section Loading

### 4.1 Metadata Schema
Augment each `wizardSteps` entry (see `prototypes/SuperAdmin/appraisal-wizard-prototype.html`) with:
```js
const wizardSteps = {
  '13.2': {
    title: 'Improvement Valuation',
    section: 'Cost Approach',
    visibility: {
      propertyTypes: ['commercial', 'residential'],
      subTypes: ['industrial', 'office', 'retail', 'multiFamily'],
      approaches: ['cost'],
      scenarios: ['As Completed', 'As Stabilized'] // Only show for prospective scenarios
    },
    fields: [/* existing definitions */]
  },
  // ...
};
```
- `propertyTypes`: restricts rendering; omit to show globally.
- `subTypes`: optional white-list for niche screens (e.g., Agricultural soil analysis).
- `approaches`: ensures sections appear when the associated approach is active.
- `scenarios`: NEW - restricts sections to specific valuation scenarios.

### 4.2 Shared Components vs Overrides
- **Shared**: Report Header, Market Analysis, Neighborhood, Review screens remain identical.
- **Overrides**:
  - Improvements grids: industrial vs. retail field sets.
  - Income approach cards: GRM tables for Multi-Family, Crop yield calculator for Agricultural land.
  - Cost approach depreciation: extra defaults for proposed vs. existing improvements.

### 4.3 Loading Flow
1. Assignment context (property type, sub-type, approach config, scenarios) stored in wizard state.
2. Navigation builder filters `wizardSteps` based on visibility metadata.
3. Hidden sections are still available under "Show all sections" for USPAP completeness.

---

## 5. Pre-PDF Review Experience

### 5.1 Review Stage Structure
Modeled after `EVALUATION_REPORT_EDITOR_GUIDE.md`:
1. **Summary Dashboard**
   - Cards for each approach showing status (Complete/In Progress/Missing).
   - Property snapshot (type, sub-type, key metrics).
   - **Scenario Summary** (NEW): Shows each scenario with its effective date and value conclusion status.
2. **Inline Editing**
   - Clicking a summary card opens side-by-side view: left summary, right editable fields.
   - Supports quick fixes without traversing full wizard.
3. **Validation + Exceptions**
   - USPAP checklist (effective dates, certifications, limiting conditions).
   - Property-type-specific validations (e.g., Multi-Family requires unit mix totals = building area).
   - **Scenario Validation** (NEW): Ensures all required scenarios have value conclusions and effective dates.

### 5.2 PDF Preview Workflow
1. **Generate Draft PDF** button runs same pipeline as Evaluation Wizard but flags document as *Draft*.
2. **Document Viewer** (existing evaluation viewer component) loads PDF in modal with annotation toggle.
3. **Approve & Publish**
   - Once reviewed, user clicks "Finalize Appraisal Report," locking inputs.
   - System stores version metadata + re-generates clean PDF for delivery.

---

## 6. Automatic Scenario Determination

This section describes how the system automatically determines which valuation scenarios (As Is, As Completed, As Stabilized, As Proposed) are required based on property characteristics and loan purpose. This automation eliminates guesswork and ensures regulatory compliance.

### 6.1 Scenario Definitions

| Scenario | Definition | Effective Date | When Required |
|----------|------------|----------------|---------------|
| **As Is** | The property's current market value in its existing physical condition | Current date (typically inspection date) | Almost always; baseline valuation |
| **As Completed** | Prospective market value assuming all proposed construction or renovations are completed | Future date (projected completion) | Construction loans, major renovations |
| **As Stabilized** | Prospective market value once the property achieves stabilized occupancy and operations | Future date (after lease-up) | Income properties not yet at market occupancy |
| **As Proposed** | Market value based on hypothetical conditions (e.g., property completed as of current date) | Current date with hypothetical conditions | When no existing improvements to value "As Is" |

**Regulatory Basis**: Per Interagency Appraisal Guidelines, construction and development loans require prospective values. The guidelines state that lenders must understand value at each stage of the property lifecycle.

### 6.2 Scenario Trigger Questions

The system asks 3-4 simple questions to determine required scenarios. These questions are simpler than asking "which scenarios do you need?" directly.

```ts
const scenarioTriggers = {
  // Question 1: Property Status
  propertyStatus: {
    question: "What is the current status of the property?",
    options: [
      { value: 'existing', label: 'Existing / Completed', description: 'Property is built and operational' },
      { value: 'under_construction', label: 'Under Construction', description: 'Currently being built or renovated' },
      { value: 'proposed', label: 'Proposed / Not Yet Started', description: 'Plans exist but construction has not begun' },
      { value: 'recently_completed', label: 'Recently Completed', description: 'Finished within the last 12 months' }
    ]
  },
  
  // Question 2: Planned Changes
  plannedChanges: {
    question: "Are there any planned improvements or renovations?",
    options: [
      { value: 'none', label: 'No planned changes', description: 'Property will remain as-is' },
      { value: 'minor', label: 'Minor repairs/updates', description: 'Less than 10% of property value' },
      { value: 'major', label: 'Major renovation or expansion', description: 'Significant capital improvements planned' },
      { value: 'change_of_use', label: 'Change of use / Conversion', description: 'Property will be converted to different use' }
    ]
  },
  
  // Question 3: Occupancy Status (for income-producing properties)
  occupancyStatus: {
    question: "What is the current occupancy status?",
    showWhen: (context) => context.propertyType === 'commercial' || 
                          context.subType?.includes('Multi-Family'),
    options: [
      { value: 'stabilized', label: 'Stabilized (>90% occupied)', description: 'At or near market occupancy' },
      { value: 'lease_up', label: 'In lease-up phase', description: 'Currently filling vacancies' },
      { value: 'vacant', label: 'Vacant or significantly under-occupied', description: 'Below 70% occupied' },
      { value: 'not_applicable', label: 'N/A (owner-occupied / single-family)', description: 'Not an income property' }
    ]
  },
  
  // Question 4: Loan Purpose (helps refine requirements)
  loanPurpose: {
    question: "What is the intended use of this appraisal?",
    options: [
      { value: 'purchase', label: 'Purchase financing', description: 'Acquisition of existing property' },
      { value: 'refinance', label: 'Refinance', description: 'Refinancing existing debt' },
      { value: 'construction', label: 'Construction loan', description: 'Financing new construction' },
      { value: 'bridge', label: 'Bridge / interim financing', description: 'Short-term financing, often for value-add' },
      { value: 'internal', label: 'Internal / portfolio review', description: 'Not for lending purposes' }
    ]
  }
};
```

### 6.3 Automatic Selection Logic

The following function implements the decision logic for scenario determination:

```ts
function determineRequiredScenarios(answers: AssignmentContext): ScenarioConfig[] {
  const scenarios: ScenarioConfig[] = [];
  const { propertyStatus, plannedChanges, occupancyStatus, loanPurpose } = answers;
  
  // === RULE 1: Property Status Drives Primary Scenarios ===
  
  if (propertyStatus === 'proposed') {
    // No existing property to value "As Is" - start with As Proposed
    scenarios.push({
      id: 1,
      name: 'As Proposed',
      effectiveDate: null,
      approaches: [],
      isRequired: true,
      requirementSource: 'Proposed development - no existing improvements'
    });
    scenarios.push({
      id: 2,
      name: 'As Completed',
      effectiveDate: null,
      approaches: [],
      isRequired: true,
      requirementSource: 'Interagency Guidelines - construction/development'
    });
    scenarios.push({
      id: 3,
      name: 'As Stabilized',
      effectiveDate: null,
      approaches: [],
      isRequired: true,
      requirementSource: 'Interagency Guidelines - income property stabilization'
    });
  } 
  else if (propertyStatus === 'under_construction') {
    // Partially complete - has current value but needs prospective
    scenarios.push({
      id: 1,
      name: 'As Is',
      effectiveDate: null,
      approaches: [],
      isRequired: true,
      requirementSource: 'Current value of partially-complete improvements'
    });
    scenarios.push({
      id: 2,
      name: 'As Completed',
      effectiveDate: null,
      approaches: [],
      isRequired: true,
      requirementSource: 'Interagency Guidelines - construction loan'
    });
    scenarios.push({
      id: 3,
      name: 'As Stabilized',
      effectiveDate: null,
      approaches: [],
      isRequired: true,
      requirementSource: 'Interagency Guidelines - post-construction lease-up'
    });
  }
  else if (propertyStatus === 'recently_completed') {
    // Property exists but may not be stabilized
    scenarios.push({
      id: 1,
      name: 'As Is',
      effectiveDate: null,
      approaches: [],
      isRequired: true,
      requirementSource: 'Current market value'
    });
    
    if (occupancyStatus !== 'stabilized' && occupancyStatus !== 'not_applicable') {
      scenarios.push({
        id: 2,
        name: 'As Stabilized',
        effectiveDate: null,
        approaches: [],
        isRequired: true,
        requirementSource: 'Property not yet at stabilized occupancy'
      });
    }
  }
  else {
    // Existing property - baseline
    scenarios.push({
      id: 1,
      name: 'As Is',
      effectiveDate: null,
      approaches: [],
      isRequired: true,
      requirementSource: 'Current market value'
    });
  }
  
  // === RULE 2: Planned Changes Add Scenarios ===
  
  if (plannedChanges === 'major' || plannedChanges === 'change_of_use') {
    // Major renovations need As Completed
    if (!scenarios.some(s => s.name === 'As Completed')) {
      scenarios.push({
        id: scenarios.length + 1,
        name: 'As Completed',
        effectiveDate: null,
        approaches: [],
        isRequired: true,
        requirementSource: 'Major renovation/change of use planned'
      });
    }
    
    // If income property, may need stabilization after renovation
    if (occupancyStatus !== 'not_applicable' && !scenarios.some(s => s.name === 'As Stabilized')) {
      scenarios.push({
        id: scenarios.length + 1,
        name: 'As Stabilized',
        effectiveDate: null,
        approaches: [],
        isRequired: false, // Recommended but not always required
        requirementSource: 'Recommended for income property after renovation'
      });
    }
  }
  
  // === RULE 3: Occupancy Adjustments ===
  
  if (occupancyStatus === 'lease_up' && !scenarios.some(s => s.name === 'As Stabilized')) {
    scenarios.push({
      id: scenarios.length + 1,
      name: 'As Stabilized',
      effectiveDate: null,
      approaches: [],
      isRequired: true,
      requirementSource: 'Property currently in lease-up phase'
    });
  }
  
  // === RULE 4: Loan Purpose Overrides ===
  
  if (loanPurpose === 'construction') {
    // Construction loans ALWAYS need prospective values per Interagency Guidelines
    if (!scenarios.some(s => s.name === 'As Completed')) {
      scenarios.push({
        id: scenarios.length + 1,
        name: 'As Completed',
        effectiveDate: null,
        approaches: [],
        isRequired: true,
        requirementSource: 'Interagency Guidelines - construction loan requirement'
      });
    }
    if (!scenarios.some(s => s.name === 'As Stabilized')) {
      scenarios.push({
        id: scenarios.length + 1,
        name: 'As Stabilized',
        effectiveDate: null,
        approaches: [],
        isRequired: true,
        requirementSource: 'Interagency Guidelines - construction loan requirement'
      });
    }
  }
  
  if (loanPurpose === 'bridge') {
    // Bridge loans often for value-add - likely need As Completed
    if (plannedChanges !== 'none' && !scenarios.some(s => s.name === 'As Completed')) {
      scenarios.push({
        id: scenarios.length + 1,
        name: 'As Completed',
        effectiveDate: null,
        approaches: [],
        isRequired: false,
        requirementSource: 'Recommended for bridge financing with planned improvements'
      });
    }
  }
  
  return scenarios;
}
```

### 6.4 Scenario Decision Flowchart

```
┌─────────────────────────────────────────────────────────────────┐
│                    Property Status?                              │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐         ┌──────────┐         ┌──────────┐
    │Existing │         │Under     │         │Proposed  │
    │         │         │Construct.│         │          │
    └────┬────┘         └────┬─────┘         └────┬─────┘
         │                   │                    │
         ▼                   ▼                    ▼
    [As Is]            [As Is]              [As Proposed]
         │             [As Completed]        [As Completed]
         │             [As Stabilized]       [As Stabilized]
         │                   │                    │
         ▼                   │                    │
┌─────────────────┐          │                    │
│Planned Changes? │          │                    │
└─────────────────┘          │                    │
    │         │              │                    │
    ▼         ▼              │                    │
  None    Major/CoU          │                    │
    │         │              │                    │
    │    [+As Completed]     │                    │
    │    [+As Stabilized?]   │                    │
    │         │              │                    │
    └────┬────┴──────────────┴────────────────────┘
         │
         ▼
┌─────────────────┐
│Occupancy Status?│
└─────────────────┘
    │         │
    ▼         ▼
 Stable   Lease-up
    │         │
    │    [+As Stabilized]
    │         │
    └────┬────┘
         │
         ▼
┌─────────────────┐
│  Loan Purpose?  │
└─────────────────┘
    │         │
    ▼         ▼
 Other   Construction
    │         │
    │    [Ensure As Completed]
    │    [Ensure As Stabilized]
    │         │
    └────┬────┘
         ▼
   FINAL SCENARIOS
```

### 6.5 Scenario-to-Approach Mapping

Different scenarios may emphasize different valuation approaches:

| Scenario | Primary Approaches | Notes |
|----------|-------------------|-------|
| **As Is** | All applicable to property type | Standard approach selection |
| **As Completed** | Cost (primary), Sales, Income | Cost validates construction budget; Sales/Income for market value |
| **As Stabilized** | Income (primary), Sales | Focuses on stabilized NOI; Sales for market validation |
| **As Proposed** | Cost (primary), Sales | Similar to As Completed but with hypothetical effective date |

**Implementation Note**: The `approaches` array in each `ScenarioConfig` should be populated based on the property type defaults PLUS scenario-specific adjustments:

```ts
function assignApproachesToScenario(
  scenario: ScenarioConfig, 
  context: AssignmentContext
): ScenarioConfig {
  const baseApproaches = getApproachesForPropertyType(context.subType);
  
  switch (scenario.name) {
    case 'As Completed':
    case 'As Proposed':
      // Emphasize Cost Approach for construction scenarios
      return {
        ...scenario,
        approaches: ['Cost Approach', ...baseApproaches.filter(a => a !== 'Cost Approach')]
      };
      
    case 'As Stabilized':
      // Emphasize Income Approach for stabilized value
      if (context.propertyType === 'commercial' || context.subType?.includes('Multi-Family')) {
        return {
          ...scenario,
          approaches: ['Income Approach', ...baseApproaches.filter(a => a !== 'Income Approach')]
        };
      }
      return { ...scenario, approaches: baseApproaches };
      
    case 'As Is':
    default:
      return { ...scenario, approaches: baseApproaches };
  }
}
```

### 6.6 Scenario Summary Matrix

Quick reference showing which scenarios are typically required for common situations:

| Property Status | Planned Changes | Occupancy | Loan Purpose | Required Scenarios |
|----------------|-----------------|-----------|--------------|-------------------|
| Existing | None | Stabilized | Refinance | **As Is** |
| Existing | Major reno | Stabilized | Bridge | **As Is, As Completed** |
| Under construction | N/A | N/A | Construction | **As Is, As Completed, As Stabilized** |
| Proposed | N/A | N/A | Construction | **As Proposed, As Completed, As Stabilized** |
| Recently completed | None | Lease-up | Purchase | **As Is, As Stabilized** |
| Existing | Change of use | Vacant | Bridge | **As Is, As Completed, As Stabilized** |
| Existing | None | Stabilized | Purchase | **As Is** |
| Existing | Minor | Stabilized | Refinance | **As Is** |

---

## 7. UX Benefits & Design Rationale

This section documents the user experience benefits of automatic approach and scenario selection, providing justification for the feature and guidance on implementation.

### 7.1 Speed Improvements

| Current State | With Automation | Impact |
|--------------|-----------------|--------|
| User must know which scenarios are required | System determines based on 3-4 simple questions | **Eliminates guesswork** |
| User manually adds each scenario one-by-one | Scenarios pre-populated, user just confirms | **30-60 seconds saved per assignment** |
| User might miss a required scenario, discover later | System ensures completeness upfront | **Prevents rework (10-30 min per error)** |
| User selects wrong approaches per scenario | Approaches auto-configured by scenario type | **Reduces errors** |
| New appraisers must memorize regulatory requirements | System encodes requirements | **Faster onboarding** |

**Quantified Estimates:**
- **Setup time reduction**: 40-60% faster (fewer decisions to make)
- **Error rate reduction**: 70-80% fewer missing scenarios
- **Training time reduction**: New users learn faster (system teaches as they work)
- **Revision request reduction**: Fewer "please add As Stabilized" calls from lenders

### 7.2 Clarity Improvements

**Reduced Cognitive Load**

Instead of asking:
> "What valuation scenarios do you need for this assignment?"

The system asks:
> "What is the current status of the property?" (Existing / Under Construction / Proposed)

The second question is **much simpler** because it asks about a fact the user already knows, rather than requiring knowledge of regulatory requirements.

**Educational Context**

The system explains *why* each scenario is needed:

```
┌─────────────────────────────────────────────────────────────────┐
│  Valuation Scenarios                                            │
├─────────────────────────────────────────────────────────────────┤
│  ✓ As Is                    Required                            │
│    Current market value in existing condition                   │
│                                                                 │
│  ✓ As Completed             Required (construction loan)        │
│    Per Interagency Guidelines, construction loans require       │
│    prospective value upon completion                            │
│                                                                 │
│  ✓ As Stabilized            Required (not yet occupied)         │
│    Per Interagency Guidelines, income properties require        │
│    stabilized value when below market occupancy                 │
│                                                                 │
│  ℹ️ Based on: Under construction, Construction loan, Lease-up   │
└─────────────────────────────────────────────────────────────────┘
```

Appraisers learn *why* scenarios are needed, not just *what* to pick. This builds expertise over time.

**Compliance Safety Net**

- New appraisers often don't know all the rules
- Experienced appraisers sometimes forget edge cases
- System serves as a **safety net** without being restrictive
- Reduces risk of regulatory findings or revision requests

### 7.3 Progressive Disclosure Pattern

The UI should follow progressive disclosure principles:

**Smart Defaults with Easy Override**

```
┌─ Property Status ─────────────────────────────────────┐
│  ○ Existing    ● Under Construction    ○ Proposed     │
└───────────────────────────────────────────────────────┘
               ↓ Auto-configures ↓
┌─ Valuation Scenarios ─────────────────────────────────┐
│  ✓ As Is          ✓ As Completed    ✓ As Stabilized   │
│                                                       │
│  [+ Add Custom Scenario]  ← Still allows override     │
└───────────────────────────────────────────────────────┘
```

**Key Principles:**
- **Defaults are smart** — most users just confirm and move on (80% case)
- **Override is easy** — power users can still customize (20% case)
- **Nothing is locked** — appraiser judgment is preserved (USPAP compliance)
- **Explanations available** — hover/click for "why is this required?"

**"Required" vs "Optional" Badges**

```html
<div class="scenario-badge required">
  <span class="badge-icon">●</span>
  <span class="badge-text">Required</span>
  <span class="badge-source">Interagency Guidelines</span>
</div>

<div class="scenario-badge optional">
  <span class="badge-icon">○</span>
  <span class="badge-text">Recommended</span>
  <span class="badge-source">Best practice for value-add</span>
</div>
```

**"Show All Sections" Toggle**

For USPAP completeness, all sections must remain accessible:

```html
<div class="nav-footer">
  <label class="toggle-all-sections">
    <input type="checkbox" id="showAllSections">
    <span>Show all sections (USPAP completeness)</span>
  </label>
</div>
```

When enabled, hidden sections appear with a muted style and "Not required for this property type" callout.

### 7.4 UI Component Recommendations

**Property Status Card (placed before Scenarios)**

```html
<div class="card property-status-card">
  <h3>Property Status</h3>
  <p class="help-text">This determines which valuation scenarios are needed.</p>
  
  <div class="status-options grid-2">
    <label class="status-option">
      <input type="radio" name="propertyStatus" value="existing">
      <div class="option-content">
        <div class="option-title">Existing Property</div>
        <div class="option-desc">Completed and operational</div>
      </div>
    </label>
    
    <label class="status-option">
      <input type="radio" name="propertyStatus" value="under_construction">
      <div class="option-content">
        <div class="option-title">Under Construction</div>
        <div class="option-desc">Currently being built</div>
      </div>
    </label>
    
    <label class="status-option">
      <input type="radio" name="propertyStatus" value="proposed">
      <div class="option-content">
        <div class="option-title">Proposed</div>
        <div class="option-desc">Not yet started</div>
      </div>
    </label>
    
    <label class="status-option">
      <input type="radio" name="propertyStatus" value="recently_completed">
      <div class="option-content">
        <div class="option-title">Recently Completed</div>
        <div class="option-desc">Within last 12 months</div>
      </div>
    </label>
  </div>
</div>
```

**Auto-Selection Feedback**

When property status changes, show a brief animation/toast:

```
┌─────────────────────────────────────────────────────┐
│ ✓ Scenarios updated based on property status        │
│   Added: As Completed, As Stabilized                │
└─────────────────────────────────────────────────────┘
```

---

## 8. Integration Notes

| Area | Notes |
|------|-------|
| Frontend Prototype | Extend `prototypes/SuperAdmin/appraisal-wizard-prototype.html` to include property-type selector, property status card, approach panel, scenario auto-selection, and metadata-driven navigation. |
| Future React/Vue Implementation | Mirror metadata schema in `packages/frontend/src/modules/appraisalWizard`. Use context/state machines (XState or Redux) to manage `AssignmentContext`. Implement `determineRequiredScenarios()` as a pure function for testability. |
| Backend / API | Update assignment model to persist `propertyType`, `subType`, `propertyStatus`, `occupancyStatus`, `loanPurpose`, `approachConfig`, and `scenarios[]`. Ensure report generation endpoint accepts these flags to pick templates and generate multiple value conclusions. |
| Data Schema | Add lookup tables for property sub-types, approach defaults, scenario triggers, and section visibility flags. Tie into existing `PROPERTY_TYPE_NAVIGATION_IMPLEMENTATION.md` for consistency. |
| PDF Pipeline | Reuse Evaluation report editor infrastructure (`EVALUATION_REPORT_EDITOR_IMPLEMENTATION.md`, `DYNAMIC_REPORT_EDITOR_IMPLEMENTATION.md`). Ensure Merge Fields support multiple value conclusions per scenario. Add effective date fields for each scenario. |
| Validation | Implement server-side validation that construction loans have As Completed and As Stabilized scenarios. Warn (not block) if optional scenarios are missing. |
| Reporting/Analytics | Track which scenarios are most commonly added/removed manually to refine auto-selection rules over time. |

### 8.1 Frontend Implementation Checklist

- [ ] Add Property Status card to Setup section (before Scenarios)
- [ ] Implement `determineRequiredScenarios()` function
- [ ] Auto-populate scenarios when property status changes
- [ ] Add "Required" / "Recommended" badges to scenarios
- [ ] Add requirement source tooltips (hover for "why required")
- [ ] Implement scenario-to-approach mapping
- [ ] Add effective date fields per scenario
- [ ] Add "Show all sections" toggle for USPAP completeness
- [ ] Add Income Mode selector (GRM / Direct Cap / DCF)
- [ ] Update navigation to filter by active scenarios

### 8.2 Backend Implementation Checklist

- [ ] Extend assignment model with new fields (propertyStatus, occupancyStatus, loanPurpose, scenarios[])
- [ ] Add validation for construction loan scenario requirements
- [ ] Update report generation to handle multiple scenarios
- [ ] Add merge fields for each scenario's value conclusion and effective date
- [ ] Implement scenario-based section filtering in report templates

### 8.3 Testing Checklist

- [ ] Test all property status → scenario combinations
- [ ] Verify regulatory requirements are met for construction loans
- [ ] Test manual scenario override preserves user choices
- [ ] Test scenario-to-approach mapping for each property type
- [ ] Verify "Show all sections" reveals hidden sections
- [ ] Test PDF generation with multiple scenarios

---

## 9. Implementation Checklist

### Phase 1: Property Type & Approach Auto-Selection
- [ ] Implement property type selector UI (Commercial / Residential / Land)
- [ ] Implement sub-type selector with dynamic options
- [ ] Add `subtypeApproachRules` configuration
- [ ] Auto-enable approaches based on property type selection
- [ ] Add Income Mode selector (GRM / Direct Cap / DCF)
- [ ] Implement conditional approach triggers (hasRentalIntent, etc.)

### Phase 2: Automatic Scenario Determination
- [ ] Add Property Status selector UI
- [ ] Add Planned Changes selector UI
- [ ] Add Occupancy Status selector UI (conditional)
- [ ] Add Loan Purpose selector UI
- [ ] Implement `determineRequiredScenarios()` function
- [ ] Auto-populate scenarios on status change
- [ ] Add "Required" / "Recommended" badges
- [ ] Add requirement source tooltips

### Phase 3: Scenario-Approach Integration
- [ ] Implement `assignApproachesToScenario()` function
- [ ] Update section visibility to filter by scenario
- [ ] Add effective date fields per scenario
- [ ] Update value conclusion sections to support multiple scenarios
- [ ] Add scenario summary to Review dashboard

### Phase 4: PDF & Backend Integration
- [ ] Update backend models for new fields
- [ ] Add validation for lender/regulatory requirements
- [ ] Update PDF templates for multiple value conclusions
- [ ] Add merge fields for scenario-specific data
- [ ] Test end-to-end workflow

### Phase 5: Polish & Refinement
- [ ] Add "Show all sections" toggle
- [ ] Implement auto-selection feedback animations
- [ ] Add analytics tracking for manual overrides
- [ ] Refine rules based on user feedback
- [ ] Update help documentation

---

**Document Version**: 2.0  
**Last Updated**: December 2024  
**Authors**: Architecture Team  
**Related Documents**:
- `PROPERTY_TYPE_NAVIGATION_IMPLEMENTATION.md`
- `EVALUATION_REPORT_EDITOR_IMPLEMENTATION.md`
- `DYNAMIC_REPORT_EDITOR_IMPLEMENTATION.md`
- `EVALUATION_REPORT_EDITOR_GUIDE.md`
