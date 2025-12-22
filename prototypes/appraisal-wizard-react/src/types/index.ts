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
  utilities: string;
  floodZone: string;
  environmental: string;
  easements: string;
  zoningClass: string;
  zoningDescription: string;
  zoningConforming: boolean;
  
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
}

// =================================================================
// WIZARD STATE
// =================================================================

export interface WizardState {
  // Template & Property
  template: string | null;
  propertyType: string | null;
  propertySubtype: string | null;
  
  // Scenarios
  scenarios: AppraisalScenario[];
  activeScenarioId: number;
  
  // Subject Property Data (centralized)
  subjectData: SubjectData;
  
  // Improvements
  improvementsInventory: ImprovementsInventory;
  
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
  | { type: 'ADD_SCENARIO'; payload: AppraisalScenario }
  | { type: 'REMOVE_SCENARIO'; payload: number }
  | { type: 'UPDATE_SCENARIO'; payload: Partial<AppraisalScenario> & { id: number } }
  | { type: 'SET_ACTIVE_SCENARIO'; payload: number }
  | { type: 'SET_SCENARIOS'; payload: AppraisalScenario[] }
  | { type: 'SET_IMPROVEMENTS_INVENTORY'; payload: ImprovementsInventory }
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
  | { type: 'RESET' };

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
