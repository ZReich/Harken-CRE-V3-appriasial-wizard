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

// =================================================================
// CSSI-STYLE COMPONENT NAMES & M&S MAPPINGS
// =================================================================

/**
 * CSSI-style display names for components.
 * These match the naming conventions used in professional cost segregation reports.
 */
export const CSSI_COMPONENT_NAMES: Record<string, string> = {
  // 5-Year Personal Property
  'cabinets-millwork': 'Cabinets / Millwork',
  'cabinets-restroom': 'Cabinets / Millwork - Restrooms',
  'moldings': 'Moldings',
  'raised-paneling': 'Raised Wood Paneling',
  'flooring-carpet': 'Flooring - Carpet',
  'flooring-vct-lvt': 'Flooring - VCT/LVT',
  'flooring-tile': 'Ceramic Tile Flooring',
  'flooring-concrete': 'Flooring - Sealed Concrete',
  'wall-coverings': 'Wall Coverings',
  'interior-half-walls': 'Interior Half Walls',
  'accent-lighting': 'Accent Lighting',
  'emergency-lighting': 'Emergency Lighting',
  'security-system': 'Security System',
  'access-control': 'Access Control Systems',
  'window-treatments': 'Window Treatments',
  'building-signage': 'Building Signage',
  'interior-signage': 'Interior Signage',
  'specialty-electrical': 'Specialty Electrical - Office Appliances / Equipment',
  'communication-data': 'Communication / Data',
  'specialty-plumbing': 'Specialty Plumbing - Break / Floor / Utility Sinks',
  'interior-glass': 'Interior Windows',
  'interior-windows': 'Interior Windows',
  'ffe': 'FFE',
  'kitchen-equipment': 'Kitchen Equipment',
  'process-piping': 'Process / Specialty Piping',
  'mailboxes': 'Mailboxes & Mail Equipment',
  
  // 15-Year Land Improvements
  'parking-lot': 'Parking / Paving',
  'parking-striping': 'Parking Striping & Markings',
  'sidewalks-curbs': 'Sidewalks & Curbs',
  'landscaping': 'Landscaping',
  'fencing': 'Fencing',
  'site-lighting': 'Site Lighting',
  'exterior-signage': 'Monument / Exterior Signage',
  'site-drainage': 'Drainage Systems',
  'dumpster-enclosure': 'Dumpster Enclosure',
  'equipment-pads': 'Equipment Pads',
  'loading-docks': 'Loading Docks',
  'retaining-walls': 'Retaining Walls',
  
  // 39-Year Real Property (Building Structure)
  'hvac-general': 'HVAC',
  'hvac-distribution': 'HVAC Distribution',
  'electrical-general': 'Electrical',
  'lighting-general': 'Lighting (Base Building)',
  'plumbing-general': 'Plumbing',
  'restroom-fixtures': 'Restroom Fixtures',
  'doors-exterior': 'Doors & Frames (Exterior)',
  'doors-interior': 'Doors & Frames (Interior)',
  'windows-exterior': 'Windows',
  'ceiling-systems': 'Ceiling Systems',
  'interior-partitions': 'Interior Framing / Partitions',
  'structural-framing': 'Structural Framing',
  'foundation': 'Foundation',
  'exterior-walls': 'Exterior Walls',
  'roofing-system': 'Roofing System',
  'fire-sprinkler': 'Fire Sprinkler System',
  'fire-alarm': 'Fire Alarm System',
  'elevators': 'Elevators',
  'flooring-structural': 'Flooring - Structural',
  'toilet-partitions': 'Toilet Partitions & Accessories',
  'painting': 'Painting',
};

/**
 * CostSegAllocation interface for M&S-based component allocations.
 */
export interface CostSegAllocation {
  componentId: string;
  percent: number;
  depreciationClass: DepreciationClass;
}

/**
 * M&S-based cost segregation allocations by occupancy type.
 * These provide CSSI-style granular percentages for each component.
 */
export const MS_COST_SEG_ALLOCATIONS: Record<string, CostSegAllocation[]> = {
  // =================================================================
  // OFFICE - LOW RISE
  // =================================================================
  'office-lowrise': [
    // 5-Year Personal Property (~25% typical for tenant improvements)
    { componentId: 'cabinets-millwork', percent: 4.0, depreciationClass: '5-year' },
    { componentId: 'moldings', percent: 0.4, depreciationClass: '5-year' },
    { componentId: 'flooring-carpet', percent: 5.0, depreciationClass: '5-year' },
    { componentId: 'wall-coverings', percent: 1.5, depreciationClass: '5-year' },
    { componentId: 'interior-half-walls', percent: 1.0, depreciationClass: '5-year' },
    { componentId: 'accent-lighting', percent: 1.5, depreciationClass: '5-year' },
    { componentId: 'security-system', percent: 1.0, depreciationClass: '5-year' },
    { componentId: 'window-treatments', percent: 1.0, depreciationClass: '5-year' },
    { componentId: 'building-signage', percent: 1.5, depreciationClass: '5-year' },
    { componentId: 'specialty-electrical', percent: 1.0, depreciationClass: '5-year' },
    { componentId: 'communication-data', percent: 5.0, depreciationClass: '5-year' },
    { componentId: 'specialty-plumbing', percent: 0.5, depreciationClass: '5-year' },
    { componentId: 'interior-windows', percent: 1.0, depreciationClass: '5-year' },
    { componentId: 'ffe', percent: 2.5, depreciationClass: '5-year' },
    // 39-Year Real Property (~75% typical)
    { componentId: 'hvac-general', percent: 15.0, depreciationClass: '39-year' },
    { componentId: 'electrical-general', percent: 12.0, depreciationClass: '39-year' },
    { componentId: 'plumbing-general', percent: 8.0, depreciationClass: '39-year' },
    { componentId: 'doors-interior', percent: 4.0, depreciationClass: '39-year' },
    { componentId: 'windows-exterior', percent: 3.0, depreciationClass: '39-year' },
    { componentId: 'ceiling-systems', percent: 5.0, depreciationClass: '39-year' },
    { componentId: 'interior-partitions', percent: 8.0, depreciationClass: '39-year' },
    { componentId: 'painting', percent: 3.0, depreciationClass: '39-year' },
    { componentId: 'structural-framing', percent: 8.0, depreciationClass: '39-year' },
    { componentId: 'flooring-structural', percent: 2.0, depreciationClass: '39-year' },
    { componentId: 'toilet-partitions', percent: 1.0, depreciationClass: '39-year' },
    { componentId: 'cabinets-restroom', percent: 0.5, depreciationClass: '39-year' },
    { componentId: 'emergency-lighting', percent: 0.5, depreciationClass: '39-year' },
  ],

  // =================================================================
  // OFFICE - HIGH RISE
  // =================================================================
  'office-highrise': [
    // 5-Year Personal Property (~20%)
    { componentId: 'cabinets-millwork', percent: 3.0, depreciationClass: '5-year' },
    { componentId: 'moldings', percent: 0.3, depreciationClass: '5-year' },
    { componentId: 'flooring-carpet', percent: 4.0, depreciationClass: '5-year' },
    { componentId: 'wall-coverings', percent: 1.2, depreciationClass: '5-year' },
    { componentId: 'accent-lighting', percent: 1.2, depreciationClass: '5-year' },
    { componentId: 'security-system', percent: 1.0, depreciationClass: '5-year' },
    { componentId: 'window-treatments', percent: 0.8, depreciationClass: '5-year' },
    { componentId: 'building-signage', percent: 1.0, depreciationClass: '5-year' },
    { componentId: 'specialty-electrical', percent: 0.8, depreciationClass: '5-year' },
    { componentId: 'communication-data', percent: 4.0, depreciationClass: '5-year' },
    { componentId: 'specialty-plumbing', percent: 0.4, depreciationClass: '5-year' },
    { componentId: 'interior-windows', percent: 0.8, depreciationClass: '5-year' },
    { componentId: 'ffe', percent: 2.0, depreciationClass: '5-year' },
    // 39-Year Real Property (~80%)
    { componentId: 'hvac-general', percent: 14.0, depreciationClass: '39-year' },
    { componentId: 'electrical-general', percent: 11.0, depreciationClass: '39-year' },
    { componentId: 'plumbing-general', percent: 7.0, depreciationClass: '39-year' },
    { componentId: 'doors-interior', percent: 3.5, depreciationClass: '39-year' },
    { componentId: 'windows-exterior', percent: 5.0, depreciationClass: '39-year' },
    { componentId: 'ceiling-systems', percent: 4.5, depreciationClass: '39-year' },
    { componentId: 'interior-partitions', percent: 7.0, depreciationClass: '39-year' },
    { componentId: 'painting', percent: 2.5, depreciationClass: '39-year' },
    { componentId: 'structural-framing', percent: 16.0, depreciationClass: '39-year' },
    { componentId: 'elevators', percent: 5.0, depreciationClass: '39-year' },
    { componentId: 'flooring-structural', percent: 2.0, depreciationClass: '39-year' },
    { componentId: 'toilet-partitions', percent: 0.8, depreciationClass: '39-year' },
  ],

  // =================================================================
  // RETAIL - STRIP CENTER
  // =================================================================
  'retail-strip': [
    // 5-Year Personal Property (~15%)
    { componentId: 'cabinets-millwork', percent: 2.5, depreciationClass: '5-year' },
    { componentId: 'flooring-carpet', percent: 1.5, depreciationClass: '5-year' },
    { componentId: 'flooring-vct-lvt', percent: 3.0, depreciationClass: '5-year' },
    { componentId: 'wall-coverings', percent: 1.0, depreciationClass: '5-year' },
    { componentId: 'accent-lighting', percent: 2.0, depreciationClass: '5-year' },
    { componentId: 'security-system', percent: 1.0, depreciationClass: '5-year' },
    { componentId: 'building-signage', percent: 2.0, depreciationClass: '5-year' },
    { componentId: 'communication-data', percent: 1.5, depreciationClass: '5-year' },
    { componentId: 'specialty-plumbing', percent: 0.5, depreciationClass: '5-year' },
    // 39-Year Real Property (~85%)
    { componentId: 'hvac-general', percent: 14.0, depreciationClass: '39-year' },
    { componentId: 'electrical-general', percent: 12.0, depreciationClass: '39-year' },
    { componentId: 'plumbing-general', percent: 6.0, depreciationClass: '39-year' },
    { componentId: 'doors-exterior', percent: 3.0, depreciationClass: '39-year' },
    { componentId: 'doors-interior', percent: 2.0, depreciationClass: '39-year' },
    { componentId: 'windows-exterior', percent: 8.0, depreciationClass: '39-year' },
    { componentId: 'ceiling-systems', percent: 4.0, depreciationClass: '39-year' },
    { componentId: 'interior-partitions', percent: 5.0, depreciationClass: '39-year' },
    { componentId: 'painting', percent: 2.5, depreciationClass: '39-year' },
    { componentId: 'structural-framing', percent: 18.0, depreciationClass: '39-year' },
    { componentId: 'roofing-system', percent: 6.0, depreciationClass: '39-year' },
    { componentId: 'flooring-structural', percent: 3.0, depreciationClass: '39-year' },
    { componentId: 'toilet-partitions', percent: 0.5, depreciationClass: '39-year' },
  ],

  // =================================================================
  // WAREHOUSE / DISTRIBUTION
  // =================================================================
  'warehouse-distribution': [
    // 5-Year Personal Property (~5%)
    { componentId: 'cabinets-millwork', percent: 0.5, depreciationClass: '5-year' },
    { componentId: 'flooring-vct-lvt', percent: 0.5, depreciationClass: '5-year' },
    { componentId: 'accent-lighting', percent: 0.5, depreciationClass: '5-year' },
    { componentId: 'security-system', percent: 1.0, depreciationClass: '5-year' },
    { componentId: 'building-signage', percent: 0.5, depreciationClass: '5-year' },
    { componentId: 'communication-data', percent: 1.5, depreciationClass: '5-year' },
    { componentId: 'specialty-electrical', percent: 0.5, depreciationClass: '5-year' },
    // 39-Year Real Property (~95%)
    { componentId: 'hvac-general', percent: 8.0, depreciationClass: '39-year' },
    { componentId: 'electrical-general', percent: 10.0, depreciationClass: '39-year' },
    { componentId: 'lighting-general', percent: 6.0, depreciationClass: '39-year' },
    { componentId: 'plumbing-general', percent: 3.0, depreciationClass: '39-year' },
    { componentId: 'doors-exterior', percent: 6.0, depreciationClass: '39-year' },
    { componentId: 'fire-sprinkler', percent: 4.0, depreciationClass: '39-year' },
    { componentId: 'structural-framing', percent: 28.0, depreciationClass: '39-year' },
    { componentId: 'roofing-system', percent: 10.0, depreciationClass: '39-year' },
    { componentId: 'exterior-walls', percent: 14.0, depreciationClass: '39-year' },
    { componentId: 'foundation', percent: 6.0, depreciationClass: '39-year' },
  ],

  // =================================================================
  // MULTIFAMILY - GARDEN STYLE (27.5-year for real property)
  // =================================================================
  'apartment-garden': [
    // 5-Year Personal Property (~15%)
    { componentId: 'cabinets-millwork', percent: 4.0, depreciationClass: '5-year' },
    { componentId: 'flooring-carpet', percent: 3.5, depreciationClass: '5-year' },
    { componentId: 'flooring-vct-lvt', percent: 2.0, depreciationClass: '5-year' },
    { componentId: 'kitchen-equipment', percent: 2.5, depreciationClass: '5-year' },
    { componentId: 'window-treatments', percent: 1.0, depreciationClass: '5-year' },
    { componentId: 'accent-lighting', percent: 0.5, depreciationClass: '5-year' },
    { componentId: 'security-system', percent: 0.5, depreciationClass: '5-year' },
    { componentId: 'communication-data', percent: 1.0, depreciationClass: '5-year' },
    // 27.5-Year Real Property (Residential)
    { componentId: 'hvac-general', percent: 12.0, depreciationClass: '27.5-year' },
    { componentId: 'electrical-general', percent: 8.0, depreciationClass: '27.5-year' },
    { componentId: 'plumbing-general', percent: 10.0, depreciationClass: '27.5-year' },
    { componentId: 'restroom-fixtures', percent: 4.0, depreciationClass: '27.5-year' },
    { componentId: 'doors-interior', percent: 3.0, depreciationClass: '27.5-year' },
    { componentId: 'doors-exterior', percent: 2.0, depreciationClass: '27.5-year' },
    { componentId: 'windows-exterior', percent: 4.0, depreciationClass: '27.5-year' },
    { componentId: 'ceiling-systems', percent: 2.0, depreciationClass: '27.5-year' },
    { componentId: 'interior-partitions', percent: 4.0, depreciationClass: '27.5-year' },
    { componentId: 'painting', percent: 3.0, depreciationClass: '27.5-year' },
    { componentId: 'structural-framing', percent: 18.0, depreciationClass: '27.5-year' },
    { componentId: 'roofing-system', percent: 5.0, depreciationClass: '27.5-year' },
    { componentId: 'fire-sprinkler', percent: 2.0, depreciationClass: '27.5-year' },
    { componentId: 'flooring-structural', percent: 3.0, depreciationClass: '27.5-year' },
  ],

  // =================================================================
  // HOTEL - LIMITED SERVICE
  // =================================================================
  'hotel-limited-service': [
    // 5-Year Personal Property (~25%)
    { componentId: 'cabinets-millwork', percent: 4.0, depreciationClass: '5-year' },
    { componentId: 'flooring-carpet', percent: 5.0, depreciationClass: '5-year' },
    { componentId: 'wall-coverings', percent: 2.5, depreciationClass: '5-year' },
    { componentId: 'window-treatments', percent: 2.0, depreciationClass: '5-year' },
    { componentId: 'accent-lighting', percent: 2.5, depreciationClass: '5-year' },
    { componentId: 'security-system', percent: 1.5, depreciationClass: '5-year' },
    { componentId: 'building-signage', percent: 1.5, depreciationClass: '5-year' },
    { componentId: 'communication-data', percent: 3.0, depreciationClass: '5-year' },
    { componentId: 'specialty-plumbing', percent: 0.5, depreciationClass: '5-year' },
    { componentId: 'ffe', percent: 2.5, depreciationClass: '5-year' },
    // 39-Year Real Property (~75%)
    { componentId: 'hvac-general', percent: 12.0, depreciationClass: '39-year' },
    { componentId: 'electrical-general', percent: 9.0, depreciationClass: '39-year' },
    { componentId: 'plumbing-general', percent: 8.0, depreciationClass: '39-year' },
    { componentId: 'restroom-fixtures', percent: 4.0, depreciationClass: '39-year' },
    { componentId: 'doors-interior', percent: 3.0, depreciationClass: '39-year' },
    { componentId: 'windows-exterior', percent: 4.0, depreciationClass: '39-year' },
    { componentId: 'ceiling-systems', percent: 3.0, depreciationClass: '39-year' },
    { componentId: 'interior-partitions', percent: 5.0, depreciationClass: '39-year' },
    { componentId: 'painting', percent: 2.5, depreciationClass: '39-year' },
    { componentId: 'structural-framing', percent: 14.0, depreciationClass: '39-year' },
    { componentId: 'elevators', percent: 3.0, depreciationClass: '39-year' },
    { componentId: 'roofing-system', percent: 4.0, depreciationClass: '39-year' },
    { componentId: 'fire-sprinkler', percent: 2.5, depreciationClass: '39-year' },
  ],

  // =================================================================
  // MEDICAL OFFICE
  // =================================================================
  'medical-office': [
    // 5-Year Personal Property (~18%)
    { componentId: 'cabinets-millwork', percent: 5.0, depreciationClass: '5-year' },
    { componentId: 'flooring-vct-lvt', percent: 4.0, depreciationClass: '5-year' },
    { componentId: 'wall-coverings', percent: 1.0, depreciationClass: '5-year' },
    { componentId: 'accent-lighting', percent: 1.5, depreciationClass: '5-year' },
    { componentId: 'security-system', percent: 1.0, depreciationClass: '5-year' },
    { componentId: 'building-signage', percent: 1.0, depreciationClass: '5-year' },
    { componentId: 'communication-data', percent: 2.5, depreciationClass: '5-year' },
    { componentId: 'specialty-plumbing', percent: 2.0, depreciationClass: '5-year' },
    // 39-Year Real Property (~82%)
    { componentId: 'hvac-general', percent: 14.0, depreciationClass: '39-year' },
    { componentId: 'hvac-distribution', percent: 4.0, depreciationClass: '39-year' },
    { componentId: 'electrical-general', percent: 10.0, depreciationClass: '39-year' },
    { componentId: 'plumbing-general', percent: 8.0, depreciationClass: '39-year' },
    { componentId: 'restroom-fixtures', percent: 3.0, depreciationClass: '39-year' },
    { componentId: 'doors-interior', percent: 3.0, depreciationClass: '39-year' },
    { componentId: 'windows-exterior', percent: 3.0, depreciationClass: '39-year' },
    { componentId: 'ceiling-systems', percent: 4.0, depreciationClass: '39-year' },
    { componentId: 'interior-partitions', percent: 6.0, depreciationClass: '39-year' },
    { componentId: 'painting', percent: 2.5, depreciationClass: '39-year' },
    { componentId: 'structural-framing', percent: 15.0, depreciationClass: '39-year' },
    { componentId: 'fire-sprinkler', percent: 3.0, depreciationClass: '39-year' },
    { componentId: 'flooring-structural', percent: 2.0, depreciationClass: '39-year' },
    { componentId: 'toilet-partitions', percent: 1.0, depreciationClass: '39-year' },
  ],
};

/**
 * 15-Year Land Improvement components for cost segregation.
 * These are applied to site improvement costs, not building costs.
 */
export const LAND_IMPROVEMENT_CSSI_COMPONENTS: CostSegAllocation[] = [
  { componentId: 'parking-lot', percent: 45.0, depreciationClass: '15-year' },
  { componentId: 'parking-striping', percent: 2.0, depreciationClass: '15-year' },
  { componentId: 'sidewalks-curbs', percent: 10.0, depreciationClass: '15-year' },
  { componentId: 'landscaping', percent: 15.0, depreciationClass: '15-year' },
  { componentId: 'site-lighting', percent: 8.0, depreciationClass: '15-year' },
  { componentId: 'site-drainage', percent: 8.0, depreciationClass: '15-year' },
  { componentId: 'fencing', percent: 4.0, depreciationClass: '15-year' },
  { componentId: 'exterior-signage', percent: 3.0, depreciationClass: '15-year' },
  { componentId: 'dumpster-enclosure', percent: 2.0, depreciationClass: '15-year' },
  { componentId: 'equipment-pads', percent: 2.0, depreciationClass: '15-year' },
  { componentId: 'retaining-walls', percent: 1.0, depreciationClass: '15-year' },
];

/**
 * Building systems for CSSI-style valuation table.
 * Maps line items to building system categories.
 */
export const CSSI_BUILDING_SYSTEMS = [
  'Ceiling Systems',
  'Doors and Frames',
  'Electrical',
  'HVAC',
  'Interior Framing / Partitions',
  'Miscellaneous Building Components',
  'Painting',
  'Plumbing',
  'Security',
  'Windows',
] as const;

export type CSSIBuildingSystem = typeof CSSI_BUILDING_SYSTEMS[number];

/**
 * Map component IDs to CSSI building systems for aggregation.
 */
export const COMPONENT_TO_CSSI_SYSTEM: Record<string, CSSIBuildingSystem> = {
  'ceiling-systems': 'Ceiling Systems',
  'doors-exterior': 'Doors and Frames',
  'doors-interior': 'Doors and Frames',
  'electrical-general': 'Electrical',
  'accent-lighting': 'Electrical',
  'emergency-lighting': 'Electrical',
  'specialty-electrical': 'Electrical',
  'communication-data': 'Electrical',
  'lighting-general': 'Electrical',
  'hvac-general': 'HVAC',
  'hvac-distribution': 'HVAC',
  'interior-partitions': 'Interior Framing / Partitions',
  'interior-half-walls': 'Interior Framing / Partitions',
  'painting': 'Painting',
  'wall-coverings': 'Painting',
  'plumbing-general': 'Plumbing',
  'specialty-plumbing': 'Plumbing',
  'restroom-fixtures': 'Plumbing',
  'security-system': 'Security',
  'access-control': 'Security',
  'windows-exterior': 'Windows',
  'interior-windows': 'Windows',
  'interior-glass': 'Windows',
  'window-treatments': 'Windows',
  // Default to Miscellaneous for all others
};

/**
 * Get CSSI display name for a component.
 */
export function getCSSIComponentName(componentId: string): string {
  return CSSI_COMPONENT_NAMES[componentId] || componentId;
}

/**
 * Get CSSI building system for a component.
 */
export function getCSSIBuildingSystem(componentId: string): CSSIBuildingSystem {
  return COMPONENT_TO_CSSI_SYSTEM[componentId] || 'Miscellaneous Building Components';
}

/**
 * Get M&S cost seg allocations for an occupancy type.
 */
export function getMSCostSegAllocations(occupancyCode: string): CostSegAllocation[] {
  return MS_COST_SEG_ALLOCATIONS[occupancyCode] || MS_COST_SEG_ALLOCATIONS['office-lowrise'];
}

// =================================================================
// IRS COMPLIANCE REFERENCES
// =================================================================

/**
 * IRS and regulatory references for cost segregation reports.
 */
export const IRS_REFERENCES = {
  auditTechniquesGuide: 'Cost Segregation Audit Techniques Guide (Rev. 01-2022)',
  revenueProc8756: 'Revenue Procedure 87-56',
  section1245: 'IRC Section 1245 Property',
  section1250: 'IRC Section 1250 Property',
  treasuryDecision9636: 'Treasury Decision 9636 (Tangible Property Regulations)',
  publication946: 'IRS Publication 946 - How to Depreciate Property',
};

/**
 * Landmark court cases for cost segregation methodology.
 */
export const COURT_CASE_REFERENCES = [
  { 
    name: 'Hospital Corporation of America', 
    citation: '109 T.C. 21 (1997)', 
    note: 'Landmark case establishing cost segregation methodology for separating personal property from real property.' 
  },
  { 
    name: 'Morrison Inc.', 
    citation: 'T.C. Memo 1986-129', 
    note: 'Established that certain building components can be depreciated separately from the building structure.' 
  },
  { 
    name: 'Whiteco Industries', 
    citation: '65 T.C. 664 (1975)', 
    note: 'Confirmed that decorative items and non-structural elements can qualify as personal property.' 
  },
];

/**
 * Methodology text for cost segregation reports.
 */
export const METHODOLOGY_TEXT = {
  overview: `Cost segregation is an engineering-based study that identifies building 
components that can be reclassified from real property (39-year or 27.5-year) to personal 
property (5-year, 7-year) or land improvements (15-year) for federal tax depreciation purposes.`,
  
  engineeringApproach: `This study employs an engineering-based approach using 
Marshall & Swift cost data and detailed component analysis to allocate building costs 
to the appropriate IRS asset classifications. The methodology complies with the 
IRS Cost Segregation Audit Techniques Guide.`,
  
  irsCompliance: `This report has been prepared in accordance with the IRS Cost 
Segregation Audit Techniques Guide and applicable Treasury Regulations. The study 
methodology follows the detailed engineering approach as established in Hospital 
Corporation of America v. Commissioner.`,
  
  disclaimer: `This cost segregation study is provided for informational purposes 
to assist in tax planning. The taxpayer and their tax advisor are responsible for 
determining the appropriate application of the study results. This study should be 
reviewed with a qualified tax professional before implementation.`,
};
