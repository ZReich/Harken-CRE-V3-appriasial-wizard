/**
 * Cost Segregation Types
 * 
 * Type definitions for IRS-compliant cost segregation analysis.
 * Supports both residential rental (27.5-year) and nonresidential (39-year) properties.
 */

// =================================================================
// IRS DEPRECIATION CLASSES (MACRS)
// =================================================================

/**
 * IRS depreciation recovery periods under MACRS
 * - 5-year: Personal property (carpeting, electrical distribution, specialty plumbing)
 * - 7-year: Office furniture and fixtures
 * - 15-year: Land improvements (parking, landscaping, sidewalks)
 * - 27.5-year: Residential rental property (structural)
 * - 39-year: Nonresidential real property (structural)
 */
export type DepreciationClass = '5-year' | '7-year' | '15-year' | '27.5-year' | '39-year';

/**
 * Property classification for determining base depreciation period
 */
export type PropertyClass = 'residential-rental' | 'nonresidential';

/**
 * IRS component categories per cost segregation standards
 */
export type ComponentCategory = 'personal-property' | 'land-improvement' | 'real-property';

// =================================================================
// COST SEGREGATION COMPONENT
// =================================================================

/**
 * Individual building component with depreciation classification
 */
export interface CostSegComponent {
  /** Unique identifier for this component instance */
  id: string;
  
  /** Reference to component type (e.g., 'flooring-carpet', 'hvac-central') */
  componentId: string;
  
  /** Display label */
  label: string;
  
  /** Description of the component */
  description?: string;
  
  /** IRS category for this component */
  category: ComponentCategory;
  
  /** Auto-determined depreciation class based on IRS guidelines */
  depreciationClass: DepreciationClass;
  
  /** User override of depreciation class (if different from auto) */
  depreciationClassOverride?: DepreciationClass;
  
  /** Justification for override (for audit trail) */
  overrideJustification?: string;
  
  /** Allocated cost for this component */
  cost: number;
  
  /** Percentage of total depreciable basis */
  percentOfTotal: number;
  
  /** Building ID if component is building-specific */
  buildingId?: string;
  
  /** Building name for display */
  buildingName?: string;
  
  /** IRS asset class reference (e.g., "00.11 - Office Furniture") */
  irsAssetClass?: string;
  
  /** IRC Section reference (e.g., "IRC Section 1245") */
  ircReference?: string;
  
  /** How the classification was determined */
  classificationSource: 'auto' | 'manual';
  
  /** Source of the component data */
  dataSource: 'improvements-inventory' | 'site-improvements' | 'manual-entry';
  
  /** Quantity if applicable */
  quantity?: number;
  
  /** Unit of measure */
  unit?: 'SF' | 'LF' | 'EA' | 'LS';
}

// =================================================================
// CLASS SUMMARY
// =================================================================

/**
 * Summary totals for a depreciation class
 */
export interface ClassSummary {
  /** Depreciation class */
  class: DepreciationClass;
  
  /** Total value allocated to this class */
  totalValue: number;
  
  /** Percentage of total depreciable basis */
  percentOfBasis: number;
  
  /** Number of components in this class */
  componentCount: number;
  
  /** First-year depreciation (before bonus) */
  firstYearDepreciation: number;
  
  /** First-year depreciation with bonus applied */
  firstYearWithBonus: number;
}

// =================================================================
// DEPRECIATION SCHEDULE
// =================================================================

/**
 * Single year in the depreciation schedule
 */
export interface DepreciationYearEntry {
  /** Year number (1-40) */
  year: number;
  
  /** Calendar year */
  calendarYear: number;
  
  /** Depreciation by class for this year */
  byClass: {
    fiveYear: number;
    sevenYear: number;
    fifteenYear: number;
    realProperty: number; // 27.5 or 39 year
  };
  
  /** Total depreciation for this year */
  totalDepreciation: number;
  
  /** Cumulative depreciation through this year */
  cumulativeDepreciation: number;
  
  /** Remaining basis after this year */
  remainingBasis: number;
  
  /** Estimated tax savings (at configured rate) */
  taxSavings: number;
  
  /** Cumulative tax savings */
  cumulativeTaxSavings: number;
}

/**
 * Full depreciation schedule
 */
export interface DepreciationSchedule {
  /** Projections by year */
  years: DepreciationYearEntry[];
  
  /** Tax rate used for calculations */
  taxRate: number;
  
  /** Bonus depreciation rate applied (e.g., 0.60 for 2024) */
  bonusRate: number;
  
  /** First year of depreciation (placement in service year) */
  startYear: number;
  
  /** Whether mid-year convention was applied */
  midYearConvention: boolean;
}

// =================================================================
// TAX BENEFIT PROJECTION
// =================================================================

/**
 * Tax benefit comparison and projections
 */
export interface TaxBenefitProjection {
  /** Depreciation in Year 1 without cost segregation (straight-line) */
  year1WithoutCostSeg: number;
  
  /** Depreciation in Year 1 with cost segregation (before bonus) */
  year1WithCostSeg: number;
  
  /** Depreciation in Year 1 with cost segregation and bonus depreciation */
  year1WithBonus: number;
  
  /** Additional depreciation gained in Year 1 from cost seg */
  additionalYear1Deductions: number;
  
  /** Estimated Year 1 tax savings (at configured rate) */
  year1TaxSavings: number;
  
  /** Cumulative benefit over 5 years */
  cumulativeBenefit5Year: number;
  
  /** Cumulative benefit over 10 years */
  cumulativeBenefit10Year: number;
  
  /** Tax rate used for projections */
  taxRate: number;
  
  /** Present value of tax savings (if discounted) */
  presentValue?: number;
  
  /** Discount rate used for present value */
  discountRate?: number;
}

// =================================================================
// BUILDING SYSTEMS (IRS TD 9636)
// =================================================================

/**
 * IRS-defined building systems per Treasury Decision 9636
 */
export type BuildingSystemType = 
  | 'hvac'
  | 'plumbing'
  | 'electrical'
  | 'elevators-escalators'
  | 'fire-protection'
  | 'security'
  | 'gas-distribution'
  | 'building-structure'
  | 'other';

/**
 * Building system summary for IRS compliance
 */
export interface BuildingSystemSummary {
  /** System type */
  system: BuildingSystemType;
  
  /** Display label */
  label: string;
  
  /** Total depreciable cost for this system */
  depreciableCost: number;
  
  /** Current replacement cost (for reference) */
  replacementCost: number;
  
  /** Components included in this system */
  componentIds: string[];
  
  /** Percentage of total building cost */
  percentOfBuilding: number;
}

// =================================================================
// COST SEGREGATION ANALYSIS
// =================================================================

/**
 * Complete cost segregation analysis
 */
export interface CostSegAnalysis {
  /** Unique identifier */
  id: string;
  
  /** Property reference */
  propertyId: string;
  
  /** Property address for display */
  propertyAddress: string;
  
  /** Property classification */
  propertyClass: PropertyClass;
  
  /** Analysis date */
  analysisDate: string;
  
  /** Prepared by */
  preparedBy?: string;
  
  // === Source Values ===
  
  /** Total project/acquisition cost */
  totalProjectCost: number;
  
  /** Land value (excluded from depreciation) */
  landValue: number;
  
  /** Total depreciable basis (totalProjectCost - landValue) */
  depreciableBasis: number;
  
  // === Analysis Results ===
  
  /** All classified components */
  components: CostSegComponent[];
  
  /** Summary by depreciation class */
  summaryByClass: ClassSummary[];
  
  /** Building systems summary (for IRS compliance) */
  buildingSystems: BuildingSystemSummary[];
  
  /** Tax benefit projections */
  taxBenefitProjection: TaxBenefitProjection;
  
  /** Full depreciation schedule */
  depreciationSchedule: DepreciationSchedule;
  
  // === Configuration ===
  
  /** Bonus depreciation rate (e.g., 0.60 for 2024) */
  bonusDepreciationRate: number;
  
  /** Tax rate for benefit calculations */
  taxRate: number;
  
  /** Placement in service date */
  placementInServiceDate: string;
  
  /** Methodology used */
  methodology: 'detailed-engineering' | 'cost-estimate' | 'hybrid';
  
  /** Notes on methodology or special considerations */
  methodologyNotes?: string;
  
  // === Metadata ===
  
  /** Last modified timestamp */
  lastModified: string;
  
  /** Version for tracking changes */
  version: number;
}

// =================================================================
// REPORT CONFIGURATION
// =================================================================

/**
 * Cost Seg report section configuration
 */
export interface CostSegReportSection {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
  editable: boolean;
  customContent?: string;
}

/**
 * Cost Seg report state for the editor
 */
export interface CostSegReportState {
  /** The underlying analysis */
  analysis: CostSegAnalysis;
  
  /** Section visibility settings */
  sectionVisibility: Record<string, boolean>;
  
  /** Edited fields (path -> value) */
  editedFields: Record<string, { path: string; value: unknown }>;
  
  /** Custom narrative content by section */
  customNarratives: Record<string, string>;
  
  /** Whether there are unsaved changes */
  isDirty: boolean;
  
  /** Last saved timestamp */
  lastSavedAt: string | null;
  
  /** Last auto-save timestamp */
  lastAutoSaveAt: string | null;
  
  /** Current version for undo/redo */
  version: number;
}

// =================================================================
// WIZARD STATE EXTENSION
// =================================================================

/**
 * Cost Seg settings stored in wizard state
 */
export interface CostSegSettings {
  /** Whether cost seg is enabled for this appraisal */
  enabled: boolean;
  
  /** Stored analysis (with user overrides) */
  analysis?: CostSegAnalysis;
  
  /** Report state for the editor */
  reportState?: Partial<CostSegReportState>;
  
  /** Whether the user has skipped cost seg for this assignment */
  skipped?: boolean;
  
  /** Configured tax rate for projections */
  taxRate: number;
  
  /** Configured bonus depreciation rate */
  bonusRate: number;
}

// =================================================================
// COMPONENT ALLOCATION
// =================================================================

/**
 * Component allocation by occupancy type
 * Used to distribute building cost to components
 */
export interface ComponentAllocation {
  /** Component ID */
  componentId: string;
  
  /** Display label */
  label: string;
  
  /** Percentage of total building cost */
  percentOfBuildingCost: number;
  
  /** Default depreciation class */
  defaultDepreciationClass: DepreciationClass;
  
  /** IRS category */
  category: ComponentCategory;
  
  /** IRS asset class reference */
  irsAssetClass?: string;
}

/**
 * Occupancy-based allocation table
 */
export interface OccupancyAllocation {
  /** M&S occupancy code */
  occupancyCode: string;
  
  /** Display label */
  occupancyLabel: string;
  
  /** Component allocations for this occupancy type */
  components: ComponentAllocation[];
}

