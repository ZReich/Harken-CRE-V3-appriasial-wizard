/**
 * Cost Segregation Constants
 * 
 * IRS depreciation class mappings, MACRS rates, and component classifications.
 * Based on IRS Revenue Procedure 87-56 and Treasury Decision 9636.
 */

import type { 
  DepreciationClass, 
  ComponentCategory,
  BuildingSystemType,
  ComponentAllocation,
  OccupancyAllocation 
} from './types';

// =================================================================
// DEPRECIATION CLASS CONFIGURATION
// =================================================================

export interface DepreciationClassConfig {
  id: DepreciationClass;
  label: string;
  years: number;
  irsReference: string;
  category: ComponentCategory;
  eligibleForBonus: boolean;
  description: string;
}

export const DEPRECIATION_CLASSES: DepreciationClassConfig[] = [
  {
    id: '5-year',
    label: '5-Year Personal Property',
    years: 5,
    irsReference: 'IRC Section 1245',
    category: 'personal-property',
    eligibleForBonus: true,
    description: 'Carpeting, decorative lighting, specialty electrical, specialty plumbing, signage',
  },
  {
    id: '7-year',
    label: '7-Year Personal Property',
    years: 7,
    irsReference: 'IRC Section 1245',
    category: 'personal-property',
    eligibleForBonus: true,
    description: 'Office furniture, fixtures, certain equipment',
  },
  {
    id: '15-year',
    label: '15-Year Land Improvements',
    years: 15,
    irsReference: 'IRC Section 1250',
    category: 'land-improvement',
    eligibleForBonus: true,
    description: 'Parking lots, sidewalks, landscaping, fencing, exterior lighting',
  },
  {
    id: '27.5-year',
    label: '27.5-Year Residential Rental',
    years: 27.5,
    irsReference: 'IRC Section 1250',
    category: 'real-property',
    eligibleForBonus: false,
    description: 'Structural components of residential rental property',
  },
  {
    id: '39-year',
    label: '39-Year Nonresidential Real Property',
    years: 39,
    irsReference: 'IRC Section 1250',
    category: 'real-property',
    eligibleForBonus: false,
    description: 'Structural components of nonresidential property',
  },
];

// =================================================================
// MACRS DEPRECIATION RATES
// =================================================================

/**
 * MACRS Half-Year Convention Rates
 * Source: IRS Publication 946
 */
export const MACRS_RATES: Record<'5-year' | '7-year' | '15-year', number[]> = {
  '5-year': [0.20, 0.32, 0.192, 0.1152, 0.1152, 0.0576],
  '7-year': [0.1429, 0.2449, 0.1749, 0.1249, 0.0893, 0.0892, 0.0893, 0.0446],
  '15-year': [
    0.05, 0.095, 0.0855, 0.077, 0.0693, 0.0623, 0.059, 0.059,
    0.0591, 0.059, 0.0591, 0.059, 0.0591, 0.059, 0.0591, 0.0295,
  ],
};

/**
 * Straight-line rates for real property (mid-month convention)
 */
export const STRAIGHT_LINE_RATES = {
  '27.5-year': 1 / 27.5,
  '39-year': 1 / 39,
};

// =================================================================
// BONUS DEPRECIATION RATES BY YEAR
// =================================================================

export const BONUS_DEPRECIATION_RATES: Record<number, number> = {
  2022: 1.0,    // 100%
  2023: 0.80,   // 80%
  2024: 0.60,   // 60%
  2025: 0.40,   // 40%
  2026: 0.20,   // 20%
  2027: 0.0,    // 0%
};

/**
 * Get bonus depreciation rate for a given year
 */
export function getBonusRate(year: number): number {
  if (year <= 2022) return 1.0;
  if (year >= 2027) return 0.0;
  return BONUS_DEPRECIATION_RATES[year] ?? 0.0;
}

// =================================================================
// DEFAULT TAX RATE
// =================================================================

export const DEFAULT_TAX_RATE = 0.37; // Top marginal rate

// =================================================================
// BUILDING SYSTEM DEFINITIONS (IRS TD 9636)
// =================================================================

export interface BuildingSystemDef {
  id: BuildingSystemType;
  label: string;
  description: string;
  irsReference: string;
}

export const BUILDING_SYSTEMS: BuildingSystemDef[] = [
  {
    id: 'hvac',
    label: 'HVAC',
    description: 'Heating, ventilation, and air conditioning systems',
    irsReference: 'Treas. Reg. §1.263(a)-3(e)(2)(ii)(A)',
  },
  {
    id: 'plumbing',
    label: 'Plumbing',
    description: 'Plumbing systems including pipes, fixtures, and water heaters',
    irsReference: 'Treas. Reg. §1.263(a)-3(e)(2)(ii)(B)',
  },
  {
    id: 'electrical',
    label: 'Electrical',
    description: 'Electrical systems including wiring, outlets, and panels',
    irsReference: 'Treas. Reg. §1.263(a)-3(e)(2)(ii)(C)',
  },
  {
    id: 'elevators-escalators',
    label: 'Elevators & Escalators',
    description: 'Vertical transportation systems',
    irsReference: 'Treas. Reg. §1.263(a)-3(e)(2)(ii)(D)',
  },
  {
    id: 'fire-protection',
    label: 'Fire Protection & Alarm',
    description: 'Fire suppression and alarm systems',
    irsReference: 'Treas. Reg. §1.263(a)-3(e)(2)(ii)(E)',
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Security systems and access control',
    irsReference: 'Treas. Reg. §1.263(a)-3(e)(2)(ii)(F)',
  },
  {
    id: 'gas-distribution',
    label: 'Gas Distribution',
    description: 'Natural gas distribution systems',
    irsReference: 'Treas. Reg. §1.263(a)-3(e)(2)(ii)(G)',
  },
  {
    id: 'building-structure',
    label: 'Building Structure',
    description: 'Structural components including foundation, framing, roof, walls',
    irsReference: 'Treas. Reg. §1.263(a)-3(e)(2)(ii)(H)',
  },
  {
    id: 'other',
    label: 'Other Components',
    description: 'Other building components not classified elsewhere',
    irsReference: 'Treas. Reg. §1.263(a)-3(e)(2)(ii)(I)',
  },
];

// =================================================================
// COMPONENT TO DEPRECIATION CLASS MAPPING
// =================================================================

/**
 * Maps existing component options from types/index.ts to depreciation classes
 * These come from HVAC_OPTIONS, FLOORING_OPTIONS, CEILING_OPTIONS, etc.
 */
export const COMPONENT_DEPRECIATION_MAP: Record<string, {
  class: DepreciationClass;
  category: ComponentCategory;
  irsAssetClass?: string;
  buildingSystem?: BuildingSystemType;
}> = {
  // === HVAC Options ===
  'Central HVAC': { class: '39-year', category: 'real-property', buildingSystem: 'hvac' },
  'Rooftop Units (RTU)': { class: '39-year', category: 'real-property', buildingSystem: 'hvac' },
  'Split System': { class: '7-year', category: 'personal-property', buildingSystem: 'hvac' },
  'Radiant Heat': { class: '39-year', category: 'real-property', buildingSystem: 'hvac' },
  'Forced Air': { class: '39-year', category: 'real-property', buildingSystem: 'hvac' },
  'Infrared Heaters': { class: '7-year', category: 'personal-property', buildingSystem: 'hvac' },
  'Make-Up Air': { class: '39-year', category: 'real-property', buildingSystem: 'hvac' },
  'Evaporative Cooling': { class: '7-year', category: 'personal-property', buildingSystem: 'hvac' },
  
  // === Flooring Options ===
  'Concrete - Sealed': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Concrete - Polished': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Carpet': { class: '5-year', category: 'personal-property', irsAssetClass: '57.0 - Floor Coverings' },
  'VCT/LVT': { class: '5-year', category: 'personal-property', irsAssetClass: '57.0 - Floor Coverings' },
  'Ceramic Tile': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Epoxy Coating': { class: '5-year', category: 'personal-property', irsAssetClass: '57.0 - Floor Coverings' },
  'Hardwood': { class: '7-year', category: 'personal-property', irsAssetClass: '57.0 - Floor Coverings' },
  'Rubber/Mat': { class: '5-year', category: 'personal-property', irsAssetClass: '57.0 - Floor Coverings' },
  
  // === Ceiling Options ===
  'Drop Ceiling (ACT)': { class: '5-year', category: 'personal-property', irsAssetClass: '57.0 - Decorative' },
  'Exposed Structure': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Drywall/Painted': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Open to Deck': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Suspended Grid': { class: '5-year', category: 'personal-property', irsAssetClass: '57.0 - Decorative' },
  'Wood Beam': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  
  // === Electrical Options ===
  '100 Amp': { class: '39-year', category: 'real-property', buildingSystem: 'electrical' },
  '200 Amp': { class: '39-year', category: 'real-property', buildingSystem: 'electrical' },
  '400 Amp': { class: '39-year', category: 'real-property', buildingSystem: 'electrical' },
  '600 Amp': { class: '39-year', category: 'real-property', buildingSystem: 'electrical' },
  '800 Amp': { class: '39-year', category: 'real-property', buildingSystem: 'electrical' },
  '1000+ Amp': { class: '39-year', category: 'real-property', buildingSystem: 'electrical' },
  '3-Phase 480V': { class: '39-year', category: 'real-property', buildingSystem: 'electrical' },
  '3-Phase 208V': { class: '39-year', category: 'real-property', buildingSystem: 'electrical' },
  
  // === Sprinkler Options ===
  'Wet System': { class: '39-year', category: 'real-property', buildingSystem: 'fire-protection' },
  'Dry System': { class: '39-year', category: 'real-property', buildingSystem: 'fire-protection' },
  'ESFR (High-Pile)': { class: '39-year', category: 'real-property', buildingSystem: 'fire-protection' },
  'Pre-Action': { class: '39-year', category: 'real-property', buildingSystem: 'fire-protection' },
  'Deluge': { class: '39-year', category: 'real-property', buildingSystem: 'fire-protection' },
  
  // === Elevator Options ===
  'Passenger - Hydraulic': { class: '39-year', category: 'real-property', buildingSystem: 'elevators-escalators' },
  'Passenger - Traction': { class: '39-year', category: 'real-property', buildingSystem: 'elevators-escalators' },
  'Freight - Hydraulic': { class: '39-year', category: 'real-property', buildingSystem: 'elevators-escalators' },
  'Freight - Traction': { class: '39-year', category: 'real-property', buildingSystem: 'elevators-escalators' },
  'Dock Leveler': { class: '7-year', category: 'personal-property', buildingSystem: 'elevators-escalators' },
  
  // === Foundation Options ===
  'Concrete Slab on Grade': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Raised Concrete': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Pier & Beam': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Full Basement': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Partial Basement': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Crawl Space': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  
  // === Roof Options ===
  'Built-Up (BUR)': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'TPO Membrane': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'EPDM Membrane': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Standing Seam Metal': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Corrugated Metal': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Asphalt Shingle': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Modified Bitumen': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'PVC Membrane': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  
  // === Exterior Wall Options ===
  'Concrete Tilt-Up': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Masonry/CMU': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Brick Veneer': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Metal Panel': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Glass Curtain Wall': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'EIFS/Stucco': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Precast Concrete': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Wood Siding': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  
  // === Window Options ===
  'Single Pane': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Double Pane Insulated': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Storefront System': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Curtain Wall': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Minimal/None': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Clerestory': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  
  // === Interior Wall Options ===
  'Drywall - Painted': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'CMU Block': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
  'Glass Partition': { class: '5-year', category: 'personal-property', irsAssetClass: '57.0 - Partitions' },
  'Metal Panel': { class: '5-year', category: 'personal-property', irsAssetClass: '57.0 - Partitions' },
  'Wood Panel': { class: '5-year', category: 'personal-property', irsAssetClass: '57.0 - Partitions' },
  'None (Open)': { class: '39-year', category: 'real-property', buildingSystem: 'building-structure' },
};

// =================================================================
// SITE IMPROVEMENT MAPPINGS
// =================================================================

/**
 * Site improvements are generally 15-year property
 * Mapped from marshallSwift.ts SITE_IMPROVEMENT_TYPES
 */
export const SITE_IMPROVEMENT_DEPRECIATION_MAP: Record<string, {
  class: DepreciationClass;
  category: ComponentCategory;
  irsAssetClass?: string;
}> = {
  // Paving
  'asphalt-paving': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  'concrete-paving': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  'gravel-paving': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  'paver-paving': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  
  // Fencing
  'chain-link-fence': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  'wood-fence': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  'ornamental-fence': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  'security-fence': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  
  // Landscaping
  'landscaping-basic': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  'landscaping-enhanced': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  'landscaping-premium': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  'irrigation': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  
  // Site Lighting
  'pole-light': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  'bollard-light': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  'wall-pack-light': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  
  // Site Structures
  'retaining-wall': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  'dumpster-enclosure': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  'canopy-carport': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  'loading-dock': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  
  // Utilities
  'storm-drainage': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  'sanitary-sewer': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  'water-main': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  'gas-line': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  
  // Other
  'signage-monument': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  'signage-pylon': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
  'flagpole': { class: '15-year', category: 'land-improvement', irsAssetClass: '00.3 - Land Improvements' },
};

// =================================================================
// ADDITIONAL 5-YEAR COMPONENTS (Common in Cost Seg studies)
// =================================================================

export const FIVE_YEAR_COMPONENTS: ComponentAllocation[] = [
  { componentId: 'cabinets-millwork', label: 'Cabinets/Millwork', percentOfBuildingCost: 0.02, defaultDepreciationClass: '5-year', category: 'personal-property', irsAssetClass: '57.0 - Fixtures' },
  { componentId: 'wall-coverings', label: 'Wall Coverings', percentOfBuildingCost: 0.01, defaultDepreciationClass: '5-year', category: 'personal-property', irsAssetClass: '57.0 - Decorative' },
  { componentId: 'accent-lighting', label: 'Accent/Decorative Lighting', percentOfBuildingCost: 0.01, defaultDepreciationClass: '5-year', category: 'personal-property', irsAssetClass: '57.0 - Decorative' },
  { componentId: 'window-treatments', label: 'Window Treatments', percentOfBuildingCost: 0.005, defaultDepreciationClass: '5-year', category: 'personal-property', irsAssetClass: '57.0 - Decorative' },
  { componentId: 'interior-signage', label: 'Interior Signage', percentOfBuildingCost: 0.005, defaultDepreciationClass: '5-year', category: 'personal-property', irsAssetClass: '57.0 - Signage' },
  { componentId: 'specialty-plumbing', label: 'Specialty Plumbing (Break Sinks)', percentOfBuildingCost: 0.01, defaultDepreciationClass: '5-year', category: 'personal-property', irsAssetClass: '57.0 - Plumbing Fixtures' },
  { componentId: 'specialty-electrical', label: 'Specialty Electrical (Dedicated)', percentOfBuildingCost: 0.015, defaultDepreciationClass: '5-year', category: 'personal-property', irsAssetClass: '57.0 - Electrical' },
  { componentId: 'access-control', label: 'Access Control Systems', percentOfBuildingCost: 0.005, defaultDepreciationClass: '5-year', category: 'personal-property', irsAssetClass: '57.0 - Security' },
  { componentId: 'communication-data', label: 'Communication/Data Wiring', percentOfBuildingCost: 0.02, defaultDepreciationClass: '5-year', category: 'personal-property', irsAssetClass: '48.12 - Communication Equipment' },
  { componentId: 'mailboxes', label: 'Mailboxes', percentOfBuildingCost: 0.002, defaultDepreciationClass: '5-year', category: 'personal-property', irsAssetClass: '57.0 - Fixtures' },
];

// =================================================================
// OCCUPANCY-BASED COMPONENT ALLOCATIONS
// =================================================================

/**
 * Default component allocations by occupancy type
 * These are typical percentages based on Marshall & Swift and cost seg industry standards
 */
export const OCCUPANCY_ALLOCATIONS: OccupancyAllocation[] = [
  {
    occupancyCode: 'office-lowrise',
    occupancyLabel: 'Office - Low Rise',
    components: [
      // 39-year (Real Property) - ~70%
      { componentId: 'structural-framing', label: 'Structural Framing', percentOfBuildingCost: 0.18, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'foundation', label: 'Foundation', percentOfBuildingCost: 0.06, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'roofing', label: 'Roofing Systems', percentOfBuildingCost: 0.06, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'exterior-walls', label: 'Exterior Walls', percentOfBuildingCost: 0.12, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'hvac-infrastructure', label: 'HVAC Infrastructure', percentOfBuildingCost: 0.10, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'electrical-infrastructure', label: 'Electrical Infrastructure', percentOfBuildingCost: 0.06, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'plumbing-infrastructure', label: 'Plumbing Infrastructure', percentOfBuildingCost: 0.05, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'interior-walls-structural', label: 'Interior Walls (Structural)', percentOfBuildingCost: 0.05, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'windows-doors', label: 'Windows & Doors', percentOfBuildingCost: 0.04, defaultDepreciationClass: '39-year', category: 'real-property' },
      
      // 5-year (Personal Property) - ~12%
      { componentId: 'flooring-carpet', label: 'Flooring - Carpet/VCT', percentOfBuildingCost: 0.04, defaultDepreciationClass: '5-year', category: 'personal-property' },
      { componentId: 'ceiling-systems', label: 'Ceiling Systems (ACT)', percentOfBuildingCost: 0.03, defaultDepreciationClass: '5-year', category: 'personal-property' },
      { componentId: 'cabinets-millwork', label: 'Cabinets/Millwork', percentOfBuildingCost: 0.02, defaultDepreciationClass: '5-year', category: 'personal-property' },
      { componentId: 'specialty-electrical', label: 'Specialty Electrical', percentOfBuildingCost: 0.015, defaultDepreciationClass: '5-year', category: 'personal-property' },
      { componentId: 'specialty-plumbing', label: 'Specialty Plumbing', percentOfBuildingCost: 0.01, defaultDepreciationClass: '5-year', category: 'personal-property' },
      { componentId: 'interior-partitions', label: 'Interior Partitions (Non-structural)', percentOfBuildingCost: 0.015, defaultDepreciationClass: '5-year', category: 'personal-property' },
      
      // 7-year - ~3%
      { componentId: 'office-furniture', label: 'Built-in Furniture/Fixtures', percentOfBuildingCost: 0.02, defaultDepreciationClass: '7-year', category: 'personal-property' },
      { componentId: 'hvac-equipment', label: 'HVAC Equipment (Moveable)', percentOfBuildingCost: 0.01, defaultDepreciationClass: '7-year', category: 'personal-property' },
    ],
  },
  {
    occupancyCode: 'warehouse',
    occupancyLabel: 'Warehouse/Distribution',
    components: [
      // 39-year - ~85%
      { componentId: 'structural-framing', label: 'Structural Framing', percentOfBuildingCost: 0.25, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'foundation', label: 'Foundation/Slab', percentOfBuildingCost: 0.15, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'roofing', label: 'Roofing Systems', percentOfBuildingCost: 0.12, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'exterior-walls', label: 'Exterior Walls', percentOfBuildingCost: 0.15, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'electrical-infrastructure', label: 'Electrical Infrastructure', percentOfBuildingCost: 0.08, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'fire-protection', label: 'Fire Protection', percentOfBuildingCost: 0.05, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'plumbing-infrastructure', label: 'Plumbing Infrastructure', percentOfBuildingCost: 0.03, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'hvac-infrastructure', label: 'HVAC (Warehouse)', percentOfBuildingCost: 0.02, defaultDepreciationClass: '39-year', category: 'real-property' },
      
      // 5-year - ~8%
      { componentId: 'office-flooring', label: 'Office Area Flooring', percentOfBuildingCost: 0.02, defaultDepreciationClass: '5-year', category: 'personal-property' },
      { componentId: 'office-ceilings', label: 'Office Area Ceilings', percentOfBuildingCost: 0.015, defaultDepreciationClass: '5-year', category: 'personal-property' },
      { componentId: 'specialty-electrical', label: 'Specialty Electrical', percentOfBuildingCost: 0.02, defaultDepreciationClass: '5-year', category: 'personal-property' },
      { componentId: 'interior-partitions', label: 'Office Partitions', percentOfBuildingCost: 0.015, defaultDepreciationClass: '5-year', category: 'personal-property' },
      { componentId: 'signage', label: 'Interior Signage', percentOfBuildingCost: 0.01, defaultDepreciationClass: '5-year', category: 'personal-property' },
      
      // 7-year - ~7%
      { componentId: 'dock-equipment', label: 'Dock Equipment/Levelers', percentOfBuildingCost: 0.04, defaultDepreciationClass: '7-year', category: 'personal-property' },
      { componentId: 'overhead-doors', label: 'Overhead Doors', percentOfBuildingCost: 0.03, defaultDepreciationClass: '7-year', category: 'personal-property' },
    ],
  },
  {
    occupancyCode: 'retail',
    occupancyLabel: 'Retail/Shopping Center',
    components: [
      // 39-year - ~65%
      { componentId: 'structural-framing', label: 'Structural Framing', percentOfBuildingCost: 0.15, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'foundation', label: 'Foundation', percentOfBuildingCost: 0.06, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'roofing', label: 'Roofing Systems', percentOfBuildingCost: 0.08, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'exterior-walls', label: 'Exterior Walls/Facade', percentOfBuildingCost: 0.12, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'hvac-infrastructure', label: 'HVAC Infrastructure', percentOfBuildingCost: 0.10, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'electrical-infrastructure', label: 'Electrical Infrastructure', percentOfBuildingCost: 0.06, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'plumbing-infrastructure', label: 'Plumbing Infrastructure', percentOfBuildingCost: 0.04, defaultDepreciationClass: '39-year', category: 'real-property' },
      { componentId: 'storefront-systems', label: 'Storefront Systems', percentOfBuildingCost: 0.06, defaultDepreciationClass: '39-year', category: 'real-property' },
      
      // 5-year - ~20%
      { componentId: 'flooring', label: 'Flooring (Carpet/VCT/Tile)', percentOfBuildingCost: 0.05, defaultDepreciationClass: '5-year', category: 'personal-property' },
      { componentId: 'ceiling-systems', label: 'Ceiling Systems', percentOfBuildingCost: 0.04, defaultDepreciationClass: '5-year', category: 'personal-property' },
      { componentId: 'interior-partitions', label: 'Interior Partitions', percentOfBuildingCost: 0.03, defaultDepreciationClass: '5-year', category: 'personal-property' },
      { componentId: 'specialty-lighting', label: 'Specialty/Display Lighting', percentOfBuildingCost: 0.03, defaultDepreciationClass: '5-year', category: 'personal-property' },
      { componentId: 'signage', label: 'Interior Signage', percentOfBuildingCost: 0.02, defaultDepreciationClass: '5-year', category: 'personal-property' },
      { componentId: 'millwork', label: 'Millwork/Built-ins', percentOfBuildingCost: 0.03, defaultDepreciationClass: '5-year', category: 'personal-property' },
      
      // 7-year - ~5%
      { componentId: 'display-fixtures', label: 'Display Fixtures', percentOfBuildingCost: 0.03, defaultDepreciationClass: '7-year', category: 'personal-property' },
      { componentId: 'specialty-equipment', label: 'Specialty Equipment', percentOfBuildingCost: 0.02, defaultDepreciationClass: '7-year', category: 'personal-property' },
    ],
  },
  {
    occupancyCode: 'apartment',
    occupancyLabel: 'Multi-Family Apartment',
    components: [
      // 27.5-year (Real Property) - ~70%
      { componentId: 'structural-framing', label: 'Structural Framing', percentOfBuildingCost: 0.18, defaultDepreciationClass: '27.5-year', category: 'real-property' },
      { componentId: 'foundation', label: 'Foundation', percentOfBuildingCost: 0.06, defaultDepreciationClass: '27.5-year', category: 'real-property' },
      { componentId: 'roofing', label: 'Roofing Systems', percentOfBuildingCost: 0.06, defaultDepreciationClass: '27.5-year', category: 'real-property' },
      { componentId: 'exterior-walls', label: 'Exterior Walls', percentOfBuildingCost: 0.12, defaultDepreciationClass: '27.5-year', category: 'real-property' },
      { componentId: 'hvac-infrastructure', label: 'HVAC Infrastructure', percentOfBuildingCost: 0.08, defaultDepreciationClass: '27.5-year', category: 'real-property' },
      { componentId: 'electrical-infrastructure', label: 'Electrical Infrastructure', percentOfBuildingCost: 0.06, defaultDepreciationClass: '27.5-year', category: 'real-property' },
      { componentId: 'plumbing-infrastructure', label: 'Plumbing Infrastructure', percentOfBuildingCost: 0.08, defaultDepreciationClass: '27.5-year', category: 'real-property' },
      { componentId: 'windows-doors', label: 'Windows & Doors', percentOfBuildingCost: 0.04, defaultDepreciationClass: '27.5-year', category: 'real-property' },
      { componentId: 'interior-walls', label: 'Interior Walls', percentOfBuildingCost: 0.04, defaultDepreciationClass: '27.5-year', category: 'real-property' },
      
      // 5-year (Personal Property) - ~18%
      { componentId: 'flooring', label: 'Flooring (Carpet/VCT)', percentOfBuildingCost: 0.05, defaultDepreciationClass: '5-year', category: 'personal-property' },
      { componentId: 'appliances', label: 'Appliances', percentOfBuildingCost: 0.04, defaultDepreciationClass: '5-year', category: 'personal-property' },
      { componentId: 'cabinets', label: 'Cabinets/Counters', percentOfBuildingCost: 0.04, defaultDepreciationClass: '5-year', category: 'personal-property' },
      { componentId: 'window-treatments', label: 'Window Treatments', percentOfBuildingCost: 0.01, defaultDepreciationClass: '5-year', category: 'personal-property' },
      { componentId: 'specialty-plumbing', label: 'Specialty Plumbing Fixtures', percentOfBuildingCost: 0.02, defaultDepreciationClass: '5-year', category: 'personal-property' },
      { componentId: 'clubhouse-finishes', label: 'Clubhouse Finishes', percentOfBuildingCost: 0.02, defaultDepreciationClass: '5-year', category: 'personal-property' },
      
      // 7-year - ~2%
      { componentId: 'fitness-equipment', label: 'Fitness Equipment', percentOfBuildingCost: 0.01, defaultDepreciationClass: '7-year', category: 'personal-property' },
      { componentId: 'hvac-equipment', label: 'HVAC Equipment (PTACs)', percentOfBuildingCost: 0.01, defaultDepreciationClass: '7-year', category: 'personal-property' },
    ],
  },
];

/**
 * Get component allocations for an occupancy code
 */
export function getAllocationsForOccupancy(occupancyCode: string): ComponentAllocation[] {
  const allocation = OCCUPANCY_ALLOCATIONS.find(
    a => a.occupancyCode === occupancyCode || 
         occupancyCode.toLowerCase().includes(a.occupancyCode.split('-')[0])
  );
  
  if (allocation) {
    return allocation.components;
  }
  
  // Default to office allocations if not found
  return OCCUPANCY_ALLOCATIONS.find(a => a.occupancyCode === 'office-lowrise')?.components ?? [];
}

// =================================================================
// REPORT SECTION CONFIGURATION
// =================================================================

export const COST_SEG_REPORT_SECTIONS = [
  { id: 'cover', label: 'Cover Page', enabled: true, order: 1, editable: false },
  { id: 'executive-summary', label: 'Executive Summary', enabled: true, order: 2, editable: true },
  { id: 'methodology', label: 'Methodology', enabled: true, order: 3, editable: true },
  { id: 'property-description', label: 'Property Description', enabled: true, order: 4, editable: true },
  { id: 'component-detail', label: 'Component Detail', enabled: true, order: 5, editable: false },
  { id: 'depreciation-schedule', label: 'Depreciation Schedule', enabled: true, order: 6, editable: false },
  { id: 'building-systems', label: 'Building Systems', enabled: true, order: 7, editable: false },
  { id: 'tax-benefit', label: 'Tax Benefit Summary', enabled: true, order: 8, editable: false },
  { id: 'disclaimer', label: 'Disclaimer', enabled: true, order: 9, editable: true },
];

// =================================================================
// DISCLAIMER TEXT
// =================================================================

export const COST_SEG_DISCLAIMER = `DISCLAIMER: This Cost Segregation Analysis is provided as a preliminary 
assessment tool. The classifications and allocations are based on general 
IRS guidelines and Marshall & Swift cost data. Property owners should 
consult with a qualified tax professional and/or cost segregation 
specialist before claiming accelerated depreciation deductions.

This analysis does not constitute tax or legal advice. The actual 
depreciation deductions allowable may differ from the estimates provided 
herein based on specific facts and circumstances of the property, 
applicable tax laws, and IRS regulations in effect at the time of filing.

The preparer of this analysis is not responsible for any tax positions 
taken based on this analysis. All users of this information should seek 
independent professional advice regarding their specific tax situation.`;

