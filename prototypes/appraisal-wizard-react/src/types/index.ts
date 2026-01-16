/**
 * Harken Appraisal Wizard - Type Definitions
 * ==========================================
 * 
 * This file contains all TypeScript type definitions for the appraisal wizard.
 * It's organized into clearly marked sections - search for `// ===` to navigate.
 * 
 * ## Quick Navigation
 * | Search Term                  | Section                              |
 * |------------------------------|--------------------------------------|
 * | `WIZARD STATE TYPES`         | Core appraisal scenarios             |
 * | `COMPONENT DETAIL`           | Building component tracking          |
 * | `IMPROVEMENTS INVENTORY`     | Building inventory types             |
 * | `SITE IMPROVEMENTS`          | M&S Section 66 types                 |
 * | `COST SEGREGATION`           | IRS cost seg analysis                |
 * | `DOCUMENT TYPES`             | Document extraction                  |
 * | `FIELD SUGGESTIONS`          | AI field suggestions                 |
 * | `RECONCILIATION`             | Value reconciliation                 |
 * | `PROGRESS TRACKING`          | Completion tracking                  |
 * | `SUBJECT DATA`               | Subject property types               |
 * | `EXTERNAL DATA`              | Cadastral, demographics, SWOT        |
 * | `SALES COMPARISON`           | Sales comp types                     |
 * | `WizardState`                | Main state interface                 |
 * | `WizardAction`               | Redux-style action types             |
 * | `REPORT CONFIGURATION`       | Report builder types                 |
 * | `EDITOR STATE`               | WYSIWYG editor types                 |
 * 
 * ## Usage
 * ```typescript
 * import type { SubjectData, WizardState } from '../types';
 * ```
 * 
 * @see types/README.md for full documentation
 */

// =================================================================
// IMPORTS FOR INTERNAL USE
// =================================================================

import type { DetectedBuildingComponent as DetectedBuildingComponentType } from '../services/photoClassification';

// =================================================================
// INCOME APPROACH TYPES (re-exported from feature)
// =================================================================

export type {
  LineItem,
  IncomeData,
  ExpenseData,
  ValuationData,
  PropertyMeta,
  FinancialSummary,
  ValuationScenario,
  LineItemType,
  IncomeApproachState,
} from '../features/income-approach/types';

// =================================================================
// WIZARD STATE TYPES
// =================================================================

export interface AppraisalScenario {
  id: number;
  name: string;
  approaches: string[];
  effectiveDate: string;
  isRequired: boolean;
}

export interface HeightZone {
  id: string;
  label: string;
  clearHeight: number | null;
  eaveHeight: number | null;
  ridgeHeight: number | null;
}

// =================================================================
// COMPONENT DETAIL TYPES (for Cost Segregation & Risk Rating)
// =================================================================

export type ComponentCondition = 'excellent' | 'good' | 'average' | 'fair' | 'poor';

/**
 * Detailed component information for cost segregation and asset quality scoring.
 * Each component can track its installation date, condition, and economic life.
 */
export interface ComponentDetail {
  id: string;                    // Unique identifier for this component instance
  type: string;                  // Component type (e.g., "TPO Membrane", "Central HVAC")
  yearInstalled?: number;        // Year installed/replaced (defaults to building yearBuilt if not set)
  condition?: ComponentCondition;
  economicLife?: number;         // Total economic life in years (M&S default, user-adjustable)
  effectiveAge?: number;         // Calculated or user override
  effectiveAgeOverride?: boolean; // True if user manually set effective age
  quantity?: number;             // For countable items (e.g., 3 RTUs)
  unit?: string;                 // Unit of measure (e.g., "tons", "units", "SF")
  notes?: string;                // Additional details
  // Depreciation Override
  depreciationOverride?: number;       // User-specified depreciation % (overrides calculated)
  depreciationOverrideReason?: string; // Narrative explaining the override rationale
}

/**
 * Photo Data - shared type for photo management across the wizard
 * Used in photo upload, staging, and assignment workflows.
 */
export interface PhotoData {
  file?: File;           // Optional - only present for newly uploaded photos, not for loaded ones
  preview: string;       // Object URL or data URL for display
  caption: string;       // User-provided caption
  takenBy: string;       // Photographer name
  takenDate: string;     // Date photo was taken
}

/**
 * Report Photo Data - simplified photo reference for report sections
 * Used in report preview, inline photo placement, and PDF generation.
 * This is a lighter interface than PhotoData for display purposes.
 */
export interface ReportPhotoData {
  id: string;            // Unique identifier
  url: string;           // Display URL (preview URL or blob URL)
  caption: string;       // Photo caption for display
  category?: string;     // Category for filtering (exterior, interior, aerial, etc.)
  slotId?: string;       // Original slot assignment if applicable
  cropData?: {           // Crop data if the photo has been cropped
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Exterior Features with optional detailed component tracking.
 * Maintains backwards compatibility with string[] format while adding detailed tracking.
 */
export interface ExteriorFeatures {
  // Legacy format (simple string arrays for quick selection)
  foundation?: string[];
  roof?: string[];
  walls?: string[];
  windows?: string[];
  description?: string;

  // Detailed format (for cost segregation and asset quality)
  foundationDetails?: ComponentDetail[];
  roofDetails?: ComponentDetail[];
  wallDetails?: ComponentDetail[];
  windowDetails?: ComponentDetail[];
}

/**
 * Interior Features with optional detailed component tracking.
 * Maintains backwards compatibility with string[] format while adding detailed tracking.
 */
export interface InteriorFeatures {
  // Legacy format (simple string arrays for quick selection)
  ceilings?: string[];
  flooring?: string[];
  walls?: string[];
  plumbing?: string[];
  lighting?: string[];
  description?: string;

  // Detailed format (for cost segregation and asset quality)
  ceilingDetails?: ComponentDetail[];
  flooringDetails?: ComponentDetail[];
  wallDetails?: ComponentDetail[];
  plumbingDetails?: ComponentDetail[];
  lightingDetails?: ComponentDetail[];
}

/**
 * Mechanical Systems with optional detailed component tracking.
 * Maintains backwards compatibility with string[] format while adding detailed tracking.
 */
export interface MechanicalSystems {
  // Legacy format (simple string arrays for quick selection)
  electrical?: string[];
  heating?: string[];
  cooling?: string[];
  sprinkler?: string[];
  elevators?: string[];
  description?: string;

  // Detailed format (for cost segregation and asset quality)
  electricalDetails?: ComponentDetail[];
  heatingDetails?: ComponentDetail[];
  coolingDetails?: ComponentDetail[];
  sprinklerDetails?: ComponentDetail[];
  elevatorDetails?: ComponentDetail[];
}

/**
 * Area type for ImprovementArea.
 * Comprehensive list matching AreaTypeId from useAreaTypes.ts.
 * Includes all property-type-specific area types for proper filtering.
 */
export type ImprovementAreaType =
  // Industrial/Warehouse
  | 'warehouse'
  | 'dock'
  | 'office-mezz'
  | 'break-room'
  | 'mechanical-room'
  | 'cold-storage'
  | 'manufacturing'
  | 'clean-room'
  // Office
  | 'office'
  | 'conference'
  | 'lobby'
  | 'restroom'
  | 'storage'
  | 'server-room'
  | 'kitchen-break'
  // Retail
  | 'sales-floor'
  | 'stockroom'
  | 'fitting-room'
  | 'service-area'
  // Residential
  | 'living-area'
  | 'kitchen'
  | 'bedroom'
  | 'bathroom'
  | 'garage'
  | 'basement'
  | 'utility'
  | 'laundry'
  // Multifamily
  | 'unit'
  | 'common-area'
  | 'leasing-office'
  | 'fitness'
  | 'pool-area'
  | 'parking-garage'
  // Agricultural
  | 'barn'
  | 'shop'
  | 'tack-room'
  // Universal
  | 'flex'
  | 'mezzanine'
  // Legacy compatibility
  | 'retail'
  | 'apartment'
  | 'industrial'
  | 'other';

export interface ImprovementArea {
  id: string;
  type: ImprovementAreaType;
  customType?: string;
  squareFootage: number | null;
  sfType: 'GBA' | 'NRA' | 'GLA' | 'RSF';
  hasMeasuredSF?: boolean; // True if SF was measured, false if only documenting finishes
  yearBuilt?: number | null;
  yearRemodeled?: string;
  condition?: string;
  description?: string;
  interiorFeatures?: InteriorFeatures;
}

export interface ImprovementBuilding {
  id: string;
  name: string;
  address?: string;
  addressOverride?: string;
  yearBuilt: number | null;
  yearRemodeled?: string;
  constructionType?: string;
  constructionQuality?: string;
  constructionClass?: 'A' | 'B' | 'C' | 'D' | 'S'; // M&S Construction Class
  condition?: string;
  clearHeight?: number | null;
  eaveHeight?: number | null;
  ridgeHeight?: number | null;
  effectiveAge?: number;
  totalEconomicLife?: number;
  buildingConfiguration?: 'standard' | 'clear-span' | 'multi-bay' | 'variable';
  exteriorFeatures?: ExteriorFeatures;
  mechanicalSystems?: MechanicalSystems;
  constructionDescription?: string;
  heightZones?: HeightZone[];
  areas: ImprovementArea[];

  /**
   * M&S Property Type Override (Tier 2)
   * If set, overrides the wizard-level default property type for this building.
   * Examples: 'industrial', 'office', 'retail', 'residential', 'agricultural'
   * When null/undefined, inherits from Setup page's msOccupancyCode property type.
   */
  propertyTypeOverride?: string;

  /**
   * M&S Occupancy Code Override (Tier 3)
   * If set, overrides the wizard-level default occupancy code for this building.
   * Examples: 'warehouse-general', 'office-lowrise', 'retail-general'
   * When null/undefined, inherits from Setup page's msOccupancyCode.
   */
  msOccupancyCodeOverride?: string;

  /**
   * Cost Segregation Details (Per-Building)
   * Only populated when Cost Segregation is enabled in wizard setup.
   * Contains CSSI-style line item costs for 5/15/39-year component allocations.
   */
  costSegDetails?: CostSegBuildingDetails;
}

export interface ImprovementParcel {
  id: string;
  parcelNumber: string;
  legalDescription?: string;
  address?: string;
  buildings: ImprovementBuilding[];
}

export interface ImprovementsInventory {
  schemaVersion: number;
  parcels: ImprovementParcel[];
}

// =================================================================
// SITE IMPROVEMENT TYPES (M&S Section 66)
// =================================================================

export type SiteImprovementCondition = 'excellent' | 'good' | 'average' | 'fair' | 'poor';

export interface SiteImprovement {
  id: string;
  typeId: string;              // References SiteImprovementType from marshallSwift.ts
  typeName: string;            // Display label
  description: string;         // Additional notes

  // Quantity
  quantity: number;
  unit: 'SF' | 'LF' | 'EA' | 'LS';

  // Age-Life Data
  yearInstalled: number | null;
  condition: SiteImprovementCondition;
  economicLife: number;        // From M&S defaults, user-adjustable
  effectiveAge: number;        // Calculated or override
  effectiveAgeOverride: boolean;

  // Cost (populated in Cost Approach)
  costPerUnit?: number;
  replacementCostNew?: number;
  depreciationPercent?: number;
  contributoryValue?: number;

  // Depreciation Override
  depreciationOverride?: number;       // User-specified depreciation % (overrides calculated)
  depreciationOverrideReason?: string; // Narrative explaining the override rationale
}

export interface SiteImprovementsInventory {
  schemaVersion: number;
  improvements: SiteImprovement[];
}

// =================================================================
// COST SEGREGATION TYPES
// =================================================================

import type { DepreciationClass, BuildingSystem } from '../constants/costSegregation';

// Re-export for convenience
export type { DepreciationClass, BuildingSystem };

/**
 * A single component in the cost segregation analysis.
 * Represents an allocated portion of the building or site cost.
 */
export interface CostSegComponent {
  id: string;
  componentId: string;           // Reference to ComponentClassification in costSegregation.ts
  label: string;                 // Human-readable label
  category: 'building-structure' | 'building-component' | 'site-improvement' | 'personal-property' | 'tenant-improvement';

  // Depreciation Classification
  depreciationClass: DepreciationClass;
  depreciationClassOverride?: DepreciationClass;   // User override
  overrideReason?: string;                         // Justification for override

  // Cost Data
  cost: number;                  // Allocated cost for this component
  percentOfTotal: number;        // Percentage of total project cost

  // Source Tracking
  buildingId?: string;           // If building-specific
  buildingName?: string;         // Building name for display (per-building cost seg)
  sourceType: 'allocation' | 'inventory' | 'manual';  // How this was determined

  // Age-Life (for component-level depreciation)
  yearPlacedInService?: number;  // When component was placed in service
  economicLife?: number;         // Total economic life in years
  effectiveAge?: number;         // Effective age for depreciation

  // Flags
  isTenantImprovement: boolean;
  isLandImprovement: boolean;
}

/**
 * Summary of a building system per IRS TD 9636.
 * Used for tangible property regulations compliance.
 */
export interface BuildingSystemSummary {
  system: BuildingSystem;
  systemLabel: string;
  depreciableCost: number;          // Current depreciable basis
  replacementCost: number;          // Current replacement cost new
  components: string[];             // Component IDs included in this system
  percentOfBuilding: number;        // Percentage of total building cost
}

/**
 * Summary by depreciation class.
 */
export interface DepreciationClassSummary {
  depreciationClass: DepreciationClass;
  label: string;
  totalCost: number;
  percentOfTotal: number;
  componentCount: number;
}

/**
 * Year-by-year depreciation projection.
 */
export interface DepreciationYearProjection {
  year: number;
  fiveYearDepreciation: number;
  sevenYearDepreciation: number;
  fifteenYearDepreciation: number;
  twentySevenFiveYearDepreciation: number;  // For residential
  thirtyNineYearDepreciation: number;
  totalDepreciation: number;
  cumulativeDepreciation: number;
  remainingBasis: number;
}

/**
 * Full cost segregation analysis for a property.
 */
export interface CostSegAnalysis {
  id: string;
  propertyId: string;
  analysisDate: string;

  // Property Info
  propertyName: string;
  propertyAddress: string;
  occupancyCode: string;
  isResidential: boolean;        // Determines 27.5 vs 39-year real property

  // Source Data
  totalProjectCost: number;      // Total acquisition or construction cost
  landValue: number;             // Land value (not depreciable)
  totalImprovementCost: number;  // totalProjectCost - landValue
  totalBuildingCost: number;     // Building improvements only
  totalSiteImprovementCost: number;  // Site improvements (15-year)

  // Components
  components: CostSegComponent[];

  // Summaries
  classSummary: DepreciationClassSummary[];
  buildingSystems: BuildingSystemSummary[];

  // Key Results (convenience properties)
  summary: {
    fiveYear: { total: number; percent: number };
    sevenYear: { total: number; percent: number };
    fifteenYear: { total: number; percent: number };
    twentySevenFiveYear: { total: number; percent: number };
    thirtyNineYear: { total: number; percent: number };
  };

  // Depreciation Schedule
  depreciationSchedule: DepreciationYearProjection[];

  // Tax Benefit Summary
  firstYearDepreciation: number;
  acceleratedBenefit: number;    // Additional depreciation vs. straight 39-year

  // Methodology & Compliance
  methodology: 'detailed-engineering' | 'cost-estimate';
  methodologyDescription: string;
  preparedBy?: string;
  preparedDate?: string;

  // Override Tracking
  hasManualOverrides: boolean;
  overrideCount: number;
}

/**
 * Configuration for cost segregation analysis.
 */
export interface CostSegConfig {
  // Tax Year Settings
  taxYear: number;
  bonusDepreciationPercent: number;  // 100%, 80%, 60%, etc. based on tax year

  // Property Settings
  isNewConstruction: boolean;        // Affects bonus depreciation eligibility
  acquisitionDate?: string;
  placedInServiceDate: string;

  // Analysis Options
  includeSiteImprovements: boolean;
  includeDepreciationSchedule: boolean;
  projectionYears: number;           // How many years to project (default 10)
}

/**
 * State for cost segregation in the wizard.
 */
export interface CostSegState {
  isEnabled: boolean;
  config: CostSegConfig;
  analysis: CostSegAnalysis | null;
  componentOverrides: Record<string, DepreciationClass>;  // componentId -> override class
  isGenerating: boolean;
  lastGeneratedAt: string | null;
  error: string | null;
}

// =================================================================
// CSSI-STYLE COST SEGREGATION TYPES (Per-Building Details)
// =================================================================

/**
 * System refinement for breaking down major building systems.
 * Used to allocate electrical, HVAC, plumbing, etc. into specific depreciation classes.
 */
export interface CostSegSystemRefinement {
  id: string;
  systemType: 'electrical' | 'plumbing' | 'hvac' | 'fire-protection' | 'elevators' | 'roofing' | 'structural';
  systemLabel: string;              // e.g., "Electrical System"
  totalSystemCost: number;          // From appraisal data (M&S, mechanicalSystems, etc.)

  refinements: CostSegRefinementLine[];

  // Validation tracking
  totalAllocated: number;           // Sum of refinement amounts
  isFullyAllocated: boolean;        // totalAllocated === totalSystemCost
}

/**
 * Individual refinement line within a system breakdown.
 * Represents a specific allocation like "Branch Circuit Wiring" or "Rooftop HVAC Units".
 */
export interface CostSegRefinementLine {
  id: string;
  description: string;              // User-defined or template, e.g., "Dedicated Equipment Circuits"
  depreciationClass: DepreciationClass;
  amount: number;
  allocationMethod: 'measured' | 'percentage' | 'engineering-estimate';

  // Measurement support (for IRS documentation)
  measurements?: {
    quantity: number;
    unit: 'LF' | 'SF' | 'EA' | 'tons' | 'BTU' | 'amps' | 'kW';
    costPerUnit?: number;
    notes: string;
  };

  // Photo documentation
  linkedPhotoIds?: string[];        // Links to report photos

  // IRS support
  irsAssetClass?: string;           // e.g., "Asset Class 00.11"
  justification?: string;           // Reasoning for classification
  notes?: string;
}

/**
 * Supplemental items not captured in typical appraisal.
 * These are cost-seg-specific additions like tenant improvements or specialty equipment.
 */
export interface CostSegSupplementalItem {
  id: string;
  description: string;              // User-defined, e.g., "Custom Restaurant Equipment Package"
  category: 'personal-property' | 'land-improvement' | 'tenant-improvement' | 'specialty-equipment';
  depreciationClass: DepreciationClass;
  cost: number;

  // Documentation
  linkedPhotoIds?: string[];
  notes?: string;
  vendor?: string;
  invoiceDate?: string;

  // Building association (optional)
  buildingId?: string;
}

/**
 * Simplified cost seg details stored per-building.
 * Focuses on refinements and supplements rather than re-entering all building data.
 */
export interface CostSegBuildingDetails {
  enabled: boolean;
  placedInServiceDate?: string;

  // System refinements (breaking down big systems from appraisal)
  systemRefinements: CostSegSystemRefinement[];

  // Supplemental items (things not in appraisal at all)
  supplementalItems: CostSegSupplementalItem[];

  // Component overrides (rare - if you disagree with auto-classification)
  componentOverrides?: {
    [componentId: string]: {
      depreciationClass: DepreciationClass;
      reason: string;
    };
  };

  // Site visit compliance
  siteVisitDate?: string;
  siteVisitNotes?: string;
  inspectorName?: string;
}

/**
 * @deprecated - Legacy type, kept for backwards compatibility during migration
 */
export interface CostSegLineItem {
  id: string;
  componentId: string;
  displayName: string;
  category: 'personal-property' | 'land-improvement' | 'real-property';
  depreciationClass: DepreciationClass;
  msPercent: number;
  msAmount: number;
  actualAmount?: number;
  finalAmount: number;
  source: 'auto' | 'manual';
  notes?: string;
}

/**
 * Audit risk assessment for cost segregation study.
 * Provides real-time feedback on IRS audit risk level.
 */
export interface CostSegAuditRisk {
  overallRisk: 'low' | 'moderate' | 'high';
  personalPropertyPercent: number;
  landImprovementPercent: number;
  realPropertyPercent: number;

  flags: {
    type: 'warning' | 'info' | 'success';
    message: string;
    recommendation?: string;
  }[];

  recommendations: string[];
  score: number;  // 0-100, higher = lower risk
}

/**
 * Industry benchmark comparison data.
 * Used to compare user's allocations against typical ranges.
 */
export interface CostSegBenchmark {
  propertyType: string;             // 'office', 'retail', 'restaurant', etc.
  buildingSizeCategory: string;     // '0-50K SF', '50-150K SF', etc.
  qualityClass?: string;            // 'Class A', 'Class B', 'Class C'

  typicalRanges: {
    fiveYearMin: number;
    fiveYearMax: number;
    fifteenYearMin: number;
    fifteenYearMax: number;
    thirtyNineYearMin: number;
    thirtyNineYearMax: number;
  };

  source: string;                   // 'CSSI Industry Study 2024', etc.
  notes?: string;
}

/**
 * Per-building breakdown for CSSI-style reports.
 * Generated from CostSegBuildingDetails for report output.
 */
export interface CostSegBuildingBreakdown {
  buildingId: string;
  buildingName: string;
  totalBuildingCost: number;

  // Summary by depreciation class
  fiveYearTotal: number;
  fiveYearPercent: number;
  sevenYearTotal: number;
  sevenYearPercent: number;
  fifteenYearTotal: number;
  fifteenYearPercent: number;
  twentySevenFiveYearTotal: number;
  twentySevenFiveYearPercent: number;
  thirtyNineYearTotal: number;
  thirtyNineYearPercent: number;

  // Line items grouped by category (for detail tables)
  personalPropertyItems: CostSegLineItem[];   // 5-year, 7-year
  landImprovementItems: CostSegLineItem[];    // 15-year
  realPropertyItems: CostSegLineItem[];       // 27.5-year, 39-year

  // Building systems valuation (CSSI format)
  buildingSystems: BuildingSystemValuation[];
}

/**
 * Building system valuation for CSSI-style Building Systems table.
 * Shows both depreciable cost and current replacement cost.
 */
export interface BuildingSystemValuation {
  system: string;                   // "Ceiling Systems", "HVAC", "Electrical"
  depreciableCost: number;          // Current depreciable basis
  currentReplacementCost: number;   // Current replacement cost new
}

/**
 * Report metadata for cost seg cover letter and certification.
 */
export interface CostSegReportMetadata {
  // Cover Letter Info
  recipientName: string;
  recipientTitle: string;
  companyName: string;
  propertyAddress: string;
  reportDate: string;

  // Study Info  
  siteVisitDate: string;
  inspectorName: string;
  siteVisitNotes: string;

  // Preparer Info (from firm settings)
  preparerName: string;
  preparerCredentials: string;
  firmName: string;

  // Certification
  certificationDate: string;
  certifiedBy: string;
}

/**
 * Full CSSI-style analysis combining all buildings.
 */
export interface CostSegFullAnalysis {
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  analysisDate: string;

  // All buildings analyzed
  buildings: CostSegBuildingBreakdown[];

  // Property-level totals
  totalProjectCost: number;
  totalFiveYear: number;
  totalFifteenYear: number;
  totalThirtyNineYear: number;

  // Tax benefit calculations
  firstYearDepreciation: number;
  acceleratedBenefit: number;
  presentValueSavings: number;

  // Report metadata
  metadata?: CostSegReportMetadata;
}

// =================================================================
// DOCUMENT EXTRACTION TYPES
// =================================================================

export interface ExtractedField {
  value: string;
  confidence: number;
  edited?: boolean;
  source?: string;
}

export interface ExtractedData {
  [key: string]: ExtractedField;
}

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  slotId: string;
  status: 'pending' | 'processing' | 'extracted' | 'error';
  extractedData?: ExtractedData;
  includeInReport?: boolean;
  documentType?: string; // AI-classified document type
  classificationConfidence?: number;
  file?: File;
  preview?: string;
  url?: string;
  uploadDate?: string;
}

// =================================================================
// DOCUMENT FIELD SOURCE TRACKING TYPES
// =================================================================

/**
 * Tracks the source of an auto-populated field value.
 * Allows UI to show where data came from and confidence level.
 */
export interface ExtractedFieldSource {
  value: string;
  confidence: number;
  sourceDocumentId: string;
  sourceFilename: string;
  sourceDocumentType: string;
  extractedAt: string;
  fieldPath: string; // Wizard field path like 'subjectData.taxId'
}

/**
 * State for tracking all document extractions and field sources.
 */
export interface DocumentExtractionState {
  documents: UploadedDocument[];
  fieldSources: Record<string, ExtractedFieldSource>; // key = field path
  lastAppliedAt: string | null;
}

// =================================================================
// FIELD SUGGESTION TYPES (Accept/Reject UI)
// =================================================================

/**
 * Source type for field suggestions.
 */
export type FieldSuggestionSource = 'document' | 'montana_gis' | 'cotality' | 'manual';

/**
 * Status of a field suggestion.
 */
export type FieldSuggestionStatus = 'pending' | 'accepted' | 'rejected';

/**
 * A pending field suggestion that requires user confirmation.
 * Multiple suggestions can exist for the same field (e.g., from different documents).
 */
export interface FieldSuggestion {
  id: string; // Unique ID for this suggestion (used for selection in multi-value UI)
  value: string;
  confidence: number;
  source: FieldSuggestionSource;
  sourceFilename?: string;
  sourceDocumentType?: string;
  sourceDocumentId?: string; // ID of the document this came from
  status: FieldSuggestionStatus;
  rejectedSources: string[]; // Track which sources have been rejected
  createdAt: string;
}

/**
 * State for tracking field suggestions across the wizard.
 * Supports multiple suggestions per field for side-by-side comparison.
 */
export interface FieldSuggestionsState {
  suggestions: Record<string, FieldSuggestion[]>; // key = field path, value = array of suggestions
  acceptedFields: Record<string, FieldSuggestionSource>; // field path -> source that was accepted
}

// =================================================================
// OWNER TYPES
// =================================================================

export interface Owner {
  id: string;
  name: string;
  ownershipType: 'individual' | 'corporation' | 'llc' | 'partnership' | 'trust' | 'government' | 'other';
  percentage: number;
}

// =================================================================
// RECONCILIATION TYPES
// =================================================================

export interface ScenarioReconciliation {
  scenarioId: number;
  weights: Record<string, number>; // approach name -> weight percentage
  comments: string;
}

/**
 * Combined sale discount configuration.
 * Applied when selling multiple components together as a package.
 */
export interface CombinedSaleDiscount {
  enabled: boolean;
  percentage: number;           // Default 10%
  rationale: string;            // Explanation for the discount
}

export interface ReconciliationData {
  scenarioReconciliations: ScenarioReconciliation[];
  exposurePeriod: number | null;
  marketingTime: number | null;
  exposureRationale: string;
  certifications: string[]; // IDs of selected certifications

  // Display mode for component values in report
  displayMode: 'combined' | 'individual' | 'both';

  // Combined sale discount (sum of parts typically higher than combined)
  combinedSaleDiscount?: CombinedSaleDiscount;
}

// =================================================================
// PROGRESS TRACKING TYPES
// =================================================================

export interface PageTabState {
  lastActiveTab: string;
  hasInteracted: boolean;
}

export interface ScenarioCompletionState {
  scenarioId: number;
  completedApproaches: string[];
  isComplete: boolean;
  completedAt: string | null;
}

// =================================================================
// APPROACH VALUE CONCLUSIONS (for Analysis page tracking)
// =================================================================

export interface ApproachConclusion {
  scenarioId: number;
  approach: string;  // 'Sales Comparison', 'Income Approach', 'Cost Approach'
  valueConclusion: number | null;
  lastUpdated: string | null;
}

export interface AnalysisConclusions {
  conclusions: ApproachConclusion[];
}

// Cost Approach user overrides for building cost data
// These are stored separately from the source building inventory
export interface CostApproachOverrides {
  baseCostPsf?: number;
  occupancy?: string;
  class?: string;
  quality?: string;
  effectiveAge?: number;
  economicLife?: number;
  entrepreneurialIncentive?: number;
  multipliers?: {
    current?: number;
    local?: number;
    perimeter?: number;
  };
  depreciationPhysical?: number;
  depreciationFunctional?: number;
  depreciationExternal?: number;

  // Contractor Cost Comparison
  contractorCost?: number;                         // Actual contractor cost/bid
  contractorSource?: 'bid' | 'invoice' | 'estimate'; // Source type
  contractorDate?: string;                         // Date of bid/invoice
  contractorNotes?: string;                        // Reconciliation notes
}

export interface CelebrationState {
  isVisible: boolean;
  sectionId: string | null;
  scenarioId: number | null;  // For scenario-specific celebrations
  level: 'none' | 'small' | 'medium' | 'large' | 'grand' | 'finale';
}

// =================================================================
// SUBJECT DATA TYPES (Centralized property identification)
// =================================================================

export interface SubjectAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  county: string;
}

export interface SubjectData {
  // Property identification
  propertyName: string;
  address: SubjectAddress;
  taxId: string;
  legalDescription: string;

  // Key dates
  reportDate: string;
  inspectionDate: string;
  effectiveDate: string;

  // Sale history (USPAP requirement)
  lastSaleDate: string;
  lastSalePrice: string;
  transactionHistory: string;

  // Location & Area (Subject Data page - Location tab)
  areaDescription: string;
  neighborhoodBoundaries: string;
  neighborhoodCharacteristics: string;
  specificLocation: string;

  // Site Details (Subject Data page - Site tab)
  siteArea: string;        // Acres or square feet
  siteAreaUnit: 'acres' | 'sqft';
  shape: string;
  frontage: string;
  topography: string;
  environmental: string;
  easements: string;
  zoningClass: string;
  zoningDescription: string;
  zoningConforming: boolean;

  // Utilities (expanded)
  waterSource: string;
  waterProvider: string;  // Provider name (e.g., "City of Bozeman")
  sewerType: string;
  electricProvider: string;
  naturalGas: string;
  telecom: string;

  // Storm Drainage & Fire Protection (site-level)
  stormDrainage: string;           // Adequacy: 'adequate' | 'limited' | 'poor' | 'unknown'
  stormDrainageNotes: string;
  fireHydrantDistance: string;     // '<500ft' | '500-1000ft' | '>1000ft' | 'none' | 'unknown'

  // Access & Visibility
  approachType: string;
  accessQuality: string;
  visibility: string;
  truckAccess: string;

  // Site Improvements
  pavingType: string;
  fencingType: string;
  yardStorage: string;
  landscaping: string;

  // Flood Zone (enhanced)
  femaZone: string;
  femaMapPanel: string;
  femaMapDate: string;
  floodInsuranceRequired: string;

  // Site Description Narrative
  siteDescriptionNarrative: string;

  // Convenience fields (computed from other fields or legacy)
  utilities?: string;    // Combined utilities description
  floodZone?: string;    // Alias for femaZone

  // Purpose & Scope (Setup page - Purpose tab)
  appraisalPurpose: string;
  intendedUsers: string;
  propertyInterest: string;

  // Inspection (Setup page - Inspection tab)
  inspectorName: string;
  inspectorLicense: string;
  inspectionType: string;
  personalInspection: boolean; // true = appraiser inspected personally, false = contract inspector

  // Certifications (Setup page - Certifications tab)
  certificationAcknowledged: boolean;
  licenseNumber: string;
  licenseState: string;
  licenseExpiration: string;
  additionalCertifications: string;
  appraisalAssistance: string;

  // Assignment Context (from Setup - drives scenario/visibility logic)
  propertyStatus?: 'existing' | 'under_construction' | 'proposed' | 'recently_completed';
  occupancyStatus?: 'stabilized' | 'lease_up' | 'vacant' | 'not_applicable';
  plannedChanges?: 'none' | 'minor' | 'major' | 'change_of_use';
  loanPurpose?: 'purchase' | 'refinance' | 'construction' | 'bridge' | 'internal';

  // Coordinates (for demographics lookup)
  coordinates?: {
    latitude: number;
    longitude: number;
  };

  // CBRE Parity - Enhanced data fields
  cadastralData?: CadastralData;
  demographicsData?: DemographicsData;
  economicIndicators?: EconomicIndicators;
  swotAnalysis?: SWOTAnalysisData;
  riskRating?: RiskRatingData;

  // Cost Segregation
  costSegregationEnabled?: boolean;

  // Property Boundaries (Site Details)
  northBoundary?: string;
  southBoundary?: string;
  eastBoundary?: string;
  westBoundary?: string;
  // Drawn property boundary polygon coordinates
  propertyBoundaryCoordinates?: Array<{ lat: number; lng: number }>;

  // Traffic Data (Site Details - External Integration)
  trafficData?: {
    aadt?: number;           // Annual Average Daily Traffic
    speedLimit?: number;
    roadClassification?: 'local' | 'collector' | 'arterial' | 'highway' | 'interstate';
    truckPercentage?: number;
    numberOfLanes?: number;
    source?: string;
    lastUpdated?: string;
  };

  // Building Permits (External Integration)
  buildingPermits?: BuildingPermit[];

  // Multi-Family specific fields (populated when propertyType is multifamily)
  totalUnitCount?: number;
  totalRoomCount?: number;        // For hotels/motels
  totalPadCount?: number;         // For mobile home parks
  totalHoleCount?: number;        // For golf courses
  unitMix?: MultiFamilyUnitMix[];
  calculationMethod?: MultiFamilyCalculationMethod;
  primaryValueDriver?: PrimaryValueDriver;
  // Unknown SF support - when per-unit SF is unknown, use total building SF
  perUnitSfUnknown?: boolean;
  totalBuildingSf?: number;

  // Grid Configuration (determined by Setup page)
  gridConfiguration?: SalesGridConfiguration;
}

export interface BuildingPermit {
  id: string;
  permitNumber: string;
  type: 'new_construction' | 'renovation' | 'mechanical' | 'electrical' | 'plumbing' | 'demolition' | 'other';
  description: string;
  issueDate: string;
  estimatedValue?: number;
  contractor?: string;
  status: 'issued' | 'final' | 'expired' | 'pending';
  inspectionStatus?: string;
}

// =================================================================
// CBRE PARITY - DATA INTEGRATION TYPES
// =================================================================

export interface CadastralData {
  parcelId: string;
  legalDescription: string;
  county: string;
  acres: number;
  sqft: number;
  situsAddress: string;
  ownerName: string;
  assessedLandValue: number;
  assessedImprovementValue: number;
  totalAssessedValue: number;
  taxYear: number;
  zoning?: string;
  lastUpdated: string;
}

export interface DemographicsData {
  radiusAnalysis: import('./api').RadiusDemographics[];
  dataSource: 'census' | 'esri' | 'manual';
  dataPullDate: string;
}

export interface EconomicIndicators {
  federalFundsRate: { current: number; projected1Y?: number; history?: { date: string; value: number }[] };
  treasury10Y: { current: number; projected1Y?: number; history?: { date: string; value: number }[] };
  inflation: { current: number; trend: 'rising' | 'stable' | 'falling'; history?: { date: string; value: number }[] };
  gdpGrowth: { current: number; trend: 'accelerating' | 'stable' | 'slowing'; history?: { date: string; value: number }[] };
  asOfDate: string;
  source: string;
}

export interface SWOTAnalysisData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  summary: string;
}

// =================================================================
// ENHANCED SWOT TYPES (Data-Driven Analysis)
// =================================================================

export type SWOTCategory = 'location' | 'market' | 'physical' | 'financial' | 'regulatory' | 'environmental';
export type SWOTConfidence = 'high' | 'medium' | 'low';
export type SWOTQuadrant = 'strength' | 'weakness' | 'opportunity' | 'threat';

/**
 * Enhanced SWOT item with metadata for intelligent analysis
 */
export interface SWOTItem {
  id: string;
  text: string;
  category: SWOTCategory;
  confidence: SWOTConfidence;
  source: string;           // e.g., "Demographics Data", "Site Details", "Walk Score API"
  sourceField?: string;     // e.g., "subjectData.frontage", "demographicsData.medianIncome"
  isAISuggested: boolean;
  isUserAdded: boolean;
  impact?: 'high' | 'medium' | 'low';  // How much this affects the property value
  propertyTypeRelevance?: string[];    // Which property types this is relevant for
}

/**
 * Enhanced SWOT data structure with intelligence features
 */
export interface EnhancedSWOTData {
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
  summary: string;
  impactScore: number;      // -100 (all threats) to +100 (all strengths)
  lastAnalyzed?: string;    // ISO date of last AI analysis
  propertyType?: string;    // Property type this was analyzed for
  dataCompleteness: number; // 0-100% how much source data was available
}

/**
 * Walk Score API response type
 */
export interface WalkScoreResponse {
  walkscore: number;         // 0-100
  walkscoreDescription: string;
  transitScore?: number;     // 0-100
  transitDescription?: string;
  bikeScore?: number;        // 0-100
  bikeDescription?: string;
  logo_url?: string;
  snappedLat?: number;
  snappedLon?: number;
}

/**
 * Property-type specific SWOT rules
 */
export interface PropertyTypeSWOTRules {
  propertyType: string;
  relevantFactors: {
    location: string[];      // e.g., ['visibility', 'frontage', 'access']
    physical: string[];      // e.g., ['clearHeight', 'dockDoors', 'sprinklers']
    market: string[];        // e.g., ['vacancyRate', 'rentGrowth']
    financial: string[];     // e.g., ['capRate', 'NOI']
  };
  externalAPIs: string[];    // e.g., ['walkScore', 'transitScore'] or ['truckRoutes']
  strengthThresholds: Record<string, number>;   // e.g., { frontage: 200 } means > 200ft is a strength
  weaknessThresholds: Record<string, number>;   // e.g., { frontage: 50 } means < 50ft is a weakness
}

export type RiskGrade = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'CC' | 'C';

export interface RiskDimensionScore {
  score: number;           // 0-100
  weight: number;          // 0-1 (calculated dynamically)
  dataPoints?: number;     // Number of data points used
  confidence?: 'high' | 'medium' | 'low';
}

export interface RiskRatingData {
  overallGrade: RiskGrade;
  overallScore: number;    // 0-100

  dimensions: {
    marketVolatility: RiskDimensionScore;
    liquidity: RiskDimensionScore;
    incomeStability: RiskDimensionScore;
    assetQuality: RiskDimensionScore;
  };

  weightingRationale: string;
  generatedDate: string;
  dataAsOfDate?: string;
  disclaimer?: string;
}

// =================================================================
// SALES GRID CONFIGURATION TYPES
// =================================================================

/**
 * Grid type taxonomy for Sales Comparison variants.
 * All share the same underlying methodology with different field configurations.
 */
export type SalesGridType =
  | 'retail_office'
  | 'medical_office'
  | 'industrial'
  | 'land_sf'
  | 'land_acre'
  | 'multi_family'
  | 'residential'
  | 'hotel_motel'
  | 'mobile_home_park'
  | 'golf_course';

/**
 * Unit of measurement for grid calculations.
 * Determines how values are displayed and calculated.
 */
export type UnitOfMeasure =
  | 'sf_building'   // Price per SF of building
  | 'sf_land'       // Price per SF of land
  | 'acre'          // Price per acre
  | 'per_unit'      // Price per unit (multifamily)
  | 'per_room'      // Price per room (hotels)
  | 'per_pad'       // Price per pad (mobile home parks)
  | 'per_hole';     // Price per hole (golf courses)

/**
 * Primary value driver indicator for dual-metric display.
 * Used when showing both $/SF and $/unit.
 */
export type PrimaryValueDriver = 'price_per_sf' | 'price_per_unit' | 'price_per_acre';

/**
 * Grid field definition for dynamic row generation.
 * Each field can appear in transactional or physical sections.
 */
export interface GridFieldDefinition {
  id: string;
  label: string;
  category: 'transactional' | 'physical';
  adjustmentType: 'quantitative' | 'qualitative';
  propertyTypes: SalesGridType[];
  format?: 'text' | 'currency' | 'percent' | 'number' | 'currency_sf';
  required: boolean;
  description?: string;
}

/**
 * Complete grid configuration for a property type.
 * Determines which fields are shown and how calculations work.
 */
export interface SalesGridConfiguration {
  gridType: SalesGridType;
  unitOfMeasure: UnitOfMeasure;
  secondaryUnitOfMeasure?: UnitOfMeasure;  // For dual-metric display
  primaryValueDriver?: PrimaryValueDriver;
  transactionalFields: string[];
  physicalFields: string[];
  metrics: string[];
  showCapRate: boolean;
  showResidualMode: boolean;
}

/**
 * Multi-Family Unit Mix Configuration.
 * Captures the breakdown of unit types in a multi-family property.
 * Updated to support unknown SF scenarios per Ben's 7-plex example.
 */
export interface MultiFamilyUnitMix {
  unitType: 'studio' | '1br' | '2br' | '3br' | '4br+';
  count: number;
  avgSF: number | null;                              // null = unknown SF
  sfSource: 'measured' | 'estimated' | 'unknown' | 'county_records';    // Track SF certainty
  bedrooms: number;
  bathrooms: number;
  avgRent?: number;  // Monthly rent for income analysis
}

// =================================================================
// PROPERTY COMPONENT TYPES (Mixed-Use Architecture)
// =================================================================

/**
 * Land allocation configuration for property components.
 * Allows allocating a portion of the total site to a specific component.
 */
export interface LandAllocation {
  acres: number | null;
  squareFeet: number | null;
  allocationMethod: 'measured' | 'estimated' | 'county_records';
  shape?: string;
  frontage?: string;
  // Excess land specific fields
  accessType?: 'separate' | 'shared' | 'easement' | 'none';
  hasUtilities?: boolean;
  hasLegalAccess?: boolean;
  notes?: string;
}

/**
 * Property Component for mixed-use properties.
 * Allows multiple property types within a single appraisal.
 * Examples: retail + apartments, greenhouse + excess land + mobile home pad
 */
export interface PropertyComponent {
  id: string;
  name: string;
  category: 'residential' | 'commercial' | 'land';
  propertyType: string;                              // e.g., 'retail', 'multifamily', 'vacant-land'
  msOccupancyCode: string | null;                    // M&S classification

  // Size allocation
  squareFootage: number | null;
  sfSource: 'measured' | 'estimated' | 'unknown' | 'county_records';    // Track SF certainty

  // Multi-family specific
  unitCount?: number;
  unitMix?: MultiFamilyUnitMix[];
  perUnitSfUnknown?: boolean;            // When true, use totalBuildingSf instead of per-unit avgSF
  totalBuildingSf?: number;               // Total building SF when per-unit is unknown

  // Land allocation for this component
  landAllocation?: LandAllocation;

  // Component classification (per resolved decision #3)
  landClassification: 'standard' | 'excess' | 'surplus';
  // - 'standard': Normal component (not land-specific)
  // - 'excess': Can be sold separately → Land Sales Comparison valuation
  // - 'surplus': Cannot be sold separately → Contributory value adjustment
  isPrimary: boolean;
  sortOrder: number;

  // Skip detailed improvements toggle (for simple/contributory components)
  includeDetailedImprovements: boolean;  // Default true for primary, false for contributory

  // Analysis configuration
  analysisConfig: {
    salesApproach: boolean;
    incomeApproach: boolean;
    costApproach: boolean;
    analysisType: 'full' | 'contributory' | 'combined';
    // - 'full': Separate approach tabs for this component
    // - 'contributory': Income approach only, value added to total
    // - 'combined': No separate instance; income lines added to primary grid
  };
}

/**
 * Income Line Item with rent comp linking.
 * Supports the Pattern B income line → rent comp linking.
 */
export interface IncomeLineItem {
  id: string;
  componentId: string;                               // Links to PropertyComponent
  description: string;
  amount: number;
  basis: 'sf_year' | 'sf_month' | 'unit_month' | 'flat_year';
  linkedRentCompIds: string[];                       // Links to supporting rent comps
}

/**
 * Income Approach Instance (per-component).
 * Created for each component that has income analysis enabled.
 */
export interface IncomeApproachInstance {
  id: string;
  componentId: string;
  componentName: string;
  analysisType: 'full' | 'contributory';

  // Income data
  incomeLineItems: IncomeLineItem[];
  incomeData: import('../features/income-approach/types').IncomeData;
  expenseData: import('../features/income-approach/types').ExpenseData;
  valuationData: import('../features/income-approach/types').ValuationData;

  // Linked rent comparables
  rentComparables: RentComp[];
  rentCompMode: 'commercial' | 'residential';        // Determines field config

  // Concluded value
  concludedValue: number | null;
}

/**
 * Rent comparable for income approach.
 * Used in RentComparableGrid with mode-specific fields.
 */
export interface RentComp {
  id: string;
  address: string;

  // Common fields
  saleDate?: string;
  distance?: number;

  // Commercial mode fields ($/SF/Year)
  rentPerSF?: number;
  buildingSF?: number;
  leaseType?: 'NNN' | 'Gross' | 'Modified Gross';
  tiAllowance?: number;

  // Residential mode fields ($/Month)
  rentPerMonth?: number;
  bedrooms?: number;
  bathrooms?: number;
  unitSF?: number;
  amenities?: string[];
  parking?: string;
  utilities?: string;

  // Adjustments
  adjustments: Record<string, number>;
  adjustedRent?: number;

  // Linking
  linkedIncomeLineIds?: string[];
}

/**
 * Component reconciliation for value aggregation.
 * Tracks concluded values per component for final reconciliation.
 */
export interface ComponentReconciliation {
  componentId: string;
  componentName: string;
  reconciliationType: 'primary' | 'contributory' | 'excess_land' | 'surplus_land';
  approachValues: {
    approach: string;
    value: number;
    weight: number;
  }[];
  reconciledValue: number;
}

/**
 * Scenario reconciliation summary with component breakdown.
 * Displays combined and per-component values.
 */
export interface ScenarioReconciliationSummary {
  scenarioId: number;
  componentReconciliations: ComponentReconciliation[];
  totalMarketValue: number;
  valueBreakdown: {
    componentId: string;
    componentName: string;
    value: number;
    percentOfTotal: number;
  }[];
}

/**
 * Multi-Family Calculation Method.
 * Determines primary valuation unit for the grid.
 */
export type MultiFamilyCalculationMethod = 'per_unit' | 'per_room' | 'per_sf' | 'per_pad' | 'per_hole';

// =================================================================
// SALES COMPARISON DATA (for grid persistence)
// =================================================================

export interface SalesCompProperty {
  id: string;
  type: 'subject' | 'comp';
  name: string;
  address: string;
  image: string;
  status?: string;
  saleDate?: string;
  salePrice?: number;
}

export interface SalesCompValue {
  value: string | number;
  adjustment?: number;
  flag?: 'superior' | 'inferior' | 'similar';
  unit?: 'percent' | 'dollar';
}

export interface SalesComparisonData {
  properties: SalesCompProperty[];
  values: Record<string, Record<string, SalesCompValue>>;
  reconciliationText: string;
  analysisMode: 'standard' | 'residual';
  concludedValue: number | null;
  concludedValuePsf: number | null;
}

export type SalesComparisonDataByComponent = Record<string, Record<number, SalesComparisonData>>;

// =================================================================
// LAND VALUATION DATA (for land sales grid persistence)
// =================================================================

export interface LandSaleComp {
  id: string;
  address: string;
  saleDate: string;
  salePrice: number;
  acreage: number;
  pricePerAcre: number;
  zoning: string;
  adjustments: Record<string, number>;
  adjustedPricePerAcre: number;
}

export interface LandValuationData {
  landComps: LandSaleComp[];
  subjectAcreage: number;
  concludedPricePerAcre: number | null;
  concludedLandValue: number | null;
  reconciliationText: string;
}

// =================================================================
// REPORT PHOTOS (for photos assigned to report sections)
// =================================================================

export interface ReportPhotoAssignment {
  id: string;
  photoId: string;        // Reference to staging photo or uploaded photo
  slotId: string;         // Which photo slot (e.g., 'exterior-front', 'interior-lobby')
  caption: string;
  sortOrder: number;
  url: string;            // Resolved URL for display
}

export interface ReportPhotosData {
  assignments: ReportPhotoAssignment[];
  coverPhotoId: string | null;
}

// =================================================================
// HBU ANALYSIS (Highest & Best Use narrative content)
// =================================================================

export interface HBUAnalysis {
  // As Vacant Analysis
  asVacant: {
    legallyPermissible: string;
    physicallyPossible: string;
    financiallyFeasible: string;
    maximallyProductive: string;
    conclusion: string;
  };
  // As Improved Analysis
  asImproved: {
    legallyPermissible: string;
    physicallyPossible: string;
    financiallyFeasible: string;
    maximallyProductive: string;
    conclusion: string;
  };
  // Overall HBU Conclusion
  overallConclusion: string;
}

// =================================================================
// MARKET ANALYSIS DATA (for market analysis grid persistence)
// =================================================================

export interface MarketAnalysisData {
  supplyMetrics: {
    totalInventory: number;
    vacancyRate: number;
    absorptionRate: number;
    inventoryMonths: number;
  };
  demandMetrics: {
    averageRent: number;
    rentGrowth: number;
    averageDaysOnMarket: number;
    salesVolume: number;
  };
  marketTrends: {
    overallTrend: 'improving' | 'stable' | 'declining';
    priceOutlook: 'increasing' | 'stable' | 'decreasing';
    supplyOutlook: 'increasing' | 'stable' | 'decreasing';
  };
  narrative: string;
}

// =================================================================
// STAGING PHOTOS (for bulk upload with AI classification)
// =================================================================

export interface PhotoClassificationSuggestion {
  slotId: string;
  slotLabel: string;
  category: string;
  categoryLabel: string;
  confidence: number;
  reasoning: string;
}

export interface StagingPhoto {
  id: string;
  file: File;
  preview: string;
  filename: string;
  status: 'pending' | 'classifying' | 'classified' | 'error';
  suggestions?: PhotoClassificationSuggestion[];
  detectedComponents?: DetectedBuildingComponentType[];
  assignedSlot?: string;
  error?: string;
}

// Re-export DetectedBuildingComponent type for convenience
export type { DetectedBuildingComponent } from '../services/photoClassification';

// =================================================================
// WIZARD STATE
// =================================================================

export interface WizardState {
  // Template & Property
  template: string | null;
  propertyType: string | null;
  propertySubtype: string | null;

  // M&S Classification (3-tier hierarchy)
  msOccupancyCode: string | null;

  // Property Components (Mixed-Use Architecture)
  // Replaces single propertyType with component-based model
  propertyComponents: PropertyComponent[];
  activeComponentId: string | null;

  // Multiple Income Approach Instances
  incomeApproachInstances: IncomeApproachInstance[];

  // Reconciliation data per scenario (component-aware)
  scenarioReconciliations: ScenarioReconciliationSummary[];

  // Scenarios
  scenarios: AppraisalScenario[];
  activeScenarioId: number;

  // Subject Property Data (centralized)
  subjectData: SubjectData;

  // Improvements
  improvementsInventory: ImprovementsInventory;

  // Site Improvements (M&S Section 66)
  siteImprovements: SiteImprovement[];

  // Cost Approach Building Selections (per scenario)
  costApproachBuildingSelections: Record<number, string[]>;

  // Cost Approach Building Cost Overrides (per scenario, per building)
  // Stores user modifications to cost data without modifying source building inventory
  costApproachBuildingCostData: Record<number, Record<string, CostApproachOverrides>>;

  // Extracted Document Data
  extractedData: Record<string, ExtractedData>;
  uploadedDocuments: UploadedDocument[];

  // Document Field Source Tracking
  documentFieldSources: Record<string, ExtractedFieldSource>;

  // Field Suggestions (Accept/Reject UI) - supports multiple values per field
  fieldSuggestions: Record<string, FieldSuggestion[]>;
  acceptedFields: Record<string, FieldSuggestionSource>;

  // Owners
  owners: Owner[];

  // Income Approach Data
  incomeApproachData: import('../features/income-approach/types').IncomeApproachState | null;

  // Analysis Approach Conclusions (for progress tracking)
  analysisConclusions: AnalysisConclusions;

  // Reconciliation Data
  reconciliationData: ReconciliationData | null;

  // Photo Staging (for bulk upload)
  stagingPhotos: StagingPhoto[];

  // Cover Photo (for report title page)
  coverPhoto?: CoverPhotoData;

  // CBRE Parity - Enhanced Data Fields (Plan Part 9)
  demographicsData?: DemographicsData;
  economicIndicators?: EconomicIndicators;
  economicChartStyle?: 'gradient' | 'glass' | 'horizon' | 'pulse' | 'diverging';
  swotAnalysis?: SWOTAnalysisData;
  riskRating?: RiskRatingData;
  marketAnalysis?: MarketAnalysisData;
  incomeApproach?: {
    capRate?: number;
    noi?: number;
    occupancy?: number;
  };

  // Sales Comparison, Land Valuation, Photos, HBU - Data Flow Connections
  salesComparisonData?: SalesComparisonData;
  salesComparisonDataByComponent?: SalesComparisonDataByComponent;
  landValuationData?: LandValuationData;
  reportPhotos?: ReportPhotosData;
  hbuAnalysis?: HBUAnalysis;

  // Maps - Subject property maps and approach comparable maps
  subjectMaps: MapData[];
  approachMaps: Record<string, MapData>; // Key: approach type (improved-sales, land-sales, rental-comps)

  // Navigation
  currentPage: string;
  subjectActiveTab: string;
  isFullscreen: boolean;

  // Progress Tracking
  pageTabs: Record<string, PageTabState>;
  sectionCompletedAt: Record<string, string | null>;
  scenarioCompletions: ScenarioCompletionState[];
  allScenariosCompletedAt: string | null;
  celebration: CelebrationState;

  // Metadata
  lastModified: string;
}

export type WizardAction =
  | { type: 'SET_TEMPLATE'; payload: string }
  | { type: 'SET_PROPERTY_TYPE'; payload: { type: string; subtype?: string } }
  | { type: 'SET_MS_OCCUPANCY_CODE'; payload: string | null }
  | { type: 'ADD_SCENARIO'; payload: AppraisalScenario }
  | { type: 'REMOVE_SCENARIO'; payload: number }
  | { type: 'UPDATE_SCENARIO'; payload: Partial<AppraisalScenario> & { id: number } }
  | { type: 'SET_ACTIVE_SCENARIO'; payload: number }
  | { type: 'SET_SCENARIOS'; payload: AppraisalScenario[] }
  | { type: 'SET_IMPROVEMENTS_INVENTORY'; payload: ImprovementsInventory }
  | { type: 'SET_SITE_IMPROVEMENTS'; payload: SiteImprovement[] }
  | { type: 'SET_COST_APPROACH_BUILDING_SELECTIONS'; payload: { scenarioId: number; buildingIds: string[] } }
  | { type: 'SET_COST_APPROACH_BUILDING_COST_DATA'; payload: { scenarioId: number; buildingId: string; overrides: CostApproachOverrides | null } }
  | { type: 'SET_EXTRACTED_DATA'; payload: { slotId: string; data: ExtractedData } }
  | { type: 'SET_ALL_EXTRACTED_DATA'; payload: Record<string, ExtractedData> }
  | { type: 'ADD_UPLOADED_DOCUMENT'; payload: UploadedDocument }
  | { type: 'UPDATE_UPLOADED_DOCUMENT'; payload: { id: string; updates: Partial<UploadedDocument> } }
  | { type: 'REMOVE_UPLOADED_DOCUMENT'; payload: string }
  | { type: 'SET_DOCUMENT_FIELD_SOURCE'; payload: ExtractedFieldSource }
  | { type: 'CLEAR_DOCUMENT_FIELD_SOURCES' }
  | { type: 'APPLY_DOCUMENT_EXTRACTED_DATA'; payload: { documentId: string; documentName: string; documentType: string; fields: Record<string, { value: string; confidence: number }> } }
  | { type: 'ADD_OWNER'; payload: Owner }
  | { type: 'UPDATE_OWNER'; payload: { id: string; updates: Partial<Owner> } }
  | { type: 'REMOVE_OWNER'; payload: string }
  | { type: 'SET_OWNERS'; payload: Owner[] }
  | { type: 'SET_SUBJECT_DATA'; payload: Partial<SubjectData> }
  | { type: 'SET_INCOME_APPROACH_DATA'; payload: import('../features/income-approach/types').IncomeApproachState }
  | { type: 'SET_APPROACH_CONCLUSION'; payload: ApproachConclusion }
  | { type: 'SET_RECONCILIATION_DATA'; payload: ReconciliationData }
  | { type: 'SET_CURRENT_PAGE'; payload: string }
  | { type: 'SET_SUBJECT_TAB'; payload: string }
  | { type: 'TOGGLE_FULLSCREEN' }
  // Progress Tracking Actions
  | { type: 'SET_PAGE_TAB'; payload: { page: string; tab: string } }
  | { type: 'MARK_SECTION_COMPLETE'; payload: { sectionId: string } }
  | { type: 'MARK_SCENARIO_COMPLETE'; payload: { scenarioId: number } }
  | { type: 'UPDATE_SCENARIO_APPROACH'; payload: { scenarioId: number; approach: string; isComplete: boolean } }
  | { type: 'MARK_ALL_SCENARIOS_COMPLETE' }
  | { type: 'SHOW_CELEBRATION'; payload: { sectionId: string; scenarioId?: number; level: CelebrationState['level'] } }
  | { type: 'HIDE_CELEBRATION' }
  | { type: 'APPLY_PREVIEW_EDITS'; payload: PreviewEditsPayload }
  // Staging Photos Actions
  | { type: 'ADD_STAGING_PHOTOS'; payload: StagingPhoto[] }
  | { type: 'UPDATE_STAGING_PHOTO'; payload: { id: string; updates: Partial<StagingPhoto> } }
  | { type: 'REMOVE_STAGING_PHOTO'; payload: string }
  | { type: 'CLEAR_STAGING_PHOTOS' }
  | { type: 'ASSIGN_STAGING_PHOTO'; payload: { photoId: string; slotId: string } }
  // Cover Photo Actions
  | { type: 'SET_COVER_PHOTO'; payload: CoverPhotoData }
  | { type: 'REMOVE_COVER_PHOTO' }
  // CBRE Parity Data Actions
  | { type: 'SET_DEMOGRAPHICS_DATA'; payload: DemographicsData }
  | { type: 'SET_ECONOMIC_INDICATORS'; payload: EconomicIndicators }
  | { type: 'SET_ECONOMIC_CHART_STYLE'; payload: 'gradient' | 'glass' | 'horizon' | 'pulse' | 'diverging' }
  | { type: 'SET_SWOT_ANALYSIS'; payload: SWOTAnalysisData }
  | { type: 'SET_RISK_RATING'; payload: RiskRatingData }
  // Sales Comparison, Land Valuation, Photos, HBU, Market Analysis Actions
  | { type: 'SET_SALES_COMPARISON_DATA'; payload: SalesComparisonData }
  | { type: 'SET_SALES_COMPARISON_DATA_FOR_COMPONENT'; payload: { componentId: string; scenarioId: number; data: SalesComparisonData } }
  | { type: 'SET_LAND_VALUATION_DATA'; payload: LandValuationData }
  | { type: 'SET_REPORT_PHOTOS'; payload: ReportPhotosData }
  | { type: 'SET_HBU_ANALYSIS'; payload: HBUAnalysis }
  | { type: 'SET_MARKET_ANALYSIS'; payload: MarketAnalysisData }
  // Field Suggestion Actions - supports multiple suggestions per field
  | { type: 'ADD_FIELD_SUGGESTION'; payload: { fieldPath: string; suggestion: FieldSuggestion } }
  | { type: 'ACCEPT_FIELD_SUGGESTION'; payload: { fieldPath: string; value: string; suggestionId?: string } }
  | { type: 'REJECT_FIELD_SUGGESTION'; payload: { fieldPath: string; suggestionId?: string } }
  | { type: 'CLEAR_FIELD_SUGGESTIONS' }
  // Map Actions
  | { type: 'SET_SUBJECT_MAPS'; payload: MapData[] }
  | { type: 'ADD_SUBJECT_MAP'; payload: MapData }
  | { type: 'UPDATE_SUBJECT_MAP'; payload: { id: string; updates: Partial<MapData> } }
  | { type: 'REMOVE_SUBJECT_MAP'; payload: string }
  | { type: 'SET_APPROACH_MAP'; payload: { approachType: string; map: MapData } }
  | { type: 'REMOVE_APPROACH_MAP'; payload: string }
  // Property Component Actions (Mixed-Use Architecture)
  | { type: 'ADD_PROPERTY_COMPONENT'; payload: PropertyComponent }
  | { type: 'UPDATE_PROPERTY_COMPONENT'; payload: { id: string; updates: Partial<PropertyComponent> } }
  | { type: 'REMOVE_PROPERTY_COMPONENT'; payload: string }
  | { type: 'REORDER_PROPERTY_COMPONENTS'; payload: string[] }
  | { type: 'SET_ACTIVE_COMPONENT'; payload: string | null }
  // Income Instance Actions
  | { type: 'ADD_INCOME_APPROACH_INSTANCE'; payload: IncomeApproachInstance }
  | { type: 'UPDATE_INCOME_APPROACH_INSTANCE'; payload: { id: string; updates: Partial<IncomeApproachInstance> } }
  | { type: 'REMOVE_INCOME_APPROACH_INSTANCE'; payload: string }
  // Income Line to Rent Comp Linking
  | { type: 'LINK_RENT_COMP_TO_INCOME_LINE'; payload: { instanceId: string; lineId: string; rentCompId: string } }
  | { type: 'UNLINK_RENT_COMP_FROM_INCOME_LINE'; payload: { instanceId: string; lineId: string; rentCompId: string } }
  // Component Reconciliation Actions
  | { type: 'UPDATE_COMPONENT_RECONCILIATION'; payload: { scenarioId: number; reconciliation: ComponentReconciliation } }
  | { type: 'RECALCULATE_SCENARIO_TOTALS'; payload: number }  // scenarioId
  | { type: 'RESET' };

// =================================================================
// PREVIEW EDITS TYPES
// =================================================================

export interface PreviewEditsPayload {
  editedFields: Record<string, { path: string; editedValue: unknown }>;
  sectionVisibility: Record<string, boolean>;
  customContent: Record<string, unknown>;
  styling: Record<string, React.CSSProperties>;
}

// =================================================================
// VALIDATION TYPES
// =================================================================

export interface ValidationIssue {
  code: string;
  message: string;
  severity: 'error' | 'warning';
  path?: string;
}

export interface ValidationResult {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  isValid: boolean;
}

// =================================================================
// ROLLUP TYPES
// =================================================================

export interface ImprovementsRollups {
  totalSF: number;
  sfByType: Record<string, number>;
  subjectTotals: {
    parcels: number;
    buildings: number;
    areas: number;
  };
}

// =================================================================
// OPTION CONSTANTS
// =================================================================

export const CONSTRUCTION_TYPES = [
  'Wood Frame',
  'Masonry/Block',
  'Steel Frame',
  'Concrete Tilt-Up',
  'Pre-Engineered Metal',
  'Reinforced Concrete',
  'Structural Steel',
  'Mixed/Hybrid',
];

/**
 * Marshall & Swift Construction Classes
 * Based on the M&S cost classification system for commercial buildings.
 */
export interface ConstructionClass {
  value: 'A' | 'B' | 'C' | 'D' | 'S';
  label: string;
  description: string;
  iconName: 'Building2' | 'Building' | 'Warehouse' | 'TreePine' | 'Factory';
}

export const CONSTRUCTION_CLASSES: ConstructionClass[] = [
  { value: 'A', label: 'Class A', description: 'Steel Frame (Fireproof)', iconName: 'Building2' },
  { value: 'B', label: 'Class B', description: 'Reinforced Concrete', iconName: 'Building' },
  { value: 'C', label: 'Class C', description: 'Masonry Bearing Walls', iconName: 'Warehouse' },
  { value: 'D', label: 'Class D', description: 'Wood Frame', iconName: 'TreePine' },
  { value: 'S', label: 'Class S', description: 'Pre-Engineered Metal', iconName: 'Factory' },
];

export const CONSTRUCTION_QUALITY = [
  'Class A - Excellent',
  'Class B - Good',
  'Class C - Average',
  'Class D - Fair',
  'Class E - Poor',
];

export const CONDITIONS = [
  'Excellent',
  'Good',
  'Average',
  'Fair',
  'Poor',
];

export const FOUNDATION_OPTIONS = [
  'Concrete Slab on Grade',
  'Raised Concrete',
  'Pier & Beam',
  'Full Basement',
  'Partial Basement',
  'Crawl Space',
];

export const ROOF_OPTIONS = [
  'Built-Up (BUR)',
  'TPO Membrane',
  'EPDM Membrane',
  'Standing Seam Metal',
  'Corrugated Metal',
  'Asphalt Shingle',
  'Modified Bitumen',
  'PVC Membrane',
];

export const EXTERIOR_WALL_OPTIONS = [
  'Concrete Tilt-Up',
  'Masonry/CMU',
  'Brick Veneer',
  'Metal Panel',
  'Glass Curtain Wall',
  'EIFS/Stucco',
  'Precast Concrete',
  'Wood Siding',
];

export const WINDOW_OPTIONS = [
  'Single Pane',
  'Double Pane Insulated',
  'Storefront System',
  'Curtain Wall',
  'Minimal/None',
  'Clerestory',
];

export const CEILING_OPTIONS = [
  'Drop Ceiling (ACT)',
  'Exposed Structure',
  'Drywall/Painted',
  'Open to Deck',
  'Suspended Grid',
  'Wood Beam',
];

export const FLOORING_OPTIONS = [
  'Concrete - Sealed',
  'Concrete - Polished',
  'Carpet',
  'VCT/LVT',
  'Ceramic Tile',
  'Epoxy Coating',
  'Hardwood',
  'Rubber/Mat',
];

export const INTERIOR_WALL_OPTIONS = [
  'Drywall - Painted',
  'CMU Block',
  'Glass Partition',
  'Metal Panel',
  'Wood Panel',
  'None (Open)',
];

export const ELECTRICAL_OPTIONS = [
  '100 Amp',
  '200 Amp',
  '400 Amp',
  '600 Amp',
  '800 Amp',
  '1000+ Amp',
  '3-Phase 480V',
  '3-Phase 208V',
];

export const HVAC_OPTIONS = [
  'Central HVAC',
  'Rooftop Units (RTU)',
  'Split System',
  'Radiant Heat',
  'Forced Air',
  'Infrared Heaters',
  'Make-Up Air',
  'Evaporative Cooling',
  'None',
];

export const SPRINKLER_OPTIONS = [
  'Wet System',
  'Dry System',
  'ESFR (High-Pile)',
  'Pre-Action',
  'Deluge',
  'None',
];

export const ELEVATOR_OPTIONS = [
  'Passenger - Hydraulic',
  'Passenger - Traction',
  'Freight - Hydraulic',
  'Freight - Traction',
  'Dock Leveler',
  'None',
];

// =================================================================
// REPORT PREVIEW & GENERATION TYPES
// =================================================================

/** Photo categories for organizing property images in the report */
export type PhotoCategory = 'exterior' | 'interior' | 'site' | 'aerial' | 'street' | 'neighborhood' | 'comparable';

/** Position options for photos within a page */
export type PhotoPosition = 'full' | 'half-top' | 'half-bottom' | 'quarter' | 'sixth';

/** Report Photo - represents a single photo in the report */
export interface ReportPhoto {
  id: string;
  url: string;
  caption: string;
  category: PhotoCategory;
  takenBy?: string;
  takenDate?: string;
  sortOrder: number;
  pagePosition?: PhotoPosition;
}

/** Report Section Configuration - controls visibility and behavior of report sections */
export interface ReportSectionConfig {
  id: string;
  enabled: boolean;
  pageBreakBefore: boolean;
  customContent?: string; // For AI-drafted or manual narratives
}

/** Addenda item types for the appendix section */
export type AddendaType =
  | 'aerial_photo'
  | 'property_photos'
  | 'plat_map'
  | 'tax_detail'
  | 'buy_sell_agreement'
  | 'land_sales_map'
  | 'improved_sales_map'
  | 'rental_comps_map'
  | 'engagement_letter'
  | 'license_copy'
  | 'comp_detail'
  | 'flood_map'
  | 'zoning_map'
  | 'custom';

/** Addenda Item - represents an item in the addenda/exhibits section */
export interface AddendaItem {
  id: string;
  type: AddendaType;
  title: string;
  enabled: boolean;
  sortOrder: number;
  content?: string | ReportPhoto[];
}

/** Report styling options */
export interface ReportStyling {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  headerStyle: 'traditional' | 'modern' | 'minimal';
  showPageNumbers: boolean;
  showFooterDate: boolean;
  logoUrl?: string;
}

/** Full report configuration */
export interface ReportConfig {
  sections: ReportSectionConfig[];
  photos: ReportPhoto[];
  addenda: AddendaItem[];
  styling: ReportStyling;
}

/** Page layout types for different report pages */
export type PageLayout =
  | 'cover'           // Full bleed image with title overlay
  | 'letter'          // Letterhead format with signature line
  | 'toc'             // Table of contents with page numbers
  | 'summary-table'   // Two-column key-value layout
  | 'narrative'       // Text-heavy with optional image
  | 'analysis-grid'   // Comparison grid (for comps)
  | 'photo-grid-6'    // 6 photos per page (2x3)
  | 'photo-grid-4'    // 4 photos per page (2x2)
  | 'photo-single'    // Single full-page photo
  | 'map-page'        // Map with legend
  | 'document'        // Scanned document display
  | 'addenda-header'  // Section divider page
  // CBRE Parity - New layouts
  | 'risk-rating'     // Investment Risk Rating page
  | 'demographics'    // Neighborhood Demographics page (legacy single-page)
  | 'demographics-overview' // Demographics overview with large map + highlights
  | 'demographics-detail'   // Demographics detail with data tables
  | 'economic-context' // Economic Context with charts
  | 'swot';           // SWOT Analysis page

// =================================================================
// PAGE LAYOUT & SPACING TYPES
// =================================================================

/** Page layout dimensions in points (72 points = 1 inch) */
export interface PageDimensions {
  width: number;   // 612 = 8.5 inches
  height: number;  // 792 = 11 inches
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  contentArea: {
    width: number;
    height: number;
  };
}

/** Spacing rules between elements */
export interface SpacingRules {
  minSpacing: {
    betweenParagraphs: number;
    afterHeading: number;
    beforeHeading: number;
    betweenTableRows: number;
    betweenPhotos: number;
    photoCaptionGap: number;
    sectionDivider: number;
  };
  maxLengths: {
    paragraphBeforeBreak: number;
    tableRowsPerPage: number;
    photosPerPage: number;
  };
}

/** Section boundary configuration */
export interface SectionBoundary {
  beforeSection: {
    pageBreakRequired: boolean;
    minSpaceRequired: number;
    insertSectionHeader: boolean;
  };
  afterSection: {
    preventOrphanContent: boolean;
    minContentOnPage: number;
  };
}

// =================================================================
// CONTENT BLOCK TYPES
// =================================================================

/** Types of content blocks in the report */
export type ContentBlockType = 'heading' | 'paragraph' | 'table' | 'image' | 'photo-grid' | 'list' | 'chart' | 'risk-rating' | 'demographics' | 'demographics-overview' | 'demographics-detail' | 'economic' | 'swot';

/** Content block for report sections */
export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content: unknown;
  canSplit: boolean;
  keepWithNext: boolean;
  keepWithPrevious: boolean;
  minLinesIfSplit: number;
}

/** Report section containing blocks */
export interface ReportSection {
  id: string;
  title: string;
  type: 'required' | 'optional' | 'conditional';
  startsOnNewPage: boolean;
  blocks: ContentBlock[];
  minPageBreakBefore: number;
}

/** A single page in the report */
export interface ReportPage {
  id: string;
  pageNumber: number;
  layout: PageLayout;
  sectionId?: string;
  title?: string;
  content: ContentBlock[];
  photos?: ReportPhoto[];
  showAttribution?: boolean;
  coverPhoto?: ReportPhoto; // Hero photo for cover page
}

// =================================================================
// PHOTO MANAGEMENT TYPES
// =================================================================

/** Cover photo data for the report title page */
export interface CoverPhotoData {
  id: string;
  file?: File;
  preview: string; // Base64 or object URL for display
  sourceSlotId?: string; // If selected from an existing uploaded photo
  caption?: string;
}

/** Photo upload slot configuration */
export interface PhotoUploadSlot {
  id: string;
  category: PhotoCategory;
  label: string;
  required: boolean;
  minCount: number;
  maxCount: number;
}

/** Photo grid layout type */
export type PhotoGridLayoutType = 'grid-6' | 'grid-4' | 'grid-2' | 'single';

/** Photo grid layout configuration */
export interface PhotoGridLayout {
  type: PhotoGridLayoutType;
  photos: ReportPhoto[];
  pageTitle?: string;
  showAttribution?: boolean;
}

// =================================================================
// EDITOR STATE TYPES
// =================================================================

/** Editor modes */
export type EditorMode = 'view' | 'select' | 'text-edit' | 'layout' | 'add-block';

/** Selected element in the editor */
export interface SelectedElement {
  id: string;
  type: 'text' | 'image' | 'table' | 'section' | 'page';
  bounds: { x: number; y: number; width: number; height: number };
  isLocked: boolean;
  parentId?: string;
}

/** Inline editor state */
export interface InlineEditorState {
  isActive: boolean;
  elementId: string;
  content: string;
  cursorPosition: number;
  selection: { start: number; end: number } | null;
}

/** Editor history for undo/redo */
export interface EditorHistory {
  past: EditorState[];
  present: EditorState;
  future: EditorState[];
  maxHistoryLength: number;
}

/** Preview edit tracking */
export interface PreviewEdit {
  id: string;
  timestamp: string;
  type: 'content' | 'styling' | 'structure';
  targetId: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  source: 'preview-editor' | 'wizard';
}

/** Report version for history */
export interface ReportVersion {
  version: number;
  savedAt: string;
  savedBy: string;
  note?: string;
  snapshotId: string;
}

/** Full editor state */
export interface EditorState {
  mode: EditorMode;
  selectedElement: SelectedElement | null;
  inlineEditor: InlineEditorState | null;
  zoom: number;
  currentPage: number;
  showGrid: boolean;
  showSpacingGuides: boolean;
}

/** Report state with edit tracking */
export interface ReportState {
  wizardData: WizardState;
  previewEdits: PreviewEdit[];
  isDirty: boolean;
  lastSavedAt: string | null;
  lastAutoSaveAt: string | null;
  version: number;
  previousVersions: ReportVersion[];
}

// =================================================================
// LAYOUT VALIDATION TYPES
// =================================================================

/** Layout issue severity */
export type LayoutIssueSeverity = 'error' | 'warning' | 'info';

/** Layout issue types */
export type LayoutIssueType =
  | 'overflow'
  | 'orphan'
  | 'widow'
  | 'collision'
  | 'margin-violation'
  | 'unbalanced'
  | 'empty-page';

/** Layout validation issue */
export interface LayoutIssue {
  severity: LayoutIssueSeverity;
  pageNumber: number;
  elementId: string;
  type: LayoutIssueType;
  message: string;
  autoFixAvailable: boolean;
  autoFix?: () => void;
}

/** Overflow handling result */
export interface OverflowResult {
  action: 'split' | 'move-to-next' | 'shrink-font' | 'warn';
  splitPoint?: number;
  newFontSize?: number;
  warningMessage?: string;
}

// =================================================================
// TEMPLATE SYSTEM TYPES
// =================================================================

/** Scenario template for templates */
export interface ScenarioTemplate {
  name: string;
  approaches: string[];
  isRequired: boolean;
}

/** Custom field definition in templates */
export interface CustomFieldDefinition {
  id: string;
  sectionId: string;
  fieldType: 'text' | 'number' | 'select' | 'checkbox' | 'date';
  label: string;
  placeholder?: string;
  options?: string[];
  defaultValue?: unknown;
  required: boolean;
  sortOrder: number;
}

/** Photo requirement for templates */
export interface PhotoRequirement {
  category: string;
  minCount: number;
  maxCount: number;
  required: boolean;
  suggestedCaptions: string[];
}

/** Full appraisal template */
export interface AppraisalTemplate {
  // Metadata
  id: string;
  name: string;
  description: string;
  useCase: string;
  propertyTypes: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  tags: string[];

  // Template Configuration
  config: {
    defaultPropertyType: string | null;
    defaultPropertySubtype: string | null;
    defaultScenarios: ScenarioTemplate[];
    sectionOverrides: Record<string, boolean>;
    customFields: CustomFieldDefinition[];
    styling: ReportStyling;
    contentTemplates: Record<string, string>;
    photoRequirements: PhotoRequirement[];
    addendaConfig: AddendaItem[];
  };

  // Usage stats
  timesUsed: number;
  lastUsed: string | null;
}

// =================================================================
// AUTO-SAVE TYPES
// =================================================================

/** Auto-save configuration */
export interface AutoSaveConfig {
  enabled: boolean;
  intervalMs: number;
  saveOnBlur: boolean;
  saveBeforeNavigate: boolean;
  maxAutoSaveVersions: number;
}

// =================================================================
// MAP TYPES
// =================================================================

/**
 * Type of map for appraisal reports.
 * Used to categorize maps for display and report placement.
 */
export type MapType =
  | 'aerial'           // Satellite/aerial view of subject
  | 'location'         // Subject location in broader context
  | 'vicinity'         // Neighborhood/vicinity map
  | 'parcel'           // Parcel boundaries
  | 'plat'             // Official plat/survey map
  | 'site'             // Site map with details
  | 'flood'            // FEMA flood zone map
  | 'zoning'           // Zoning classification map
  | 'land-sales'       // Land comparable sales locations
  | 'improved-sales'   // Improved sales comparable locations
  | 'rental-comps'     // Rental comparable locations
  | 'area'             // Regional/area map
  | 'surrounding-area' // Surrounding area with boundaries
  | 'demographics';    // Demographics radius ring map

/**
 * Marker type for map pins.
 * Determines styling and legend display.
 */
export type MapMarkerType =
  | 'subject'       // The subject property (red)
  | 'improved-sale' // Improved sales comparable (blue)
  | 'land-sale'     // Land sales comparable (orange)
  | 'rental'        // Rental comparable (green)
  | 'landmark';     // Reference landmark (gray)

/**
 * Individual marker on a map.
 * Used for subject property and comparables.
 */
export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  type: MapMarkerType;
  color: string;
  number?: number;        // For numbered comp labels (1, 2, 3...)
  address?: string;       // Full address for tooltip
  details?: string;       // Additional details (e.g., sale price)
}

/**
 * Annotation on a map (labels, arrows, callouts).
 */
/**
 * Style configuration for map annotations.
 * Uses Harken-blue (#0da1c7) as default color scheme.
 */
export interface MapAnnotationStyle {
  backgroundColor?: string;     // Default: harken-blue (#0da1c7)
  textColor?: string;           // Default: white
  lineColor?: string;           // Default: harken-blue (#0da1c7)
  lineWidth?: number;           // Default: 2
  fontSize?: 'sm' | 'md' | 'lg'; // Default: 'md'
}

/**
 * Annotation on a map (labels, arrows, callouts, boundaries).
 * Enhanced to support callouts with separate anchor and label positions,
 * and polygon/line shapes for boundary drawing.
 */
export interface MapAnnotation {
  id: string;
  type: 'label' | 'boundary' | 'arrow' | 'callout' | 'rectangle' | 'polygon' | 'line';
  content?: string;                                    // Text content for labels/callouts
  position: { lat: number; lng: number };              // Anchor point (arrow tip for callouts)
  labelPosition?: { lat: number; lng: number };        // Position of label box (for callouts)
  coordinates?: Array<{ lat: number; lng: number }>;   // Points for lines/polygons/boundaries
  style?: MapAnnotationStyle;
}

/**
 * GeoJSON feature for boundaries and shapes.
 */
export interface GeoJsonFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'LineString' | 'Point';
    coordinates: number[][] | number[][][] | number[];
  };
  properties: Record<string, unknown>;
}

/**
 * Complete map data structure.
 * Used for all map types in the wizard.
 */
export interface MapData {
  id: string;
  type: MapType;
  title: string;
  description?: string;

  // Source configuration
  source: 'generated' | 'uploaded' | 'drawn';

  // Location data
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;

  // Map styling
  mapType: 'satellite' | 'roadmap' | 'hybrid';

  // Generated image (for PDF export)
  imageUrl?: string;      // Static map URL or uploaded image
  imageData?: string;     // Base64 for embedded

  // Boundaries/Annotations
  boundaries?: GeoJsonFeature[];
  annotations?: MapAnnotation[];

  // Markers (for comparable maps)
  markers: MapMarker[];

  // Metadata
  capturedAt?: string;
  capturedBy?: string;

  // Report placement
  reportSections: string[];
}

/**
 * Configuration for generating a comparable map.
 * Passed to the map generation service.
 */
export interface ComparableMapConfig {
  subject: {
    lat: number;
    lng: number;
    address: string;
    propertyName?: string;
  };
  comparables: Array<{
    id: string;
    lat: number;
    lng: number;
    address: string;
    label: string;          // e.g., "Comp 1"
    details?: string;       // e.g., "$450,000"
  }>;
  mapType: 'satellite' | 'roadmap' | 'hybrid';
  type: 'improved-sales' | 'land-sales' | 'rental-comps';
  title?: string;
}

/**
 * Result of calculating bounds for markers.
 * Used for auto-zoom functionality.
 */
export interface MapBoundsResult {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

/**
 * Map generation options for the service.
 */
export interface MapGenerationOptions {
  lat: number;
  lng: number;
  type: MapType;
  zoom?: number;
  size?: { width: number; height: number };
  markers?: MapMarker[];
  boundaries?: GeoJsonFeature[];
  mapStyle?: 'satellite' | 'roadmap' | 'hybrid';
}

// =================================================================
// TABLE OF CONTENTS TYPES
// =================================================================

/** TOC entry */
export interface TOCEntry {
  id: string;
  title: string;
  pageNumber: number;
  level: number;
  children?: TOCEntry[];
}

/** TOC configuration */
export interface TOCConfig {
  entries: TOCEntry[];
  showPageNumbers: boolean;
  maxDepth: number;
}
