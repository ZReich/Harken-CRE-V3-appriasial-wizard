/**
 * Cost Segregation Constants
 * 
 * IRS depreciation class mappings and component classifications based on:
 * - IRS Revenue Procedure 87-56 (Asset Class Lives)
 * - Treasury Decision 9636 (Tangible Property Regulations)
 * - MACRS depreciation schedules
 * 
 * Reference: IRC Sections 167, 168, 1245, 1250
 */

// =================================================================
// DEPRECIATION CLASSES
// =================================================================

export type DepreciationClass = '5-year' | '7-year' | '15-year' | '27.5-year' | '39-year';

export interface DepreciationClassInfo {
  id: DepreciationClass;
  label: string;
  propertyType: 'personal' | 'land-improvement' | 'real';
  irsReference: string;
  description: string;
  macrsMethod: 'DDB' | 'SL' | '150DB'; // Double Declining Balance, Straight Line, 150% DB
  halfYearConvention: boolean;
}

export const DEPRECIATION_CLASSES: DepreciationClassInfo[] = [
  {
    id: '5-year',
    label: '5-Year Personal Property',
    propertyType: 'personal',
    irsReference: 'IRC Section 1245; MACRS Asset Class 00.11-00.4',
    description: 'Tangible personal property with a 5-year recovery period. Includes furniture, fixtures, equipment, carpeting, and decorative elements.',
    macrsMethod: 'DDB',
    halfYearConvention: true,
  },
  {
    id: '7-year',
    label: '7-Year Personal Property',
    propertyType: 'personal',
    irsReference: 'IRC Section 1245; MACRS Asset Class 57.0',
    description: 'Office furniture, fixtures, and equipment not elsewhere classified.',
    macrsMethod: 'DDB',
    halfYearConvention: true,
  },
  {
    id: '15-year',
    label: '15-Year Land Improvements',
    propertyType: 'land-improvement',
    irsReference: 'IRC Section 1250; MACRS Asset Class 00.3',
    description: 'Land improvements including parking lots, sidewalks, landscaping, fencing, and site lighting.',
    macrsMethod: '150DB',
    halfYearConvention: true,
  },
  {
    id: '27.5-year',
    label: '27.5-Year Residential Rental',
    propertyType: 'real',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    description: 'Residential rental property structural components.',
    macrsMethod: 'SL',
    halfYearConvention: false, // Mid-month convention
  },
  {
    id: '39-year',
    label: '39-Year Nonresidential Real Property',
    propertyType: 'real',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    description: 'Nonresidential real property structural components including building shell, general HVAC, plumbing, and electrical.',
    macrsMethod: 'SL',
    halfYearConvention: false, // Mid-month convention
  },
];

// =================================================================
// COMPONENT CATEGORIES
// =================================================================

export type ComponentCategory = 
  | 'building-structure'
  | 'building-component'
  | 'site-improvement'
  | 'personal-property'
  | 'tenant-improvement';

export interface ComponentCategoryInfo {
  id: ComponentCategory;
  label: string;
  description: string;
  typicalDepreciationClass: DepreciationClass;
}

export const COMPONENT_CATEGORIES: ComponentCategoryInfo[] = [
  {
    id: 'building-structure',
    label: 'Building Structure',
    description: 'Core structural elements of the building including foundation, framing, and exterior envelope.',
    typicalDepreciationClass: '39-year',
  },
  {
    id: 'building-component',
    label: 'Building Component',
    description: 'Major building systems that are part of the real property.',
    typicalDepreciationClass: '39-year',
  },
  {
    id: 'site-improvement',
    label: 'Site Improvement',
    description: 'Improvements to the land surrounding the building.',
    typicalDepreciationClass: '15-year',
  },
  {
    id: 'personal-property',
    label: 'Personal Property',
    description: 'Tangible personal property that can be depreciated on an accelerated schedule.',
    typicalDepreciationClass: '5-year',
  },
  {
    id: 'tenant-improvement',
    label: 'Tenant Improvement',
    description: 'Improvements made specifically for tenant use.',
    typicalDepreciationClass: '5-year',
  },
];

// =================================================================
// COMPONENT CLASSIFICATIONS (IRS Asset Class Mapping)
// =================================================================

export interface ComponentClassification {
  id: string;
  label: string;
  category: ComponentCategory;
  defaultClass: DepreciationClass;
  alternateClass?: DepreciationClass; // Some items may qualify for shorter life
  irsReference: string;
  notes?: string;
  parentSystem?: BuildingSystem; // For IRS TD 9636 compliance
}

// IRS-defined building systems per Treasury Decision 9636
export type BuildingSystem = 
  | 'hvac'
  | 'plumbing'
  | 'electrical'
  | 'escalators-elevators'
  | 'fire-protection'
  | 'security'
  | 'gas-distribution'
  | 'structural'
  | 'other';

export const BUILDING_SYSTEMS: { id: BuildingSystem; label: string }[] = [
  { id: 'hvac', label: 'HVAC Systems' },
  { id: 'plumbing', label: 'Plumbing Systems' },
  { id: 'electrical', label: 'Electrical Systems' },
  { id: 'escalators-elevators', label: 'Escalators & Elevators' },
  { id: 'fire-protection', label: 'Fire Protection & Alarm Systems' },
  { id: 'security', label: 'Security Systems' },
  { id: 'gas-distribution', label: 'Gas Distribution Systems' },
  { id: 'structural', label: 'Structural Components' },
  { id: 'other', label: 'Other Building Components' },
];

// =================================================================
// 5-YEAR PERSONAL PROPERTY COMPONENTS
// =================================================================

export const FIVE_YEAR_COMPONENTS: ComponentClassification[] = [
  // Interior Finishes
  {
    id: 'cabinets-millwork',
    label: 'Cabinets & Millwork',
    category: 'personal-property',
    defaultClass: '5-year',
    irsReference: 'IRC Section 1245; Rev. Proc. 87-56',
    notes: 'Removable casework, built-in shelving, and decorative woodwork.',
    parentSystem: 'other',
  },
  {
    id: 'flooring-carpet',
    label: 'Flooring - Carpet',
    category: 'personal-property',
    defaultClass: '5-year',
    irsReference: 'IRC Section 1245; Rev. Proc. 87-56',
    notes: 'Carpeting including pad. Excludes structural flooring.',
    parentSystem: 'other',
  },
  {
    id: 'flooring-vct-lvt',
    label: 'Flooring - VCT/LVT',
    category: 'personal-property',
    defaultClass: '5-year',
    irsReference: 'IRC Section 1245; Rev. Proc. 87-56',
    notes: 'Vinyl composition tile and luxury vinyl tile.',
    parentSystem: 'other',
  },
  {
    id: 'wall-coverings',
    label: 'Wall Coverings',
    category: 'personal-property',
    defaultClass: '5-year',
    irsReference: 'IRC Section 1245; Rev. Proc. 87-56',
    notes: 'Wallpaper, decorative panels, and non-structural wall finishes.',
    parentSystem: 'other',
  },
  {
    id: 'accent-lighting',
    label: 'Accent/Decorative Lighting',
    category: 'personal-property',
    defaultClass: '5-year',
    irsReference: 'IRC Section 1245; Rev. Proc. 87-56',
    notes: 'Decorative fixtures, task lighting, and specialty lighting not part of base building.',
    parentSystem: 'electrical',
  },
  {
    id: 'window-treatments',
    label: 'Window Treatments',
    category: 'personal-property',
    defaultClass: '5-year',
    irsReference: 'IRC Section 1245; Rev. Proc. 87-56',
    notes: 'Blinds, shades, curtains, and draperies.',
    parentSystem: 'other',
  },
  {
    id: 'interior-signage',
    label: 'Interior Signage',
    category: 'personal-property',
    defaultClass: '5-year',
    irsReference: 'IRC Section 1245; Rev. Proc. 87-56',
    notes: 'Wayfinding, tenant identification, and decorative signage.',
    parentSystem: 'other',
  },
  {
    id: 'communication-data',
    label: 'Communication/Data Cabling',
    category: 'personal-property',
    defaultClass: '5-year',
    irsReference: 'IRC Section 1245; Rev. Proc. 87-56',
    notes: 'Low voltage cabling, data infrastructure, telecom equipment.',
    parentSystem: 'electrical',
  },
  {
    id: 'specialty-plumbing',
    label: 'Specialty Plumbing',
    category: 'personal-property',
    defaultClass: '5-year',
    irsReference: 'IRC Section 1245; Rev. Proc. 87-56',
    notes: 'Break room sinks, coffee stations, water dispensers.',
    parentSystem: 'plumbing',
  },
  {
    id: 'access-control',
    label: 'Access Control Systems',
    category: 'personal-property',
    defaultClass: '5-year',
    irsReference: 'IRC Section 1245; Rev. Proc. 87-56',
    notes: 'Card readers, keypads, and automated door systems.',
    parentSystem: 'security',
  },
  {
    id: 'interior-glass',
    label: 'Interior Glass/Partitions',
    category: 'personal-property',
    defaultClass: '5-year',
    irsReference: 'IRC Section 1245; Rev. Proc. 87-56',
    notes: 'Demountable partitions, glass office fronts.',
    parentSystem: 'other',
  },
  {
    id: 'mailboxes',
    label: 'Mailboxes & Mail Equipment',
    category: 'personal-property',
    defaultClass: '5-year',
    irsReference: 'IRC Section 1245; Rev. Proc. 87-56',
    notes: 'Mail sorting stations, package lockers.',
    parentSystem: 'other',
  },
  {
    id: 'ffe',
    label: 'Furniture, Fixtures & Equipment',
    category: 'personal-property',
    defaultClass: '5-year',
    alternateClass: '7-year',
    irsReference: 'IRC Section 1245; Rev. Proc. 87-56, Asset Class 57.0',
    notes: 'May qualify for 7-year if office furniture category.',
    parentSystem: 'other',
  },
  {
    id: 'kitchen-equipment',
    label: 'Kitchen Equipment',
    category: 'personal-property',
    defaultClass: '5-year',
    irsReference: 'IRC Section 1245; Rev. Proc. 87-56',
    notes: 'Commercial kitchen appliances and fixtures.',
    parentSystem: 'other',
  },
  {
    id: 'process-piping',
    label: 'Process/Specialty Piping',
    category: 'personal-property',
    defaultClass: '5-year',
    irsReference: 'IRC Section 1245; Rev. Proc. 87-56',
    notes: 'Specialized piping for manufacturing or process equipment.',
    parentSystem: 'plumbing',
  },
];

// =================================================================
// 15-YEAR LAND IMPROVEMENT COMPONENTS
// =================================================================

export const FIFTEEN_YEAR_COMPONENTS: ComponentClassification[] = [
  {
    id: 'parking-lot',
    label: 'Parking Lot',
    category: 'site-improvement',
    defaultClass: '15-year',
    irsReference: 'IRC Section 1250; MACRS Asset Class 00.3',
    notes: 'Asphalt or concrete paving, base course, and subgrade.',
  },
  {
    id: 'parking-striping',
    label: 'Parking Striping & Markings',
    category: 'site-improvement',
    defaultClass: '15-year',
    irsReference: 'IRC Section 1250; MACRS Asset Class 00.3',
    notes: 'Painted lines, handicap designations, directional arrows.',
  },
  {
    id: 'site-drainage',
    label: 'Site Drainage',
    category: 'site-improvement',
    defaultClass: '15-year',
    irsReference: 'IRC Section 1250; MACRS Asset Class 00.3',
    notes: 'Storm drains, catch basins, retention ponds.',
  },
  {
    id: 'sidewalks-curbs',
    label: 'Sidewalks & Curbs',
    category: 'site-improvement',
    defaultClass: '15-year',
    irsReference: 'IRC Section 1250; MACRS Asset Class 00.3',
    notes: 'Concrete walkways, curbing, and ADA ramps.',
  },
  {
    id: 'landscaping',
    label: 'Landscaping',
    category: 'site-improvement',
    defaultClass: '15-year',
    irsReference: 'IRC Section 1250; MACRS Asset Class 00.3',
    notes: 'Trees, shrubs, irrigation systems, decorative hardscape.',
  },
  {
    id: 'site-lighting',
    label: 'Site/Parking Lot Lighting',
    category: 'site-improvement',
    defaultClass: '15-year',
    irsReference: 'IRC Section 1250; MACRS Asset Class 00.3',
    notes: 'Light poles, fixtures, and wiring for exterior lighting.',
  },
  {
    id: 'fencing',
    label: 'Fencing',
    category: 'site-improvement',
    defaultClass: '15-year',
    irsReference: 'IRC Section 1250; MACRS Asset Class 00.3',
    notes: 'Security fencing, decorative fencing, gates.',
  },
  {
    id: 'exterior-signage',
    label: 'Exterior Signage',
    category: 'site-improvement',
    defaultClass: '15-year',
    irsReference: 'IRC Section 1250; MACRS Asset Class 00.3',
    notes: 'Monument signs, pylon signs, directional signage.',
  },
  {
    id: 'dumpster-enclosure',
    label: 'Dumpster Enclosure',
    category: 'site-improvement',
    defaultClass: '15-year',
    irsReference: 'IRC Section 1250; MACRS Asset Class 00.3',
    notes: 'Trash enclosure structure and gates.',
  },
  {
    id: 'equipment-pads',
    label: 'Equipment Pads',
    category: 'site-improvement',
    defaultClass: '15-year',
    irsReference: 'IRC Section 1250; MACRS Asset Class 00.3',
    notes: 'Concrete pads for HVAC equipment, transformers.',
  },
  {
    id: 'loading-docks',
    label: 'Loading Docks',
    category: 'site-improvement',
    defaultClass: '15-year',
    irsReference: 'IRC Section 1250; MACRS Asset Class 00.3',
    notes: 'Dock levelers, bumpers, and related site work.',
  },
  {
    id: 'retaining-walls',
    label: 'Retaining Walls',
    category: 'site-improvement',
    defaultClass: '15-year',
    irsReference: 'IRC Section 1250; MACRS Asset Class 00.3',
    notes: 'Site retaining walls not part of building structure.',
  },
];

// =================================================================
// 39-YEAR REAL PROPERTY COMPONENTS
// =================================================================

export const THIRTY_NINE_YEAR_COMPONENTS: ComponentClassification[] = [
  // Structural
  {
    id: 'foundation',
    label: 'Foundation',
    category: 'building-structure',
    defaultClass: '39-year',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    notes: 'Footings, slab, basement walls.',
    parentSystem: 'structural',
  },
  {
    id: 'structural-framing',
    label: 'Structural Framing',
    category: 'building-structure',
    defaultClass: '39-year',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    notes: 'Steel, concrete, or wood structural frame.',
    parentSystem: 'structural',
  },
  {
    id: 'exterior-walls',
    label: 'Exterior Walls',
    category: 'building-structure',
    defaultClass: '39-year',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    notes: 'Exterior facade, sheathing, insulation.',
    parentSystem: 'structural',
  },
  {
    id: 'roofing-system',
    label: 'Roofing Systems',
    category: 'building-component',
    defaultClass: '39-year',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    notes: 'Roof deck, membrane, insulation, flashing.',
    parentSystem: 'structural',
  },
  {
    id: 'windows-exterior',
    label: 'Windows (Exterior)',
    category: 'building-component',
    defaultClass: '39-year',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    notes: 'Window systems including frames and glazing.',
    parentSystem: 'structural',
  },
  {
    id: 'doors-exterior',
    label: 'Doors (Exterior)',
    category: 'building-component',
    defaultClass: '39-year',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    notes: 'Entry doors, overhead doors, frames, hardware.',
    parentSystem: 'structural',
  },
  // HVAC
  {
    id: 'hvac-general',
    label: 'HVAC (General)',
    category: 'building-component',
    defaultClass: '39-year',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    notes: 'Central HVAC systems, ductwork, controls.',
    parentSystem: 'hvac',
  },
  {
    id: 'hvac-distribution',
    label: 'HVAC Distribution',
    category: 'building-component',
    defaultClass: '39-year',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    notes: 'Ductwork, diffusers, VAV boxes.',
    parentSystem: 'hvac',
  },
  // Electrical
  {
    id: 'electrical-general',
    label: 'Electrical (General)',
    category: 'building-component',
    defaultClass: '39-year',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    notes: 'Service, distribution panels, branch wiring.',
    parentSystem: 'electrical',
  },
  {
    id: 'lighting-general',
    label: 'Lighting (General/Base Building)',
    category: 'building-component',
    defaultClass: '39-year',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    notes: 'General illumination, emergency lighting.',
    parentSystem: 'electrical',
  },
  // Plumbing
  {
    id: 'plumbing-general',
    label: 'Plumbing (General)',
    category: 'building-component',
    defaultClass: '39-year',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    notes: 'Water supply, waste, and vent piping.',
    parentSystem: 'plumbing',
  },
  {
    id: 'restroom-fixtures',
    label: 'Restroom Fixtures',
    category: 'building-component',
    defaultClass: '39-year',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    notes: 'Toilets, urinals, lavatories, partitions.',
    parentSystem: 'plumbing',
  },
  // Fire Protection
  {
    id: 'fire-sprinkler',
    label: 'Fire Sprinkler System',
    category: 'building-component',
    defaultClass: '39-year',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    notes: 'Sprinkler piping, heads, valves.',
    parentSystem: 'fire-protection',
  },
  {
    id: 'fire-alarm',
    label: 'Fire Alarm System',
    category: 'building-component',
    defaultClass: '39-year',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    notes: 'Detection, notification, and control panels.',
    parentSystem: 'fire-protection',
  },
  // Elevators
  {
    id: 'elevators',
    label: 'Elevators',
    category: 'building-component',
    defaultClass: '39-year',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    notes: 'Passenger and freight elevators.',
    parentSystem: 'escalators-elevators',
  },
  // Interior
  {
    id: 'interior-partitions',
    label: 'Interior Partitions (Fixed)',
    category: 'building-component',
    defaultClass: '39-year',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    notes: 'Permanent drywall partitions, corridors.',
    parentSystem: 'other',
  },
  {
    id: 'ceiling-systems',
    label: 'Ceiling Systems (Base Building)',
    category: 'building-component',
    defaultClass: '39-year',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    notes: 'Suspended ceiling grid and tile, drywall ceilings.',
    parentSystem: 'other',
  },
  {
    id: 'doors-interior',
    label: 'Doors (Interior)',
    category: 'building-component',
    defaultClass: '39-year',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    notes: 'Interior doors, frames, and hardware.',
    parentSystem: 'other',
  },
  {
    id: 'flooring-structural',
    label: 'Flooring (Structural)',
    category: 'building-component',
    defaultClass: '39-year',
    irsReference: 'IRC Section 1250; 26 U.S.C. § 168(c)',
    notes: 'Concrete floors, raised access floors.',
    parentSystem: 'structural',
  },
];

// =================================================================
// ALL COMPONENTS (Combined)
// =================================================================

export const ALL_COMPONENT_CLASSIFICATIONS: ComponentClassification[] = [
  ...FIVE_YEAR_COMPONENTS,
  ...FIFTEEN_YEAR_COMPONENTS,
  ...THIRTY_NINE_YEAR_COMPONENTS,
];

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Get component classification by ID
 */
export function getComponentClassification(componentId: string): ComponentClassification | undefined {
  return ALL_COMPONENT_CLASSIFICATIONS.find(c => c.id === componentId);
}

/**
 * Get default depreciation class for a component
 */
export function getDefaultDepreciationClass(componentId: string): DepreciationClass {
  const component = getComponentClassification(componentId);
  return component?.defaultClass || '39-year';
}

/**
 * Get components by depreciation class
 */
export function getComponentsByClass(depClass: DepreciationClass): ComponentClassification[] {
  return ALL_COMPONENT_CLASSIFICATIONS.filter(c => c.defaultClass === depClass);
}

/**
 * Get components by building system
 */
export function getComponentsBySystem(system: BuildingSystem): ComponentClassification[] {
  return ALL_COMPONENT_CLASSIFICATIONS.filter(c => c.parentSystem === system);
}

/**
 * Get depreciation class info
 */
export function getDepreciationClassInfo(depClass: DepreciationClass): DepreciationClassInfo | undefined {
  return DEPRECIATION_CLASSES.find(c => c.id === depClass);
}

/**
 * Get MACRS depreciation rate for a given year
 * Based on IRS Publication 946 Table A-1 (3-year), A-2 (5-year), etc.
 */
export function getMACRSRate(depClass: DepreciationClass, year: number): number {
  const rates: Record<DepreciationClass, number[]> = {
    '5-year': [0.2000, 0.3200, 0.1920, 0.1152, 0.1152, 0.0576],
    '7-year': [0.1429, 0.2449, 0.1749, 0.1249, 0.0893, 0.0892, 0.0893, 0.0446],
    '15-year': [0.0500, 0.0950, 0.0855, 0.0770, 0.0693, 0.0623, 0.0590, 0.0590, 0.0591, 0.0590, 0.0591, 0.0590, 0.0591, 0.0590, 0.0591, 0.0295],
    '27.5-year': Array(28).fill(0).map((_, i) => i === 0 ? 0.03636 : i === 27 ? 0.01818 : 0.03636),
    '39-year': Array(40).fill(0).map((_, i) => i === 0 ? 0.02564 : i === 39 ? 0.00107 : 0.02564),
  };
  
  const classRates = rates[depClass];
  if (!classRates || year < 1 || year > classRates.length) {
    return 0;
  }
  
  return classRates[year - 1];
}

/**
 * Calculate accumulated depreciation through a given year
 */
export function getAccumulatedDepreciation(depClass: DepreciationClass, cost: number, throughYear: number): number {
  let accumulated = 0;
  for (let year = 1; year <= throughYear; year++) {
    accumulated += cost * getMACRSRate(depClass, year);
  }
  return accumulated;
}

/**
 * Calculate remaining book value at end of a given year
 */
export function getRemainingBookValue(depClass: DepreciationClass, cost: number, atYear: number): number {
  return cost - getAccumulatedDepreciation(depClass, cost, atYear);
}

// =================================================================
// COMPONENT ALLOCATION TABLES BY OCCUPANCY TYPE
// =================================================================

/**
 * Represents a single component allocation within an occupancy type.
 * Percentages are based on M&S cost breakdown data and industry standards.
 */
export interface ComponentAllocationEntry {
  componentId: string;           // References ComponentClassification.id
  percentOfBuildingCost: number; // Percentage of total building cost (0.00 - 1.00)
  notes?: string;
}

/**
 * Represents component allocations for a specific occupancy type.
 * These percentages are used to break down total building cost into
 * individual components for cost segregation analysis.
 */
export interface OccupancyComponentAllocation {
  occupancyCode: string;
  occupancyLabel: string;
  description: string;
  components: ComponentAllocationEntry[];
  
  // Summary percentages (calculated from components)
  summary?: {
    fiveYearPercent: number;
    fifteenYearPercent: number;
    thirtyNineYearPercent: number;
  };
}

/**
 * Component allocation tables by occupancy type.
 * Based on Marshall & Swift cost breakdown data and industry cost segregation studies.
 * 
 * NOTE: These are representative percentages. Actual allocations should be
 * verified against detailed engineering studies for IRS compliance.
 */
export const OCCUPANCY_COMPONENT_ALLOCATIONS: OccupancyComponentAllocation[] = [
  // =================================================================
  // OFFICE BUILDINGS
  // =================================================================
  {
    occupancyCode: 'office-lowrise',
    occupancyLabel: 'Office - Low Rise (1-3 Stories)',
    description: 'Low-rise office buildings with typical build-out.',
    components: [
      // 39-Year Components (approx. 78%)
      { componentId: 'foundation', percentOfBuildingCost: 0.06 },
      { componentId: 'structural-framing', percentOfBuildingCost: 0.14 },
      { componentId: 'exterior-walls', percentOfBuildingCost: 0.08 },
      { componentId: 'roofing-system', percentOfBuildingCost: 0.04 },
      { componentId: 'windows-exterior', percentOfBuildingCost: 0.03 },
      { componentId: 'doors-exterior', percentOfBuildingCost: 0.01 },
      { componentId: 'hvac-general', percentOfBuildingCost: 0.10 },
      { componentId: 'hvac-distribution', percentOfBuildingCost: 0.04 },
      { componentId: 'electrical-general', percentOfBuildingCost: 0.06 },
      { componentId: 'lighting-general', percentOfBuildingCost: 0.04 },
      { componentId: 'plumbing-general', percentOfBuildingCost: 0.05 },
      { componentId: 'restroom-fixtures', percentOfBuildingCost: 0.02 },
      { componentId: 'fire-sprinkler', percentOfBuildingCost: 0.03 },
      { componentId: 'fire-alarm', percentOfBuildingCost: 0.01 },
      { componentId: 'interior-partitions', percentOfBuildingCost: 0.04 },
      { componentId: 'ceiling-systems', percentOfBuildingCost: 0.02 },
      { componentId: 'doors-interior', percentOfBuildingCost: 0.01 },
      // 5-Year Components (approx. 10%)
      { componentId: 'cabinets-millwork', percentOfBuildingCost: 0.02 },
      { componentId: 'flooring-carpet', percentOfBuildingCost: 0.03 },
      { componentId: 'wall-coverings', percentOfBuildingCost: 0.01 },
      { componentId: 'accent-lighting', percentOfBuildingCost: 0.01 },
      { componentId: 'window-treatments', percentOfBuildingCost: 0.005 },
      { componentId: 'interior-signage', percentOfBuildingCost: 0.005 },
      { componentId: 'communication-data', percentOfBuildingCost: 0.015 },
      { componentId: 'access-control', percentOfBuildingCost: 0.005 },
    ],
    summary: {
      fiveYearPercent: 0.10,
      fifteenYearPercent: 0.00, // Site improvements calculated separately
      thirtyNineYearPercent: 0.78,
    },
  },
  {
    occupancyCode: 'office-highrise',
    occupancyLabel: 'Office - High Rise (4+ Stories)',
    description: 'High-rise office buildings with elevator service.',
    components: [
      // 39-Year Components (approx. 80%)
      { componentId: 'foundation', percentOfBuildingCost: 0.07 },
      { componentId: 'structural-framing', percentOfBuildingCost: 0.16 },
      { componentId: 'exterior-walls', percentOfBuildingCost: 0.10 },
      { componentId: 'roofing-system', percentOfBuildingCost: 0.02 },
      { componentId: 'windows-exterior', percentOfBuildingCost: 0.05 },
      { componentId: 'doors-exterior', percentOfBuildingCost: 0.01 },
      { componentId: 'hvac-general', percentOfBuildingCost: 0.08 },
      { componentId: 'hvac-distribution', percentOfBuildingCost: 0.04 },
      { componentId: 'electrical-general', percentOfBuildingCost: 0.06 },
      { componentId: 'lighting-general', percentOfBuildingCost: 0.04 },
      { componentId: 'plumbing-general', percentOfBuildingCost: 0.04 },
      { componentId: 'restroom-fixtures', percentOfBuildingCost: 0.02 },
      { componentId: 'fire-sprinkler', percentOfBuildingCost: 0.03 },
      { componentId: 'fire-alarm', percentOfBuildingCost: 0.01 },
      { componentId: 'elevators', percentOfBuildingCost: 0.05 },
      { componentId: 'interior-partitions', percentOfBuildingCost: 0.03 },
      { componentId: 'ceiling-systems', percentOfBuildingCost: 0.02 },
      { componentId: 'doors-interior', percentOfBuildingCost: 0.01 },
      // 5-Year Components (approx. 8%)
      { componentId: 'cabinets-millwork', percentOfBuildingCost: 0.015 },
      { componentId: 'flooring-carpet', percentOfBuildingCost: 0.025 },
      { componentId: 'wall-coverings', percentOfBuildingCost: 0.01 },
      { componentId: 'accent-lighting', percentOfBuildingCost: 0.01 },
      { componentId: 'window-treatments', percentOfBuildingCost: 0.005 },
      { componentId: 'communication-data', percentOfBuildingCost: 0.01 },
      { componentId: 'access-control', percentOfBuildingCost: 0.005 },
    ],
    summary: {
      fiveYearPercent: 0.08,
      fifteenYearPercent: 0.00,
      thirtyNineYearPercent: 0.84,
    },
  },
  
  // =================================================================
  // RETAIL BUILDINGS
  // =================================================================
  {
    occupancyCode: 'retail-strip',
    occupancyLabel: 'Retail - Strip Center',
    description: 'Single-story strip retail center.',
    components: [
      // 39-Year Components (approx. 82%)
      { componentId: 'foundation', percentOfBuildingCost: 0.08 },
      { componentId: 'structural-framing', percentOfBuildingCost: 0.12 },
      { componentId: 'exterior-walls', percentOfBuildingCost: 0.10 },
      { componentId: 'roofing-system', percentOfBuildingCost: 0.06 },
      { componentId: 'windows-exterior', percentOfBuildingCost: 0.04 },
      { componentId: 'doors-exterior', percentOfBuildingCost: 0.02 },
      { componentId: 'hvac-general', percentOfBuildingCost: 0.12 },
      { componentId: 'electrical-general', percentOfBuildingCost: 0.08 },
      { componentId: 'lighting-general', percentOfBuildingCost: 0.05 },
      { componentId: 'plumbing-general', percentOfBuildingCost: 0.04 },
      { componentId: 'restroom-fixtures', percentOfBuildingCost: 0.02 },
      { componentId: 'fire-sprinkler', percentOfBuildingCost: 0.03 },
      { componentId: 'fire-alarm', percentOfBuildingCost: 0.01 },
      { componentId: 'interior-partitions', percentOfBuildingCost: 0.03 },
      { componentId: 'ceiling-systems', percentOfBuildingCost: 0.02 },
      // 5-Year Components (approx. 6%)
      { componentId: 'cabinets-millwork', percentOfBuildingCost: 0.01 },
      { componentId: 'flooring-vct-lvt', percentOfBuildingCost: 0.02 },
      { componentId: 'interior-signage', percentOfBuildingCost: 0.01 },
      { componentId: 'accent-lighting', percentOfBuildingCost: 0.01 },
      { componentId: 'communication-data', percentOfBuildingCost: 0.01 },
    ],
    summary: {
      fiveYearPercent: 0.06,
      fifteenYearPercent: 0.00,
      thirtyNineYearPercent: 0.82,
    },
  },
  
  // =================================================================
  // INDUSTRIAL/WAREHOUSE
  // =================================================================
  {
    occupancyCode: 'warehouse-distribution',
    occupancyLabel: 'Warehouse/Distribution',
    description: 'Distribution center or general warehouse.',
    components: [
      // 39-Year Components (approx. 88%)
      { componentId: 'foundation', percentOfBuildingCost: 0.12 },
      { componentId: 'structural-framing', percentOfBuildingCost: 0.20 },
      { componentId: 'exterior-walls', percentOfBuildingCost: 0.14 },
      { componentId: 'roofing-system', percentOfBuildingCost: 0.08 },
      { componentId: 'doors-exterior', percentOfBuildingCost: 0.04, notes: 'Includes overhead doors' },
      { componentId: 'hvac-general', percentOfBuildingCost: 0.06 },
      { componentId: 'electrical-general', percentOfBuildingCost: 0.10 },
      { componentId: 'lighting-general', percentOfBuildingCost: 0.06 },
      { componentId: 'plumbing-general', percentOfBuildingCost: 0.03 },
      { componentId: 'restroom-fixtures', percentOfBuildingCost: 0.01 },
      { componentId: 'fire-sprinkler', percentOfBuildingCost: 0.04 },
      // 5-Year Components (approx. 2%)
      { componentId: 'flooring-vct-lvt', percentOfBuildingCost: 0.005, notes: 'Office area only' },
      { componentId: 'cabinets-millwork', percentOfBuildingCost: 0.005 },
      { componentId: 'communication-data', percentOfBuildingCost: 0.01 },
    ],
    summary: {
      fiveYearPercent: 0.02,
      fifteenYearPercent: 0.00,
      thirtyNineYearPercent: 0.88,
    },
  },
  {
    occupancyCode: 'manufacturing-light',
    occupancyLabel: 'Light Manufacturing',
    description: 'Light industrial manufacturing facility.',
    components: [
      // 39-Year Components (approx. 85%)
      { componentId: 'foundation', percentOfBuildingCost: 0.10 },
      { componentId: 'structural-framing', percentOfBuildingCost: 0.18 },
      { componentId: 'exterior-walls', percentOfBuildingCost: 0.12 },
      { componentId: 'roofing-system', percentOfBuildingCost: 0.06 },
      { componentId: 'doors-exterior', percentOfBuildingCost: 0.03 },
      { componentId: 'hvac-general', percentOfBuildingCost: 0.08 },
      { componentId: 'electrical-general', percentOfBuildingCost: 0.12 },
      { componentId: 'lighting-general', percentOfBuildingCost: 0.06 },
      { componentId: 'plumbing-general', percentOfBuildingCost: 0.04 },
      { componentId: 'fire-sprinkler', percentOfBuildingCost: 0.04 },
      { componentId: 'fire-alarm', percentOfBuildingCost: 0.02 },
      // 5-Year Components (approx. 5%)
      { componentId: 'process-piping', percentOfBuildingCost: 0.02 },
      { componentId: 'flooring-vct-lvt', percentOfBuildingCost: 0.01 },
      { componentId: 'cabinets-millwork', percentOfBuildingCost: 0.01 },
      { componentId: 'communication-data', percentOfBuildingCost: 0.01 },
    ],
    summary: {
      fiveYearPercent: 0.05,
      fifteenYearPercent: 0.00,
      thirtyNineYearPercent: 0.85,
    },
  },
  
  // =================================================================
  // MULTIFAMILY RESIDENTIAL
  // =================================================================
  {
    occupancyCode: 'apartment-garden',
    occupancyLabel: 'Apartment - Garden Style',
    description: 'Garden-style apartment complex (1-3 stories, no elevator).',
    components: [
      // 27.5-Year Components (residential real property - approx. 75%)
      { componentId: 'foundation', percentOfBuildingCost: 0.06 },
      { componentId: 'structural-framing', percentOfBuildingCost: 0.14 },
      { componentId: 'exterior-walls', percentOfBuildingCost: 0.10 },
      { componentId: 'roofing-system', percentOfBuildingCost: 0.05 },
      { componentId: 'windows-exterior', percentOfBuildingCost: 0.04 },
      { componentId: 'doors-exterior', percentOfBuildingCost: 0.02 },
      { componentId: 'hvac-general', percentOfBuildingCost: 0.10 },
      { componentId: 'electrical-general', percentOfBuildingCost: 0.06 },
      { componentId: 'lighting-general', percentOfBuildingCost: 0.03 },
      { componentId: 'plumbing-general', percentOfBuildingCost: 0.06 },
      { componentId: 'restroom-fixtures', percentOfBuildingCost: 0.04 },
      { componentId: 'fire-sprinkler', percentOfBuildingCost: 0.02 },
      { componentId: 'fire-alarm', percentOfBuildingCost: 0.01 },
      { componentId: 'interior-partitions', percentOfBuildingCost: 0.02 },
      // 5-Year Components (approx. 12%)
      { componentId: 'cabinets-millwork', percentOfBuildingCost: 0.04, notes: 'Kitchen cabinets' },
      { componentId: 'flooring-carpet', percentOfBuildingCost: 0.03 },
      { componentId: 'flooring-vct-lvt', percentOfBuildingCost: 0.02 },
      { componentId: 'kitchen-equipment', percentOfBuildingCost: 0.02, notes: 'Appliances' },
      { componentId: 'window-treatments', percentOfBuildingCost: 0.01 },
    ],
    summary: {
      fiveYearPercent: 0.12,
      fifteenYearPercent: 0.00,
      thirtyNineYearPercent: 0.75, // Note: Residential uses 27.5-year
    },
  },
  
  // =================================================================
  // HOSPITALITY
  // =================================================================
  {
    occupancyCode: 'hotel-limited-service',
    occupancyLabel: 'Hotel - Limited Service',
    description: 'Limited service hotel/motel.',
    components: [
      // 39-Year Components (approx. 68%)
      { componentId: 'foundation', percentOfBuildingCost: 0.05 },
      { componentId: 'structural-framing', percentOfBuildingCost: 0.12 },
      { componentId: 'exterior-walls', percentOfBuildingCost: 0.08 },
      { componentId: 'roofing-system', percentOfBuildingCost: 0.04 },
      { componentId: 'windows-exterior', percentOfBuildingCost: 0.03 },
      { componentId: 'doors-exterior', percentOfBuildingCost: 0.02 },
      { componentId: 'hvac-general', percentOfBuildingCost: 0.10 },
      { componentId: 'electrical-general', percentOfBuildingCost: 0.06 },
      { componentId: 'lighting-general', percentOfBuildingCost: 0.04 },
      { componentId: 'plumbing-general', percentOfBuildingCost: 0.06 },
      { componentId: 'restroom-fixtures', percentOfBuildingCost: 0.04 },
      { componentId: 'fire-sprinkler', percentOfBuildingCost: 0.02 },
      { componentId: 'fire-alarm', percentOfBuildingCost: 0.01 },
      { componentId: 'elevators', percentOfBuildingCost: 0.01 },
      // 5-Year Components (approx. 18%)
      { componentId: 'cabinets-millwork', percentOfBuildingCost: 0.04 },
      { componentId: 'flooring-carpet', percentOfBuildingCost: 0.04 },
      { componentId: 'wall-coverings', percentOfBuildingCost: 0.02 },
      { componentId: 'window-treatments', percentOfBuildingCost: 0.02 },
      { componentId: 'accent-lighting', percentOfBuildingCost: 0.02 },
      { componentId: 'interior-signage', percentOfBuildingCost: 0.01 },
      { componentId: 'communication-data', percentOfBuildingCost: 0.02 },
      { componentId: 'access-control', percentOfBuildingCost: 0.01 },
    ],
    summary: {
      fiveYearPercent: 0.18,
      fifteenYearPercent: 0.00,
      thirtyNineYearPercent: 0.68,
    },
  },
  
  // =================================================================
  // MEDICAL/HEALTHCARE
  // =================================================================
  {
    occupancyCode: 'medical-office',
    occupancyLabel: 'Medical Office Building',
    description: 'Medical office building with clinical space.',
    components: [
      // 39-Year Components (approx. 76%)
      { componentId: 'foundation', percentOfBuildingCost: 0.06 },
      { componentId: 'structural-framing', percentOfBuildingCost: 0.12 },
      { componentId: 'exterior-walls', percentOfBuildingCost: 0.08 },
      { componentId: 'roofing-system', percentOfBuildingCost: 0.04 },
      { componentId: 'windows-exterior', percentOfBuildingCost: 0.03 },
      { componentId: 'doors-exterior', percentOfBuildingCost: 0.01 },
      { componentId: 'hvac-general', percentOfBuildingCost: 0.12 },
      { componentId: 'hvac-distribution', percentOfBuildingCost: 0.04 },
      { componentId: 'electrical-general', percentOfBuildingCost: 0.08 },
      { componentId: 'lighting-general', percentOfBuildingCost: 0.04 },
      { componentId: 'plumbing-general', percentOfBuildingCost: 0.06 },
      { componentId: 'restroom-fixtures', percentOfBuildingCost: 0.02 },
      { componentId: 'fire-sprinkler', percentOfBuildingCost: 0.03 },
      { componentId: 'fire-alarm', percentOfBuildingCost: 0.01 },
      { componentId: 'interior-partitions', percentOfBuildingCost: 0.02 },
      // 5-Year Components (approx. 12%)
      { componentId: 'cabinets-millwork', percentOfBuildingCost: 0.04, notes: 'Casework, exam room cabinets' },
      { componentId: 'flooring-vct-lvt', percentOfBuildingCost: 0.03 },
      { componentId: 'specialty-plumbing', percentOfBuildingCost: 0.02, notes: 'Exam room sinks' },
      { componentId: 'accent-lighting', percentOfBuildingCost: 0.01 },
      { componentId: 'communication-data', percentOfBuildingCost: 0.02 },
    ],
    summary: {
      fiveYearPercent: 0.12,
      fifteenYearPercent: 0.00,
      thirtyNineYearPercent: 0.76,
    },
  },
];

// =================================================================
// SITE IMPROVEMENT ALLOCATIONS
// =================================================================

/**
 * Typical site improvement allocations as percentage of total project cost.
 * Site improvements are generally 10-15% of total project cost.
 */
export interface SiteImprovementAllocation {
  componentId: string;
  typicalPercentOfSiteCost: number;
}

export const SITE_IMPROVEMENT_ALLOCATIONS: SiteImprovementAllocation[] = [
  { componentId: 'parking-lot', typicalPercentOfSiteCost: 0.45 },
  { componentId: 'parking-striping', typicalPercentOfSiteCost: 0.02 },
  { componentId: 'sidewalks-curbs', typicalPercentOfSiteCost: 0.10 },
  { componentId: 'landscaping', typicalPercentOfSiteCost: 0.15 },
  { componentId: 'site-lighting', typicalPercentOfSiteCost: 0.08 },
  { componentId: 'site-drainage', typicalPercentOfSiteCost: 0.08 },
  { componentId: 'fencing', typicalPercentOfSiteCost: 0.04 },
  { componentId: 'exterior-signage', typicalPercentOfSiteCost: 0.03 },
  { componentId: 'dumpster-enclosure', typicalPercentOfSiteCost: 0.02 },
  { componentId: 'equipment-pads', typicalPercentOfSiteCost: 0.02 },
  { componentId: 'retaining-walls', typicalPercentOfSiteCost: 0.01 },
];

// =================================================================
// ALLOCATION HELPER FUNCTIONS
// =================================================================

/**
 * Get component allocation for an occupancy type
 */
export function getOccupancyAllocation(occupancyCode: string): OccupancyComponentAllocation | undefined {
  return OCCUPANCY_COMPONENT_ALLOCATIONS.find(a => a.occupancyCode === occupancyCode);
}

/**
 * Calculate component costs based on total building cost and occupancy type
 */
export function calculateComponentCosts(
  occupancyCode: string,
  totalBuildingCost: number
): Array<{ componentId: string; label: string; cost: number; depreciationClass: DepreciationClass }> {
  const allocation = getOccupancyAllocation(occupancyCode);
  if (!allocation) {
    return [];
  }
  
  return allocation.components.map(entry => {
    const classification = getComponentClassification(entry.componentId);
    return {
      componentId: entry.componentId,
      label: classification?.label || entry.componentId,
      cost: Math.round(totalBuildingCost * entry.percentOfBuildingCost),
      depreciationClass: classification?.defaultClass || '39-year',
    };
  });
}

/**
 * Calculate site improvement costs based on total site cost
 */
export function calculateSiteImprovementCosts(
  totalSiteCost: number
): Array<{ componentId: string; label: string; cost: number }> {
  return SITE_IMPROVEMENT_ALLOCATIONS.map(entry => {
    const classification = getComponentClassification(entry.componentId);
    return {
      componentId: entry.componentId,
      label: classification?.label || entry.componentId,
      cost: Math.round(totalSiteCost * entry.typicalPercentOfSiteCost),
    };
  });
}

/**
 * Calculate summary by depreciation class for a given occupancy
 */
export function calculateDepreciationClassSummary(
  occupancyCode: string,
  totalBuildingCost: number,
  totalSiteCost: number = 0
): {
  fiveYear: { cost: number; percent: number };
  fifteenYear: { cost: number; percent: number };
  thirtyNineYear: { cost: number; percent: number };
  total: number;
} {
  const componentCosts = calculateComponentCosts(occupancyCode, totalBuildingCost);
  
  let fiveYearCost = 0;
  let thirtyNineYearCost = 0;
  
  componentCosts.forEach(c => {
    if (c.depreciationClass === '5-year' || c.depreciationClass === '7-year') {
      fiveYearCost += c.cost;
    } else {
      thirtyNineYearCost += c.cost;
    }
  });
  
  // Site improvements are 15-year
  const fifteenYearCost = totalSiteCost;
  
  const total = fiveYearCost + fifteenYearCost + thirtyNineYearCost;
  
  return {
    fiveYear: {
      cost: fiveYearCost,
      percent: total > 0 ? fiveYearCost / total : 0,
    },
    fifteenYear: {
      cost: fifteenYearCost,
      percent: total > 0 ? fifteenYearCost / total : 0,
    },
    thirtyNineYear: {
      cost: thirtyNineYearCost,
      percent: total > 0 ? thirtyNineYearCost / total : 0,
    },
    total,
  };
}

