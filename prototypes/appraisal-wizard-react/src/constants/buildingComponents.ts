/**
 * Building Component Types
 * 
 * M&S-aligned component classifications for Exterior Features, Mechanical Systems,
 * and Interior Finishes. Supports Cost Segregation and Risk Rating with per-component
 * tracking of year installed, condition, and economic life.
 * 
 * References:
 * - Marshall Valuation Service Sections 11-17
 * - IRS Cost Segregation Audit Techniques Guide
 * - Publication 946 (MACRS Depreciation)
 */

import type { DepreciationClass } from './costSegregation';
import type { PropertyCategory } from './marshallSwift';

// =================================================================
// TYPES
// =================================================================

export type ExteriorCategory = 'foundation' | 'roofing' | 'walls' | 'windows';
export type MechanicalCategory = 'electrical' | 'heating' | 'cooling' | 'fire-protection' | 'elevators';
export type InteriorCategory = 'ceilings' | 'flooring' | 'walls' | 'plumbing' | 'lighting';

export type BuildingComponentCategory = ExteriorCategory | MechanicalCategory | InteriorCategory;

/**
 * Property type IDs that a component is applicable to.
 * Maps to M&S occupancy code property types (e.g., 'industrial', 'office', 'retail', 'residential').
 * If undefined or empty, the component is applicable to all property types.
 */
export type ApplicablePropertyType = 
  | 'residential'    // SFR, townhouse, duplex, ADU
  | 'office'         // Office buildings
  | 'retail'         // Retail stores, restaurants
  | 'industrial'     // Warehouse, manufacturing, flex
  | 'multifamily'    // Apartments, hotels
  | 'institutional'  // Schools, churches, government
  | 'agricultural';  // Barns, silos, greenhouses

export interface BuildingComponentType {
  id: string;
  label: string;
  category: BuildingComponentCategory;
  parentSection: 'exterior' | 'mechanical' | 'interior';
  defaultEconomicLife: number;
  defaultUnit: 'SF' | 'LF' | 'EA' | 'LS' | 'TON';
  msReference?: string;
  depreciationClass: DepreciationClass;
  notes?: string;
  
  /**
   * Property types this component is applicable to.
   * If undefined or empty, applicable to ALL property types.
   * Used for filtering component options based on building/property type.
   */
  applicablePropertyTypes?: ApplicablePropertyType[];
  
  /**
   * Property categories this component is applicable to.
   * Maps to PropertyCategory from marshallSwift.ts ('residential' | 'commercial' | 'land').
   * If undefined, applicable to both residential and commercial.
   */
  applicablePropertyCategories?: PropertyCategory[];
  
  /**
   * Whether this is a "primary" or recommended component for its applicable types.
   * Primary components appear at the top of filtered lists.
   */
  isPrimary?: boolean;
}

export interface BuildingComponentCategoryConfig {
  id: BuildingComponentCategory;
  label: string;
  parentSection: 'exterior' | 'mechanical' | 'interior';
  icon?: string;
  description?: string;
}

// =================================================================
// CATEGORY DEFINITIONS
// =================================================================

export const EXTERIOR_CATEGORIES: BuildingComponentCategoryConfig[] = [
  { id: 'foundation', label: 'Foundation', parentSection: 'exterior', description: 'Foundation and floor systems' },
  { id: 'roofing', label: 'Roofing', parentSection: 'exterior', description: 'Roof covering and structure' },
  { id: 'walls', label: 'Exterior Walls', parentSection: 'exterior', description: 'Exterior wall systems' },
  { id: 'windows', label: 'Windows', parentSection: 'exterior', description: 'Windows and glazing' },
];

export const MECHANICAL_CATEGORIES: BuildingComponentCategoryConfig[] = [
  { id: 'electrical', label: 'Electrical', parentSection: 'mechanical', description: 'Electrical systems and panels' },
  { id: 'heating', label: 'Heating', parentSection: 'mechanical', description: 'Heating systems' },
  { id: 'cooling', label: 'Cooling', parentSection: 'mechanical', description: 'Air conditioning and cooling' },
  { id: 'fire-protection', label: 'Fire Protection', parentSection: 'mechanical', description: 'Sprinklers and fire alarm' },
  { id: 'elevators', label: 'Elevators', parentSection: 'mechanical', description: 'Elevators and lifts' },
];

export const INTERIOR_CATEGORIES: BuildingComponentCategoryConfig[] = [
  { id: 'ceilings', label: 'Ceilings', parentSection: 'interior', description: 'Ceiling finishes' },
  { id: 'flooring', label: 'Flooring', parentSection: 'interior', description: 'Floor finishes' },
  { id: 'walls', label: 'Interior Walls', parentSection: 'interior', description: 'Interior wall finishes' },
  { id: 'plumbing', label: 'Plumbing Fixtures', parentSection: 'interior', description: 'Restroom and specialty plumbing fixtures' },
  { id: 'lighting', label: 'Lighting Fixtures', parentSection: 'interior', description: 'Interior lighting and emergency egress' },
];

export const ALL_BUILDING_CATEGORIES = [
  ...EXTERIOR_CATEGORIES,
  ...MECHANICAL_CATEGORIES,
  ...INTERIOR_CATEGORIES,
];

// =================================================================
// EXTERIOR COMPONENT TYPES
// =================================================================

export const FOUNDATION_TYPES: BuildingComponentType[] = [
  {
    id: 'foundation-slab-on-grade',
    label: 'Concrete Slab on Grade',
    category: 'foundation',
    parentSection: 'exterior',
    defaultEconomicLife: 50,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    isPrimary: true,
  },
  {
    id: 'foundation-pier-beam',
    label: 'Pier & Beam',
    category: 'foundation',
    parentSection: 'exterior',
    defaultEconomicLife: 45,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['residential', 'agricultural'],
    isPrimary: true,
  },
  {
    id: 'foundation-crawlspace',
    label: 'Crawlspace',
    category: 'foundation',
    parentSection: 'exterior',
    defaultEconomicLife: 45,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['residential'],
    isPrimary: true,
  },
  {
    id: 'foundation-full-basement',
    label: 'Full Basement',
    category: 'foundation',
    parentSection: 'exterior',
    defaultEconomicLife: 50,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['residential', 'office', 'institutional'],
  },
  {
    id: 'foundation-partial-basement',
    label: 'Partial Basement',
    category: 'foundation',
    parentSection: 'exterior',
    defaultEconomicLife: 50,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['residential'],
  },
  {
    id: 'foundation-raised-floor',
    label: 'Raised Floor System',
    category: 'foundation',
    parentSection: 'exterior',
    defaultEconomicLife: 30,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'institutional'],
    notes: 'Data center / server room access floor',
  },
  {
    id: 'foundation-post-frame',
    label: 'Post Frame / Pole Barn',
    category: 'foundation',
    parentSection: 'exterior',
    defaultEconomicLife: 35,
    defaultUnit: 'SF',
    msReference: 'Section 17',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['agricultural', 'industrial'],
    applicablePropertyCategories: ['commercial'],
    isPrimary: true,
  },
];

export const ROOFING_TYPES: BuildingComponentType[] = [
  // Commercial flat roof types
  {
    id: 'roof-tpo',
    label: 'TPO Membrane',
    category: 'roofing',
    parentSection: 'exterior',
    defaultEconomicLife: 25,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'retail', 'industrial', 'multifamily', 'institutional'],
    applicablePropertyCategories: ['commercial'],
    isPrimary: true,
  },
  {
    id: 'roof-epdm',
    label: 'EPDM Membrane',
    category: 'roofing',
    parentSection: 'exterior',
    defaultEconomicLife: 20,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'retail', 'industrial', 'multifamily', 'institutional'],
    applicablePropertyCategories: ['commercial'],
    isPrimary: true,
  },
  {
    id: 'roof-metal-standing-seam',
    label: 'Metal Standing Seam',
    category: 'roofing',
    parentSection: 'exterior',
    defaultEconomicLife: 40,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    isPrimary: true,
  },
  {
    id: 'roof-metal-corrugated',
    label: 'Corrugated Metal',
    category: 'roofing',
    parentSection: 'exterior',
    defaultEconomicLife: 30,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['industrial', 'agricultural'],
    applicablePropertyCategories: ['commercial'],
    isPrimary: true,
  },
  {
    id: 'roof-built-up',
    label: 'Built-Up (BUR)',
    category: 'roofing',
    parentSection: 'exterior',
    defaultEconomicLife: 20,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'retail', 'industrial', 'institutional'],
    applicablePropertyCategories: ['commercial'],
  },
  // Residential sloped roof types
  {
    id: 'roof-shingle-asphalt',
    label: 'Asphalt Shingle',
    category: 'roofing',
    parentSection: 'exterior',
    defaultEconomicLife: 25,
    defaultUnit: 'SF',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential', 'multifamily'],
    applicablePropertyCategories: ['residential', 'commercial'],
    isPrimary: true,
  },
  {
    id: 'roof-shingle-architectural',
    label: 'Architectural Shingle',
    category: 'roofing',
    parentSection: 'exterior',
    defaultEconomicLife: 30,
    defaultUnit: 'SF',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential', 'multifamily'],
    applicablePropertyCategories: ['residential', 'commercial'],
    isPrimary: true,
    notes: 'Premium dimensional shingles',
  },
  {
    id: 'roof-shingle-wood',
    label: 'Wood Shingle/Shake',
    category: 'roofing',
    parentSection: 'exterior',
    defaultEconomicLife: 25,
    defaultUnit: 'SF',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential'],
    applicablePropertyCategories: ['residential'],
  },
  {
    id: 'roof-tile-clay',
    label: 'Clay Tile',
    category: 'roofing',
    parentSection: 'exterior',
    defaultEconomicLife: 50,
    defaultUnit: 'SF',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential', 'multifamily'],
    applicablePropertyCategories: ['residential', 'commercial'],
  },
  {
    id: 'roof-tile-concrete',
    label: 'Concrete Tile',
    category: 'roofing',
    parentSection: 'exterior',
    defaultEconomicLife: 40,
    defaultUnit: 'SF',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential', 'multifamily'],
    applicablePropertyCategories: ['residential', 'commercial'],
  },
  {
    id: 'roof-slate',
    label: 'Slate',
    category: 'roofing',
    parentSection: 'exterior',
    defaultEconomicLife: 75,
    defaultUnit: 'SF',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential', 'institutional'],
  },
  {
    id: 'roof-composite',
    label: 'Composite/Synthetic',
    category: 'roofing',
    parentSection: 'exterior',
    defaultEconomicLife: 30,
    defaultUnit: 'SF',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential'],
    applicablePropertyCategories: ['residential'],
    notes: 'Synthetic slate/shake lookalikes',
  },
];

export const EXTERIOR_WALL_TYPES: BuildingComponentType[] = [
  // Commercial wall types
  {
    id: 'wall-ext-metal-panel',
    label: 'Metal Panels',
    category: 'walls',
    parentSection: 'exterior',
    defaultEconomicLife: 35,
    defaultUnit: 'SF',
    msReference: 'Section 14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['industrial', 'agricultural'],
    applicablePropertyCategories: ['commercial'],
    isPrimary: true,
  },
  {
    id: 'wall-ext-cmu',
    label: 'CMU Block',
    category: 'walls',
    parentSection: 'exterior',
    defaultEconomicLife: 45,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['industrial', 'retail', 'institutional'],
    applicablePropertyCategories: ['commercial'],
    isPrimary: true,
  },
  {
    id: 'wall-ext-tilt-up',
    label: 'Tilt-Up Concrete',
    category: 'walls',
    parentSection: 'exterior',
    defaultEconomicLife: 50,
    defaultUnit: 'SF',
    msReference: 'Section 14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['industrial', 'retail'],
    applicablePropertyCategories: ['commercial'],
    isPrimary: true,
  },
  {
    id: 'wall-ext-brick',
    label: 'Brick',
    category: 'walls',
    parentSection: 'exterior',
    defaultEconomicLife: 50,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    isPrimary: true,
  },
  {
    id: 'wall-ext-stucco',
    label: 'Stucco',
    category: 'walls',
    parentSection: 'exterior',
    defaultEconomicLife: 35,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    isPrimary: true,
  },
  {
    id: 'wall-ext-eifs',
    label: 'EIFS',
    category: 'walls',
    parentSection: 'exterior',
    defaultEconomicLife: 25,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'retail', 'multifamily'],
    applicablePropertyCategories: ['commercial'],
  },
  // Residential siding types
  {
    id: 'wall-ext-wood-siding',
    label: 'Wood Siding',
    category: 'walls',
    parentSection: 'exterior',
    defaultEconomicLife: 30,
    defaultUnit: 'SF',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential'],
    applicablePropertyCategories: ['residential'],
    isPrimary: true,
  },
  {
    id: 'wall-ext-vinyl-siding',
    label: 'Vinyl Siding',
    category: 'walls',
    parentSection: 'exterior',
    defaultEconomicLife: 25,
    defaultUnit: 'SF',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential'],
    applicablePropertyCategories: ['residential'],
    isPrimary: true,
  },
  {
    id: 'wall-ext-fiber-cement',
    label: 'Fiber Cement (Hardie)',
    category: 'walls',
    parentSection: 'exterior',
    defaultEconomicLife: 35,
    defaultUnit: 'SF',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential', 'multifamily'],
    applicablePropertyCategories: ['residential', 'commercial'],
    isPrimary: true,
    notes: 'James Hardie and similar',
  },
  {
    id: 'wall-ext-aluminum-siding',
    label: 'Aluminum Siding',
    category: 'walls',
    parentSection: 'exterior',
    defaultEconomicLife: 30,
    defaultUnit: 'SF',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential'],
    applicablePropertyCategories: ['residential'],
    notes: 'Older residential properties',
  },
  {
    id: 'wall-ext-glass-curtain',
    label: 'Glass Curtain Wall',
    category: 'walls',
    parentSection: 'exterior',
    defaultEconomicLife: 35,
    defaultUnit: 'SF',
    msReference: 'Section 11',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'retail', 'institutional'],
    applicablePropertyCategories: ['commercial'],
    isPrimary: true,
  },
  {
    id: 'wall-ext-stone-veneer',
    label: 'Stone Veneer',
    category: 'walls',
    parentSection: 'exterior',
    defaultEconomicLife: 50,
    defaultUnit: 'SF',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential', 'office'],
    notes: 'Natural or manufactured stone',
  },
  {
    id: 'wall-ext-log',
    label: 'Log Construction',
    category: 'walls',
    parentSection: 'exterior',
    defaultEconomicLife: 50,
    defaultUnit: 'SF',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential'],
    applicablePropertyCategories: ['residential'],
    notes: 'Log cabin style',
  },
];

export const WINDOW_TYPES: BuildingComponentType[] = [
  {
    id: 'window-single-pane',
    label: 'Single Pane',
    category: 'windows',
    parentSection: 'exterior',
    defaultEconomicLife: 20,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'window-double-pane',
    label: 'Double Pane / Insulated',
    category: 'windows',
    parentSection: 'exterior',
    defaultEconomicLife: 25,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'window-triple-pane',
    label: 'Triple Pane',
    category: 'windows',
    parentSection: 'exterior',
    defaultEconomicLife: 30,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'window-storefront',
    label: 'Storefront',
    category: 'windows',
    parentSection: 'exterior',
    defaultEconomicLife: 30,
    defaultUnit: 'SF',
    msReference: 'Section 13',
    depreciationClass: '39-year',
  },
  {
    id: 'window-industrial',
    label: 'Industrial',
    category: 'windows',
    parentSection: 'exterior',
    defaultEconomicLife: 25,
    defaultUnit: 'SF',
    msReference: 'Section 14',
    depreciationClass: '39-year',
  },
  {
    id: 'window-skylights',
    label: 'Skylights',
    category: 'windows',
    parentSection: 'exterior',
    defaultEconomicLife: 20,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'window-none',
    label: 'None / Minimal',
    category: 'windows',
    parentSection: 'exterior',
    defaultEconomicLife: 0,
    defaultUnit: 'LS',
    msReference: 'Section 14',
    depreciationClass: '39-year',
  },
];

// =================================================================
// MECHANICAL COMPONENT TYPES
// =================================================================

export const ELECTRICAL_TYPES: BuildingComponentType[] = [
  // Residential electrical
  {
    id: 'electrical-100a',
    label: '100 Amp Service',
    category: 'electrical',
    parentSection: 'mechanical',
    defaultEconomicLife: 40,
    defaultUnit: 'EA',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential'],
    applicablePropertyCategories: ['residential'],
    isPrimary: true,
    notes: 'Older/smaller residential',
  },
  {
    id: 'electrical-200a',
    label: '200 Amp Service',
    category: 'electrical',
    parentSection: 'mechanical',
    defaultEconomicLife: 40,
    defaultUnit: 'EA',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential'],
    applicablePropertyCategories: ['residential'],
    isPrimary: true,
    notes: 'Standard residential',
  },
  // Commercial electrical
  {
    id: 'electrical-200a-comm',
    label: '200 Amp Service',
    category: 'electrical',
    parentSection: 'mechanical',
    defaultEconomicLife: 40,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'retail', 'multifamily'],
    applicablePropertyCategories: ['commercial'],
    isPrimary: true,
    notes: 'Small commercial',
  },
  {
    id: 'electrical-400a',
    label: '400 Amp Service',
    category: 'electrical',
    parentSection: 'mechanical',
    defaultEconomicLife: 40,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'retail', 'industrial', 'multifamily', 'institutional'],
    applicablePropertyCategories: ['commercial'],
    isPrimary: true,
    notes: 'Medium commercial',
  },
  {
    id: 'electrical-600a',
    label: '600 Amp Service',
    category: 'electrical',
    parentSection: 'mechanical',
    defaultEconomicLife: 40,
    defaultUnit: 'EA',
    msReference: 'Section 14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['industrial', 'institutional'],
    applicablePropertyCategories: ['commercial'],
    isPrimary: true,
    notes: 'Large commercial',
  },
  {
    id: 'electrical-800a-plus',
    label: '800+ Amp Service',
    category: 'electrical',
    parentSection: 'mechanical',
    defaultEconomicLife: 40,
    defaultUnit: 'EA',
    msReference: 'Section 14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['industrial'],
    applicablePropertyCategories: ['commercial'],
    notes: 'Heavy industrial',
  },
  {
    id: 'electrical-3-phase',
    label: '3-Phase Power',
    category: 'electrical',
    parentSection: 'mechanical',
    defaultEconomicLife: 40,
    defaultUnit: 'EA',
    msReference: 'Section 14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['industrial', 'office', 'retail'],
    applicablePropertyCategories: ['commercial'],
    isPrimary: true,
    notes: 'Industrial/manufacturing - 208V or 480V',
  },
  {
    id: 'electrical-solar-pv',
    label: 'Solar PV System',
    category: 'electrical',
    parentSection: 'mechanical',
    defaultEconomicLife: 25,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '5-year',
    notes: 'IRS 5-year MACRS for solar',
  },
  {
    id: 'electrical-generator',
    label: 'Backup Generator',
    category: 'electrical',
    parentSection: 'mechanical',
    defaultEconomicLife: 20,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '15-year',
    applicablePropertyTypes: ['office', 'retail', 'industrial', 'institutional'],
    applicablePropertyCategories: ['commercial'],
  },
  {
    id: 'electrical-ups',
    label: 'UPS System',
    category: 'electrical',
    parentSection: 'mechanical',
    defaultEconomicLife: 10,
    defaultUnit: 'EA',
    msReference: 'Section 11',
    depreciationClass: '5-year',
    applicablePropertyTypes: ['office', 'industrial'],
    applicablePropertyCategories: ['commercial'],
  },
  {
    id: 'electrical-ev-charger',
    label: 'EV Charging Station',
    category: 'electrical',
    parentSection: 'mechanical',
    defaultEconomicLife: 15,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '5-year',
    notes: 'Level 2 or DC fast charger',
  },
];

export const HEATING_TYPES: BuildingComponentType[] = [
  // Residential heating
  {
    id: 'heating-gas-furnace',
    label: 'Gas Furnace',
    category: 'heating',
    parentSection: 'mechanical',
    defaultEconomicLife: 20,
    defaultUnit: 'EA',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential'],
    applicablePropertyCategories: ['residential'],
    isPrimary: true,
    notes: 'Central forced-air gas heating',
  },
  {
    id: 'heating-electric-furnace',
    label: 'Electric Furnace',
    category: 'heating',
    parentSection: 'mechanical',
    defaultEconomicLife: 18,
    defaultUnit: 'EA',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential'],
    applicablePropertyCategories: ['residential'],
    isPrimary: true,
  },
  {
    id: 'heating-heat-pump',
    label: 'Heat Pump',
    category: 'heating',
    parentSection: 'mechanical',
    defaultEconomicLife: 15,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    isPrimary: true,
  },
  {
    id: 'heating-mini-split',
    label: 'Mini-Split (Heat)',
    category: 'heating',
    parentSection: 'mechanical',
    defaultEconomicLife: 15,
    defaultUnit: 'EA',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential', 'multifamily'],
    applicablePropertyCategories: ['residential', 'commercial'],
    isPrimary: true,
    notes: 'Ductless mini-split heating',
  },
  {
    id: 'heating-baseboard-electric',
    label: 'Electric Baseboard',
    category: 'heating',
    parentSection: 'mechanical',
    defaultEconomicLife: 25,
    defaultUnit: 'LF',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential', 'multifamily'],
    applicablePropertyCategories: ['residential', 'commercial'],
    notes: 'Zonal electric baseboard heat',
  },
  {
    id: 'heating-baseboard-hydronic',
    label: 'Hydronic Baseboard',
    category: 'heating',
    parentSection: 'mechanical',
    defaultEconomicLife: 30,
    defaultUnit: 'LF',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential', 'multifamily'],
    applicablePropertyCategories: ['residential', 'commercial'],
    notes: 'Hot water baseboard heating',
  },
  {
    id: 'heating-wood-stove',
    label: 'Wood Stove',
    category: 'heating',
    parentSection: 'mechanical',
    defaultEconomicLife: 25,
    defaultUnit: 'EA',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential'],
    applicablePropertyCategories: ['residential'],
    notes: 'Primary or supplemental wood heat',
  },
  {
    id: 'heating-pellet-stove',
    label: 'Pellet Stove',
    category: 'heating',
    parentSection: 'mechanical',
    defaultEconomicLife: 20,
    defaultUnit: 'EA',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential'],
    applicablePropertyCategories: ['residential'],
  },
  // Commercial heating
  {
    id: 'heating-gas-forced-air',
    label: 'Gas Forced Air',
    category: 'heating',
    parentSection: 'mechanical',
    defaultEconomicLife: 20,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'retail', 'multifamily', 'institutional'],
    applicablePropertyCategories: ['commercial'],
    isPrimary: true,
  },
  {
    id: 'heating-electric-forced-air',
    label: 'Electric Forced Air',
    category: 'heating',
    parentSection: 'mechanical',
    defaultEconomicLife: 18,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'retail', 'institutional'],
    applicablePropertyCategories: ['commercial'],
  },
  {
    id: 'heating-boiler-hot-water',
    label: 'Boiler (Hot Water)',
    category: 'heating',
    parentSection: 'mechanical',
    defaultEconomicLife: 25,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'multifamily', 'institutional'],
    applicablePropertyCategories: ['commercial'],
    isPrimary: true,
  },
  {
    id: 'heating-boiler-steam',
    label: 'Boiler (Steam)',
    category: 'heating',
    parentSection: 'mechanical',
    defaultEconomicLife: 30,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'industrial', 'institutional'],
    applicablePropertyCategories: ['commercial'],
  },
  {
    id: 'heating-radiant-floor',
    label: 'Radiant Floor',
    category: 'heating',
    parentSection: 'mechanical',
    defaultEconomicLife: 30,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'heating-unit-heaters',
    label: 'Unit Heaters',
    category: 'heating',
    parentSection: 'mechanical',
    defaultEconomicLife: 15,
    defaultUnit: 'EA',
    msReference: 'Section 14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['industrial', 'agricultural'],
    applicablePropertyCategories: ['commercial'],
    isPrimary: true,
    notes: 'Warehouse/industrial',
  },
  {
    id: 'heating-radiant-tube',
    label: 'Radiant Tube Heaters',
    category: 'heating',
    parentSection: 'mechanical',
    defaultEconomicLife: 20,
    defaultUnit: 'LF',
    msReference: 'Section 14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['industrial', 'agricultural'],
    applicablePropertyCategories: ['commercial'],
    isPrimary: true,
    notes: 'Warehouse/industrial',
  },
  {
    id: 'heating-rtu-heat',
    label: 'RTU (Heating)',
    category: 'heating',
    parentSection: 'mechanical',
    defaultEconomicLife: 18,
    defaultUnit: 'TON',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'retail', 'industrial'],
    applicablePropertyCategories: ['commercial'],
    isPrimary: true,
  },
  {
    id: 'heating-none',
    label: 'None',
    category: 'heating',
    parentSection: 'mechanical',
    defaultEconomicLife: 0,
    defaultUnit: 'LS',
    msReference: 'Section 14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['industrial', 'agricultural'],
    notes: 'Unheated buildings',
  },
];

export const COOLING_TYPES: BuildingComponentType[] = [
  {
    id: 'cooling-central-ac',
    label: 'Central AC',
    category: 'cooling',
    parentSection: 'mechanical',
    defaultEconomicLife: 15,
    defaultUnit: 'TON',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'cooling-rtu',
    label: 'RTU (Packaged)',
    category: 'cooling',
    parentSection: 'mechanical',
    defaultEconomicLife: 18,
    defaultUnit: 'TON',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'cooling-split-system',
    label: 'Split System',
    category: 'cooling',
    parentSection: 'mechanical',
    defaultEconomicLife: 15,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'cooling-mini-split',
    label: 'Mini-Split / Ductless',
    category: 'cooling',
    parentSection: 'mechanical',
    defaultEconomicLife: 15,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'cooling-chiller',
    label: 'Chiller System',
    category: 'cooling',
    parentSection: 'mechanical',
    defaultEconomicLife: 25,
    defaultUnit: 'TON',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'cooling-evaporative',
    label: 'Evaporative Cooler',
    category: 'cooling',
    parentSection: 'mechanical',
    defaultEconomicLife: 12,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'cooling-window-unit',
    label: 'Window Units',
    category: 'cooling',
    parentSection: 'mechanical',
    defaultEconomicLife: 10,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '5-year',
    notes: 'Personal property',
  },
  {
    id: 'cooling-none',
    label: 'None',
    category: 'cooling',
    parentSection: 'mechanical',
    defaultEconomicLife: 0,
    defaultUnit: 'LS',
    msReference: 'Section 14',
    depreciationClass: '39-year',
  },
];

export const FIRE_PROTECTION_TYPES: BuildingComponentType[] = [
  {
    id: 'fire-sprinkler-wet',
    label: 'Wet Sprinkler System',
    category: 'fire-protection',
    parentSection: 'mechanical',
    defaultEconomicLife: 40,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'fire-sprinkler-dry',
    label: 'Dry Sprinkler System',
    category: 'fire-protection',
    parentSection: 'mechanical',
    defaultEconomicLife: 40,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'fire-sprinkler-esfr',
    label: 'ESFR Sprinkler',
    category: 'fire-protection',
    parentSection: 'mechanical',
    defaultEconomicLife: 40,
    defaultUnit: 'SF',
    msReference: 'Section 14',
    depreciationClass: '39-year',
    notes: 'High-piled storage',
  },
  {
    id: 'fire-alarm-basic',
    label: 'Fire Alarm Only',
    category: 'fire-protection',
    parentSection: 'mechanical',
    defaultEconomicLife: 20,
    defaultUnit: 'LS',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'fire-alarm-monitored',
    label: 'Monitored Fire Alarm',
    category: 'fire-protection',
    parentSection: 'mechanical',
    defaultEconomicLife: 20,
    defaultUnit: 'LS',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'fire-extinguisher',
    label: 'Fire Extinguishers Only',
    category: 'fire-protection',
    parentSection: 'mechanical',
    defaultEconomicLife: 12,
    defaultUnit: 'LS',
    msReference: 'Section 11-14',
    depreciationClass: '5-year',
  },
  {
    id: 'fire-none',
    label: 'None',
    category: 'fire-protection',
    parentSection: 'mechanical',
    defaultEconomicLife: 0,
    defaultUnit: 'LS',
    msReference: 'Section 14',
    depreciationClass: '39-year',
  },
];

export const ELEVATOR_TYPES: BuildingComponentType[] = [
  {
    id: 'elevator-hydraulic',
    label: 'Hydraulic Elevator',
    category: 'elevators',
    parentSection: 'mechanical',
    defaultEconomicLife: 25,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'elevator-traction',
    label: 'Traction Elevator',
    category: 'elevators',
    parentSection: 'mechanical',
    defaultEconomicLife: 30,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'elevator-freight',
    label: 'Freight Elevator',
    category: 'elevators',
    parentSection: 'mechanical',
    defaultEconomicLife: 30,
    defaultUnit: 'EA',
    msReference: 'Section 14',
    depreciationClass: '39-year',
  },
  {
    id: 'elevator-dumbwaiter',
    label: 'Dumbwaiter',
    category: 'elevators',
    parentSection: 'mechanical',
    defaultEconomicLife: 20,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'elevator-escalator',
    label: 'Escalator',
    category: 'elevators',
    parentSection: 'mechanical',
    defaultEconomicLife: 25,
    defaultUnit: 'EA',
    msReference: 'Section 13',
    depreciationClass: '39-year',
  },
  {
    id: 'elevator-lift-wheelchair',
    label: 'Wheelchair Lift',
    category: 'elevators',
    parentSection: 'mechanical',
    defaultEconomicLife: 20,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'elevator-none',
    label: 'None',
    category: 'elevators',
    parentSection: 'mechanical',
    defaultEconomicLife: 0,
    defaultUnit: 'LS',
    msReference: 'Section 14',
    depreciationClass: '39-year',
  },
];

// =================================================================
// INTERIOR COMPONENT TYPES
// =================================================================

export const CEILING_TYPES: BuildingComponentType[] = [
  {
    id: 'ceiling-drop-suspended',
    label: 'Drop / Suspended (T-Bar)',
    category: 'ceilings',
    parentSection: 'interior',
    defaultEconomicLife: 20,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'ceiling-drywall',
    label: 'Drywall / Gypsum',
    category: 'ceilings',
    parentSection: 'interior',
    defaultEconomicLife: 30,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'ceiling-exposed-open',
    label: 'Exposed / Open',
    category: 'ceilings',
    parentSection: 'interior',
    defaultEconomicLife: 40,
    defaultUnit: 'SF',
    msReference: 'Section 14',
    depreciationClass: '39-year',
  },
  {
    id: 'ceiling-exposed-painted',
    label: 'Exposed & Painted',
    category: 'ceilings',
    parentSection: 'interior',
    defaultEconomicLife: 40,
    defaultUnit: 'SF',
    msReference: 'Section 14',
    depreciationClass: '39-year',
  },
  {
    id: 'ceiling-acoustic-tile',
    label: 'Acoustic Tile',
    category: 'ceilings',
    parentSection: 'interior',
    defaultEconomicLife: 20,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'ceiling-plaster',
    label: 'Plaster',
    category: 'ceilings',
    parentSection: 'interior',
    defaultEconomicLife: 35,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'ceiling-metal',
    label: 'Metal Panel',
    category: 'ceilings',
    parentSection: 'interior',
    defaultEconomicLife: 30,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'ceiling-wood',
    label: 'Wood',
    category: 'ceilings',
    parentSection: 'interior',
    defaultEconomicLife: 35,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
];

export const FLOORING_TYPES: BuildingComponentType[] = [
  {
    id: 'flooring-carpet',
    label: 'Carpet',
    category: 'flooring',
    parentSection: 'interior',
    defaultEconomicLife: 10,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '5-year',
    notes: 'Tenant improvement',
  },
  {
    id: 'flooring-carpet-tile',
    label: 'Carpet Tile',
    category: 'flooring',
    parentSection: 'interior',
    defaultEconomicLife: 12,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '5-year',
    notes: 'Tenant improvement',
  },
  {
    id: 'flooring-vct',
    label: 'VCT (Vinyl Composition)',
    category: 'flooring',
    parentSection: 'interior',
    defaultEconomicLife: 15,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'flooring-lvp-lvt',
    label: 'LVP / LVT',
    category: 'flooring',
    parentSection: 'interior',
    defaultEconomicLife: 15,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'flooring-sheet-vinyl',
    label: 'Sheet Vinyl',
    category: 'flooring',
    parentSection: 'interior',
    defaultEconomicLife: 12,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'flooring-ceramic-tile',
    label: 'Ceramic Tile',
    category: 'flooring',
    parentSection: 'interior',
    defaultEconomicLife: 30,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'flooring-porcelain-tile',
    label: 'Porcelain Tile',
    category: 'flooring',
    parentSection: 'interior',
    defaultEconomicLife: 35,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'flooring-hardwood',
    label: 'Hardwood',
    category: 'flooring',
    parentSection: 'interior',
    defaultEconomicLife: 30,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'flooring-laminate',
    label: 'Laminate',
    category: 'flooring',
    parentSection: 'interior',
    defaultEconomicLife: 15,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'flooring-concrete-sealed',
    label: 'Sealed Concrete',
    category: 'flooring',
    parentSection: 'interior',
    defaultEconomicLife: 25,
    defaultUnit: 'SF',
    msReference: 'Section 14',
    depreciationClass: '39-year',
  },
  {
    id: 'flooring-concrete-polished',
    label: 'Polished Concrete',
    category: 'flooring',
    parentSection: 'interior',
    defaultEconomicLife: 25,
    defaultUnit: 'SF',
    msReference: 'Section 14',
    depreciationClass: '39-year',
  },
  {
    id: 'flooring-epoxy',
    label: 'Epoxy Coating',
    category: 'flooring',
    parentSection: 'interior',
    defaultEconomicLife: 15,
    defaultUnit: 'SF',
    msReference: 'Section 14',
    depreciationClass: '39-year',
  },
  {
    id: 'flooring-concrete-bare',
    label: 'Bare Concrete',
    category: 'flooring',
    parentSection: 'interior',
    defaultEconomicLife: 40,
    defaultUnit: 'SF',
    msReference: 'Section 14',
    depreciationClass: '39-year',
  },
];

export const INTERIOR_WALL_TYPES: BuildingComponentType[] = [
  {
    id: 'wall-int-drywall-painted',
    label: 'Drywall (Painted)',
    category: 'walls',
    parentSection: 'interior',
    defaultEconomicLife: 25,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'wall-int-drywall-textured',
    label: 'Drywall (Textured)',
    category: 'walls',
    parentSection: 'interior',
    defaultEconomicLife: 25,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'wall-int-cmu-painted',
    label: 'CMU (Painted)',
    category: 'walls',
    parentSection: 'interior',
    defaultEconomicLife: 40,
    defaultUnit: 'SF',
    msReference: 'Section 14',
    depreciationClass: '39-year',
  },
  {
    id: 'wall-int-cmu-bare',
    label: 'CMU (Bare)',
    category: 'walls',
    parentSection: 'interior',
    defaultEconomicLife: 45,
    defaultUnit: 'SF',
    msReference: 'Section 14',
    depreciationClass: '39-year',
  },
  {
    id: 'wall-int-paneling-wood',
    label: 'Wood Paneling',
    category: 'walls',
    parentSection: 'interior',
    defaultEconomicLife: 25,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'wall-int-paneling-laminate',
    label: 'Laminate Paneling',
    category: 'walls',
    parentSection: 'interior',
    defaultEconomicLife: 20,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'wall-int-glass-partition',
    label: 'Glass Partition',
    category: 'walls',
    parentSection: 'interior',
    defaultEconomicLife: 25,
    defaultUnit: 'LF',
    msReference: 'Section 11',
    depreciationClass: '5-year',
    notes: 'Often tenant improvement',
  },
  {
    id: 'wall-int-demountable',
    label: 'Demountable Partition',
    category: 'walls',
    parentSection: 'interior',
    defaultEconomicLife: 20,
    defaultUnit: 'LF',
    msReference: 'Section 11',
    depreciationClass: '5-year',
    notes: 'Personal property',
  },
  {
    id: 'wall-int-tile-ceramic',
    label: 'Ceramic Tile',
    category: 'walls',
    parentSection: 'interior',
    defaultEconomicLife: 30,
    defaultUnit: 'SF',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'wall-int-metal-liner',
    label: 'Metal Liner Panel',
    category: 'walls',
    parentSection: 'interior',
    defaultEconomicLife: 30,
    defaultUnit: 'SF',
    msReference: 'Section 14',
    depreciationClass: '39-year',
  },
];

export const INTERIOR_PLUMBING_TYPES: BuildingComponentType[] = [
  // Restroom Fixtures
  {
    id: 'plumbing-toilet-standard',
    label: 'Toilet (Standard)',
    category: 'plumbing',
    parentSection: 'interior',
    defaultEconomicLife: 25,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'plumbing-toilet-commercial',
    label: 'Toilet (Commercial/ADA)',
    category: 'plumbing',
    parentSection: 'interior',
    defaultEconomicLife: 25,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'retail', 'institutional', 'multifamily'],
    applicablePropertyCategories: ['commercial'],
  },
  {
    id: 'plumbing-urinal',
    label: 'Urinal',
    category: 'plumbing',
    parentSection: 'interior',
    defaultEconomicLife: 25,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'retail', 'institutional', 'industrial'],
    applicablePropertyCategories: ['commercial'],
  },
  {
    id: 'plumbing-sink-lavatory',
    label: 'Sink (Lavatory)',
    category: 'plumbing',
    parentSection: 'interior',
    defaultEconomicLife: 25,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'plumbing-sink-vanity',
    label: 'Sink (Vanity with Counter)',
    category: 'plumbing',
    parentSection: 'interior',
    defaultEconomicLife: 20,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'retail', 'institutional'],
    applicablePropertyCategories: ['commercial'],
  },
  {
    id: 'plumbing-sink-kitchen',
    label: 'Kitchen Sink',
    category: 'plumbing',
    parentSection: 'interior',
    defaultEconomicLife: 20,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '5-year',
    notes: 'Often tenant improvement',
  },
  {
    id: 'plumbing-sink-utility',
    label: 'Utility/Janitor Sink',
    category: 'plumbing',
    parentSection: 'interior',
    defaultEconomicLife: 30,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'plumbing-drinking-fountain',
    label: 'Drinking Fountain',
    category: 'plumbing',
    parentSection: 'interior',
    defaultEconomicLife: 25,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'institutional', 'retail', 'industrial'],
    applicablePropertyCategories: ['commercial'],
  },
  {
    id: 'plumbing-water-cooler',
    label: 'Water Cooler',
    category: 'plumbing',
    parentSection: 'interior',
    defaultEconomicLife: 12,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '5-year',
    notes: 'Personal property',
  },
  // Specialty Fixtures
  {
    id: 'plumbing-shower',
    label: 'Shower',
    category: 'plumbing',
    parentSection: 'interior',
    defaultEconomicLife: 25,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['residential', 'multifamily', 'institutional'],
  },
  {
    id: 'plumbing-bathtub',
    label: 'Bathtub',
    category: 'plumbing',
    parentSection: 'interior',
    defaultEconomicLife: 30,
    defaultUnit: 'EA',
    msReference: 'RCH',
    depreciationClass: '27.5-year',
    applicablePropertyTypes: ['residential', 'multifamily'],
    applicablePropertyCategories: ['residential'],
  },
  {
    id: 'plumbing-floor-drain',
    label: 'Floor Drain',
    category: 'plumbing',
    parentSection: 'interior',
    defaultEconomicLife: 40,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'plumbing-exam-sink',
    label: 'Exam Room Sink (Medical)',
    category: 'plumbing',
    parentSection: 'interior',
    defaultEconomicLife: 20,
    defaultUnit: 'EA',
    msReference: 'Section 13',
    depreciationClass: '5-year',
    applicablePropertyTypes: ['institutional'],
    notes: 'Medical/dental specialty',
  },
  {
    id: 'plumbing-lab-sink',
    label: 'Lab Sink with Fixtures',
    category: 'plumbing',
    parentSection: 'interior',
    defaultEconomicLife: 20,
    defaultUnit: 'EA',
    msReference: 'Section 13',
    depreciationClass: '5-year',
    applicablePropertyTypes: ['institutional', 'industrial'],
    notes: 'Laboratory use',
  },
  {
    id: 'plumbing-commercial-kitchen',
    label: 'Commercial Kitchen Fixtures (Package)',
    category: 'plumbing',
    parentSection: 'interior',
    defaultEconomicLife: 15,
    defaultUnit: 'LS',
    msReference: 'Section 13',
    depreciationClass: '5-year',
    applicablePropertyTypes: ['retail', 'institutional'],
    notes: 'Restaurant/food service',
  },
];

export const INTERIOR_LIGHTING_TYPES: BuildingComponentType[] = [
  // General/Base Building Lighting
  {
    id: 'lighting-recessed-led',
    label: 'Recessed LED',
    category: 'lighting',
    parentSection: 'interior',
    defaultEconomicLife: 20,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    isPrimary: true,
  },
  {
    id: 'lighting-recessed-can',
    label: 'Recessed Can (Incandescent/Halogen)',
    category: 'lighting',
    parentSection: 'interior',
    defaultEconomicLife: 20,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'lighting-fluorescent-strip',
    label: 'Fluorescent Strip',
    category: 'lighting',
    parentSection: 'interior',
    defaultEconomicLife: 18,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'industrial', 'retail'],
    applicablePropertyCategories: ['commercial'],
  },
  {
    id: 'lighting-fluorescent-troffer',
    label: 'Fluorescent Troffer (2x4 or 2x2)',
    category: 'lighting',
    parentSection: 'interior',
    defaultEconomicLife: 18,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'retail', 'institutional'],
    applicablePropertyCategories: ['commercial'],
    isPrimary: true,
  },
  {
    id: 'lighting-led-panel',
    label: 'LED Panel (2x4 or 2x2)',
    category: 'lighting',
    parentSection: 'interior',
    defaultEconomicLife: 20,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'retail', 'institutional'],
    applicablePropertyCategories: ['commercial'],
    isPrimary: true,
  },
  {
    id: 'lighting-high-bay-led',
    label: 'High-Bay LED',
    category: 'lighting',
    parentSection: 'interior',
    defaultEconomicLife: 20,
    defaultUnit: 'EA',
    msReference: 'Section 14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['industrial', 'retail'],
    applicablePropertyCategories: ['commercial'],
    isPrimary: true,
    notes: 'Warehouse/industrial',
  },
  {
    id: 'lighting-high-bay-metal-halide',
    label: 'High-Bay Metal Halide',
    category: 'lighting',
    parentSection: 'interior',
    defaultEconomicLife: 15,
    defaultUnit: 'EA',
    msReference: 'Section 14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['industrial'],
    applicablePropertyCategories: ['commercial'],
    notes: 'Older warehouse lighting',
  },
  {
    id: 'lighting-track',
    label: 'Track Lighting',
    category: 'lighting',
    parentSection: 'interior',
    defaultEconomicLife: 15,
    defaultUnit: 'LF',
    msReference: 'Section 11-14',
    depreciationClass: '5-year',
    applicablePropertyTypes: ['retail', 'office'],
    notes: 'Often tenant improvement',
  },
  {
    id: 'lighting-pendant',
    label: 'Pendant Fixture',
    category: 'lighting',
    parentSection: 'interior',
    defaultEconomicLife: 20,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '5-year',
    notes: 'Decorative/accent',
  },
  {
    id: 'lighting-chandelier',
    label: 'Chandelier',
    category: 'lighting',
    parentSection: 'interior',
    defaultEconomicLife: 25,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '5-year',
    applicablePropertyTypes: ['residential', 'multifamily', 'institutional'],
    notes: 'Decorative fixture',
  },
  {
    id: 'lighting-wall-sconce',
    label: 'Wall Sconce',
    category: 'lighting',
    parentSection: 'interior',
    defaultEconomicLife: 20,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'lighting-ceiling-mount',
    label: 'Ceiling Mount Fixture',
    category: 'lighting',
    parentSection: 'interior',
    defaultEconomicLife: 20,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
  },
  {
    id: 'lighting-under-cabinet',
    label: 'Under-Cabinet Lighting',
    category: 'lighting',
    parentSection: 'interior',
    defaultEconomicLife: 12,
    defaultUnit: 'LF',
    msReference: 'Section 11-14',
    depreciationClass: '5-year',
    applicablePropertyTypes: ['residential', 'office'],
    notes: 'Task lighting',
  },
  // Safety/Emergency Lighting
  {
    id: 'lighting-emergency',
    label: 'Emergency Lighting',
    category: 'lighting',
    parentSection: 'interior',
    defaultEconomicLife: 15,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'retail', 'institutional', 'multifamily'],
    applicablePropertyCategories: ['commercial'],
  },
  {
    id: 'lighting-exit-sign',
    label: 'Exit Sign (LED)',
    category: 'lighting',
    parentSection: 'interior',
    defaultEconomicLife: 15,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['office', 'retail', 'institutional', 'multifamily'],
    applicablePropertyCategories: ['commercial'],
  },
  {
    id: 'lighting-egress',
    label: 'Egress Path Lighting',
    category: 'lighting',
    parentSection: 'interior',
    defaultEconomicLife: 15,
    defaultUnit: 'EA',
    msReference: 'Section 11-14',
    depreciationClass: '39-year',
    applicablePropertyTypes: ['institutional', 'multifamily'],
    applicablePropertyCategories: ['commercial'],
  },
];

// =================================================================
// AGGREGATED TYPE LISTS
// =================================================================

export const ALL_EXTERIOR_TYPES: BuildingComponentType[] = [
  ...FOUNDATION_TYPES,
  ...ROOFING_TYPES,
  ...EXTERIOR_WALL_TYPES,
  ...WINDOW_TYPES,
];

export const ALL_MECHANICAL_TYPES: BuildingComponentType[] = [
  ...ELECTRICAL_TYPES,
  ...HEATING_TYPES,
  ...COOLING_TYPES,
  ...FIRE_PROTECTION_TYPES,
  ...ELEVATOR_TYPES,
];

export const ALL_INTERIOR_TYPES: BuildingComponentType[] = [
  ...CEILING_TYPES,
  ...FLOORING_TYPES,
  ...INTERIOR_WALL_TYPES,
  ...INTERIOR_PLUMBING_TYPES,
  ...INTERIOR_LIGHTING_TYPES,
];

export const ALL_BUILDING_COMPONENT_TYPES: BuildingComponentType[] = [
  ...ALL_EXTERIOR_TYPES,
  ...ALL_MECHANICAL_TYPES,
  ...ALL_INTERIOR_TYPES,
];

// =================================================================
// HELPER FUNCTIONS
// =================================================================

export function getBuildingComponentType(id: string): BuildingComponentType | undefined {
  return ALL_BUILDING_COMPONENT_TYPES.find(t => t.id === id);
}

export function getBuildingComponentTypesByCategory(category: BuildingComponentCategory): BuildingComponentType[] {
  return ALL_BUILDING_COMPONENT_TYPES.filter(t => t.category === category);
}

export function getExteriorTypesByCategory(category: ExteriorCategory): BuildingComponentType[] {
  switch (category) {
    case 'foundation': return FOUNDATION_TYPES;
    case 'roofing': return ROOFING_TYPES;
    case 'walls': return EXTERIOR_WALL_TYPES;
    case 'windows': return WINDOW_TYPES;
    default: return [];
  }
}

export function getMechanicalTypesByCategory(category: MechanicalCategory): BuildingComponentType[] {
  switch (category) {
    case 'electrical': return ELECTRICAL_TYPES;
    case 'heating': return HEATING_TYPES;
    case 'cooling': return COOLING_TYPES;
    case 'fire-protection': return FIRE_PROTECTION_TYPES;
    case 'elevators': return ELEVATOR_TYPES;
    default: return [];
  }
}

export function getInteriorTypesByCategory(category: InteriorCategory): BuildingComponentType[] {
  switch (category) {
    case 'ceilings': return CEILING_TYPES;
    case 'flooring': return FLOORING_TYPES;
    case 'walls': return INTERIOR_WALL_TYPES;
    case 'plumbing': return INTERIOR_PLUMBING_TYPES;
    case 'lighting': return INTERIOR_LIGHTING_TYPES;
    default: return [];
  }
}

// =================================================================
// ECONOMIC LIFE REFERENCE GUIDE (for custom types)
// =================================================================

export const ECONOMIC_LIFE_GUIDE = {
  exterior: {
    foundation: { range: '40-50 yrs', typical: 50, examples: 'Slab 50, Pier/Beam 45, Basement 50' },
    roofing: { range: '20-75 yrs', typical: 25, examples: 'TPO 25, Metal 40, Slate 75' },
    walls: { range: '25-50 yrs', typical: 40, examples: 'Metal 35, CMU 45, Tilt-Up 50' },
    windows: { range: '20-30 yrs', typical: 25, examples: 'Single 20, Double 25, Storefront 30' },
  },
  mechanical: {
    electrical: { range: '10-40 yrs', typical: 40, examples: 'Panels 40, Solar 25, UPS 10' },
    heating: { range: '15-30 yrs', typical: 20, examples: 'Furnace 20, Boiler 25, Unit Heater 15' },
    cooling: { range: '10-25 yrs', typical: 15, examples: 'Central AC 15, RTU 18, Chiller 25' },
    'fire-protection': { range: '20-40 yrs', typical: 40, examples: 'Sprinkler 40, Alarm 20' },
    elevators: { range: '20-30 yrs', typical: 25, examples: 'Hydraulic 25, Traction 30' },
  },
  interior: {
    ceilings: { range: '20-40 yrs', typical: 25, examples: 'Drop 20, Drywall 30, Exposed 40' },
    flooring: { range: '10-40 yrs', typical: 20, examples: 'Carpet 10, VCT 15, Tile 30' },
    walls: { range: '20-45 yrs', typical: 25, examples: 'Drywall 25, CMU 40, Tile 30' },
    plumbing: { range: '15-40 yrs', typical: 25, examples: 'Fixtures 20, Water Heater 15, Piping 40' },
    lighting: { range: '10-25 yrs', typical: 15, examples: 'Fluorescent 12, LED 20, Emergency 10' },
  },
} as const;

export type EconomicLifeGuide = typeof ECONOMIC_LIFE_GUIDE;

// =================================================================
// PROPERTY TYPE FILTERING HELPERS
// =================================================================

/**
 * Check if a component is applicable for a given property type.
 * Returns true if:
 * - Component has no applicablePropertyTypes (universal)
 * - Component's applicablePropertyTypes includes the given type
 */
export function isComponentApplicableForPropertyType(
  component: BuildingComponentType,
  propertyType: ApplicablePropertyType | undefined
): boolean {
  if (!propertyType) return true;
  if (!component.applicablePropertyTypes || component.applicablePropertyTypes.length === 0) {
    return true;
  }
  return component.applicablePropertyTypes.includes(propertyType);
}

/**
 * Check if a component is applicable for a given property category.
 * Returns true if:
 * - Component has no applicablePropertyCategories (universal)
 * - Component's applicablePropertyCategories includes the given category
 */
export function isComponentApplicableForPropertyCategory(
  component: BuildingComponentType,
  propertyCategory: PropertyCategory | undefined
): boolean {
  if (!propertyCategory) return true;
  if (!component.applicablePropertyCategories || component.applicablePropertyCategories.length === 0) {
    return true;
  }
  return component.applicablePropertyCategories.includes(propertyCategory);
}

/**
 * Filter components by property type and optionally by category.
 * Returns components sorted with primary/recommended items first.
 */
export function filterComponentsByPropertyType(
  components: BuildingComponentType[],
  propertyType?: ApplicablePropertyType,
  propertyCategory?: PropertyCategory
): BuildingComponentType[] {
  const filtered = components.filter(c => 
    isComponentApplicableForPropertyType(c, propertyType) &&
    isComponentApplicableForPropertyCategory(c, propertyCategory)
  );
  
  // Sort: primary components first, then alphabetically
  return filtered.sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return a.label.localeCompare(b.label);
  });
}

/**
 * Get filtered exterior component types by category and property type.
 */
export function getFilteredExteriorTypes(
  category: ExteriorCategory,
  propertyType?: ApplicablePropertyType,
  propertyCategory?: PropertyCategory
): BuildingComponentType[] {
  const types = getExteriorTypesByCategory(category);
  return filterComponentsByPropertyType(types, propertyType, propertyCategory);
}

/**
 * Get filtered mechanical component types by category and property type.
 */
export function getFilteredMechanicalTypes(
  category: MechanicalCategory,
  propertyType?: ApplicablePropertyType,
  propertyCategory?: PropertyCategory
): BuildingComponentType[] {
  const types = getMechanicalTypesByCategory(category);
  return filterComponentsByPropertyType(types, propertyType, propertyCategory);
}

/**
 * Get filtered interior component types by category and property type.
 */
export function getFilteredInteriorTypes(
  category: InteriorCategory,
  propertyType?: ApplicablePropertyType,
  propertyCategory?: PropertyCategory
): BuildingComponentType[] {
  const types = getInteriorTypesByCategory(category);
  return filterComponentsByPropertyType(types, propertyType, propertyCategory);
}

/**
 * Map M&S occupancy code property type ID to ApplicablePropertyType.
 * Used to convert from wizard's msOccupancyCode to component filtering type.
 */
export function occupancyCodeToPropertyType(occupancyCodePropertyTypeId: string): ApplicablePropertyType | undefined {
  const mapping: Record<string, ApplicablePropertyType> = {
    'single-family': 'residential',
    'townhouse': 'residential',
    'duplex-fourplex': 'residential',
    'manufactured': 'residential',
    'adu': 'residential',
    'office': 'office',
    'retail': 'retail',
    'industrial': 'industrial',
    'multifamily': 'multifamily',
    'institutional': 'institutional',
    'agricultural': 'agricultural',
  };
  return mapping[occupancyCodePropertyTypeId];
}

/**
 * Get all components in a section filtered by property type.
 */
export function getAllExteriorTypesFiltered(
  propertyType?: ApplicablePropertyType,
  propertyCategory?: PropertyCategory
): BuildingComponentType[] {
  return filterComponentsByPropertyType(ALL_EXTERIOR_TYPES, propertyType, propertyCategory);
}

export function getAllMechanicalTypesFiltered(
  propertyType?: ApplicablePropertyType,
  propertyCategory?: PropertyCategory
): BuildingComponentType[] {
  return filterComponentsByPropertyType(ALL_MECHANICAL_TYPES, propertyType, propertyCategory);
}

export function getAllInteriorTypesFiltered(
  propertyType?: ApplicablePropertyType,
  propertyCategory?: PropertyCategory
): BuildingComponentType[] {
  return filterComponentsByPropertyType(ALL_INTERIOR_TYPES, propertyType, propertyCategory);
}

