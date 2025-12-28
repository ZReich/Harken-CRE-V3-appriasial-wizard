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

export interface ExteriorFeatures {
  foundation?: string[];
  roof?: string[];
  walls?: string[];
  windows?: string[];
  description?: string;
}

export interface InteriorFeatures {
  ceilings?: string[];
  flooring?: string[];
  walls?: string[];
  description?: string;
}

export interface MechanicalSystems {
  electrical?: string[];
  heating?: string[];
  cooling?: string[];
  sprinkler?: string[];
  elevators?: string[];
  description?: string;
}

export interface ImprovementArea {
  id: string;
  type: 'office' | 'warehouse' | 'retail' | 'apartment' | 'flex' | 'industrial' | 'manufacturing' | 'storage' | 'mezzanine' | 'other';
  customType?: string;
  squareFootage: number | null;
  sfType: 'GBA' | 'NRA' | 'GLA' | 'RSF';
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
}

export interface SiteImprovementsInventory {
  schemaVersion: number;
  improvements: SiteImprovement[];
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

export interface ReconciliationData {
  scenarioReconciliations: ScenarioReconciliation[];
  exposurePeriod: number | null;
  marketingTime: number | null;
  exposureRationale: string;
  certifications: string[]; // IDs of selected certifications
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
  sewerType: string;
  electricProvider: string;
  naturalGas: string;
  telecom: string;
  
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
  federalFundsRate: { current: number; projected1Y?: number };
  treasury10Y: { current: number; projected1Y?: number };
  inflation: { current: number; trend: 'rising' | 'stable' | 'falling' };
  gdpGrowth: { current: number; trend: 'accelerating' | 'stable' | 'slowing' };
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
  assignedSlot?: string;
  error?: string;
}

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
  landValuationData?: LandValuationData;
  reportPhotos?: ReportPhotosData;
  hbuAnalysis?: HBUAnalysis;
  
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
  | { type: 'SET_SWOT_ANALYSIS'; payload: SWOTAnalysisData }
  | { type: 'SET_RISK_RATING'; payload: RiskRatingData }
  // Sales Comparison, Land Valuation, Photos, HBU, Market Analysis Actions
  | { type: 'SET_SALES_COMPARISON_DATA'; payload: SalesComparisonData }
  | { type: 'SET_LAND_VALUATION_DATA'; payload: LandValuationData }
  | { type: 'SET_REPORT_PHOTOS'; payload: ReportPhotosData }
  | { type: 'SET_HBU_ANALYSIS'; payload: HBUAnalysis }
  | { type: 'SET_MARKET_ANALYSIS'; payload: MarketAnalysisData }
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
  | 'demographics'    // Neighborhood Demographics page
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
export type ContentBlockType = 'heading' | 'paragraph' | 'table' | 'image' | 'photo-grid' | 'list' | 'chart' | 'risk-rating' | 'demographics' | 'economic' | 'swot';

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
