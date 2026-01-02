/**
 * CSSI-Style Cost Segregation Constants
 * 
 * Professional report naming conventions and M&S-based component allocations
 * for generating CSSI-style cost segregation studies.
 */

import type { DepreciationClass } from './costSegregation';

// =================================================================
// CSSI-STYLE COMPONENT NAMES
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

// =================================================================
// M&S-BASED COST SEGREGATION ALLOCATIONS
// =================================================================

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

// =================================================================
// 15-YEAR LAND IMPROVEMENT COMPONENTS
// =================================================================

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

// =================================================================
// BUILDING SYSTEMS FOR CSSI REPORTS
// =================================================================

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
};

// =================================================================
// HELPER FUNCTIONS
// =================================================================

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
