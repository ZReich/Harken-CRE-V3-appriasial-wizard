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
  foundation?: string;
  roof?: string;
  walls?: string;
  windows?: string;
  description?: string;
}

export interface InteriorFeatures {
  ceilings?: string;
  flooring?: string;
  walls?: string;
  description?: string;
}

export interface MechanicalSystems {
  electrical?: string;
  heating?: string;
  cooling?: string;
  sprinkler?: string;
  elevators?: string;
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

export interface WizardState {
  // Template & Property
  template: string | null;
  propertyType: string | null;
  propertySubtype: string | null;
  
  // Scenarios
  scenarios: AppraisalScenario[];
  activeScenarioId: number;
  
  // Improvements
  improvementsInventory: ImprovementsInventory;
  
  // Navigation
  currentPage: string;
  subjectActiveTab: string;
  isFullscreen: boolean;
  
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
  | { type: 'SET_IMPROVEMENTS_INVENTORY'; payload: ImprovementsInventory }
  | { type: 'SET_CURRENT_PAGE'; payload: string }
  | { type: 'SET_SUBJECT_TAB'; payload: string }
  | { type: 'TOGGLE_FULLSCREEN' }
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
