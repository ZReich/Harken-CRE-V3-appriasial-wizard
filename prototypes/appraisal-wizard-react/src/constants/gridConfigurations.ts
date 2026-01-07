/**
 * Grid Configurations Registry
 * =============================
 * 
 * Central configuration registry for Sales Comparison grid variants.
 * All grids share the same underlying methodology with different field configurations.
 * 
 * Architecture: One Grid Engine, Many Configurations
 * - Retail/Office: $/SF Building, CAP Rate, Effective Age
 * - Industrial: $/SF Building, Heated, Sidewall Height
 * - Medical: $/SF Building, Surgical capability
 * - Land (SF): $/SF, Utilities, Topography
 * - Land (Acre): $/Acre, Site Utility
 * - Multi-Family: $/Unit, Unit Mix
 * - Hotel/Motel: $/Room, Occupancy
 * - Mobile Home Park: $/Pad, Lot Rent
 * - Golf Course: $/Hole, Course Type
 */

import type { SalesGridConfiguration, SalesGridType } from '../types';

// =================================================================
// RETAIL / OFFICE CONFIGURATION
// =================================================================

export const RETAIL_OFFICE_CONFIG: SalesGridConfiguration = {
  gridType: 'retail_office',
  unitOfMeasure: 'sf_building',
  transactionalFields: [
    'property_rights',
    'financing_terms',
    'conditions_of_sale',
    'expenditures_after_sale',
    'market_conditions',
  ],
  physicalFields: [
    'location',
    'highest_best_use',
    'effective_age',
    'site_size_sf',
    'building_size_sf',
    'quality_condition',
  ],
  metrics: ['price_per_sf', 'cap_rate'],
  showCapRate: true,
  showResidualMode: true,
};

// =================================================================
// INDUSTRIAL CONFIGURATION
// =================================================================

export const INDUSTRIAL_CONFIG: SalesGridConfiguration = {
  gridType: 'industrial',
  unitOfMeasure: 'sf_building',
  transactionalFields: [
    'property_rights',
    'financing_terms',
    'conditions_of_sale',
    'expenditures_after_sale',
    'market_conditions',
  ],
  physicalFields: [
    'location',
    'year_built',
    'site_size_sf',
    'building_size_sf',
    'heated',
    'demised_units',
    'sidewall_height',
    'dock_doors',
    'quality_condition',
  ],
  metrics: ['price_per_sf', 'cap_rate'],
  showCapRate: true,
  showResidualMode: true,
};

// =================================================================
// MEDICAL OFFICE CONFIGURATION
// =================================================================

export const MEDICAL_CONFIG: SalesGridConfiguration = {
  gridType: 'medical_office',
  unitOfMeasure: 'sf_building',
  transactionalFields: [
    'property_rights',
    'financing_terms',
    'conditions_of_sale',
    'expenditures_after_sale',
    'market_conditions',
  ],
  physicalFields: [
    'location',
    'highest_best_use',
    'year_built',
    'site_size_sf',
    'building_size_sf',
    'surgical_capability',
    'quality_condition',
  ],
  metrics: ['price_per_sf', 'cap_rate'],
  showCapRate: true,
  showResidualMode: true,
};

// =================================================================
// LAND (SQUARE FOOT) CONFIGURATION - Urban/Small Sites
// =================================================================

export const LAND_SF_CONFIG: SalesGridConfiguration = {
  gridType: 'land_sf',
  unitOfMeasure: 'sf_land',
  transactionalFields: [
    'property_rights',
    'financing_terms',
    'conditions_of_sale',
    'expenditures_after_sale',
    'market_conditions',
  ],
  physicalFields: [
    'location',
    'utilities',
    'size_sf',
    'zoning',
    'topography',
    'shape',
    'frontage',
  ],
  metrics: ['price_per_sf'],
  showCapRate: false,
  showResidualMode: false,
};

// =================================================================
// LAND (ACRE) CONFIGURATION - Rural/Large Sites
// =================================================================

export const LAND_ACRE_CONFIG: SalesGridConfiguration = {
  gridType: 'land_acre',
  unitOfMeasure: 'acre',
  transactionalFields: [
    'property_rights',
    'financing_terms',
    'conditions_of_sale',
    'expenditures_after_sale',
    'market_conditions',
  ],
  physicalFields: [
    'location',
    'highest_best_use',
    'zoning',
    'utilities',
    'size_acres',
    'site_utility',
    'access',
  ],
  metrics: ['price_per_acre'],
  showCapRate: false,
  showResidualMode: false,
};

// =================================================================
// MULTI-FAMILY CONFIGURATION
// =================================================================

export const MULTI_FAMILY_CONFIG: SalesGridConfiguration = {
  gridType: 'multi_family',
  unitOfMeasure: 'per_unit',
  secondaryUnitOfMeasure: 'sf_building',
  primaryValueDriver: 'price_per_unit',
  transactionalFields: [
    'property_rights',
    'financing_terms',
    'conditions_of_sale',
    'expenditures_after_sale',
    'market_conditions',
  ],
  physicalFields: [
    'location',
    'year_built',
    'unit_count',
    'unit_mix',
    'building_size_sf',
    'avg_unit_size',
    'quality_condition',
    'amenities',
  ],
  metrics: ['price_per_unit', 'price_per_sf', 'cap_rate'],
  showCapRate: true,
  showResidualMode: true,
};

// =================================================================
// HOTEL / MOTEL CONFIGURATION
// =================================================================

export const HOTEL_CONFIG: SalesGridConfiguration = {
  gridType: 'hotel_motel',
  unitOfMeasure: 'per_room',
  secondaryUnitOfMeasure: 'sf_building',
  primaryValueDriver: 'price_per_unit',
  transactionalFields: [
    'property_rights',
    'financing_terms',
    'conditions_of_sale',
    'expenditures_after_sale',
    'market_conditions',
  ],
  physicalFields: [
    'location',
    'year_built',
    'room_count',
    'building_size_sf',
    'avg_room_size',
    'quality_condition',
    'amenities',
    'brand_affiliation',
  ],
  metrics: ['price_per_room', 'price_per_sf', 'cap_rate'],
  showCapRate: true,
  showResidualMode: false,
};

// =================================================================
// MOBILE HOME PARK CONFIGURATION
// =================================================================

export const MOBILE_HOME_PARK_CONFIG: SalesGridConfiguration = {
  gridType: 'mobile_home_park',
  unitOfMeasure: 'per_pad',
  transactionalFields: [
    'property_rights',
    'financing_terms',
    'conditions_of_sale',
    'expenditures_after_sale',
    'market_conditions',
  ],
  physicalFields: [
    'location',
    'pad_count',
    'occupancy',
    'lot_rent',
    'site_size_acres',
    'utilities',
    'amenities',
  ],
  metrics: ['price_per_pad', 'cap_rate'],
  showCapRate: true,
  showResidualMode: false,
};

// =================================================================
// GOLF COURSE CONFIGURATION
// =================================================================

export const GOLF_COURSE_CONFIG: SalesGridConfiguration = {
  gridType: 'golf_course',
  unitOfMeasure: 'per_hole',
  transactionalFields: [
    'property_rights',
    'financing_terms',
    'conditions_of_sale',
    'expenditures_after_sale',
    'market_conditions',
  ],
  physicalFields: [
    'location',
    'hole_count',
    'course_type',
    'site_size_acres',
    'clubhouse_sf',
    'membership_type',
    'quality_condition',
  ],
  metrics: ['price_per_hole', 'cap_rate'],
  showCapRate: true,
  showResidualMode: false,
};

// =================================================================
// RESIDENTIAL CONFIGURATION
// =================================================================

export const RESIDENTIAL_CONFIG: SalesGridConfiguration = {
  gridType: 'residential',
  unitOfMeasure: 'sf_building',
  transactionalFields: [
    'property_rights',
    'financing_terms',
    'conditions_of_sale',
    'expenditures_after_sale',
    'market_conditions',
  ],
  physicalFields: [
    'location',
    'year_built',
    'site_size_sf',
    'building_size_sf',
    'bedrooms',
    'bathrooms',
    'garage',
    'quality_condition',
  ],
  metrics: ['price_per_sf'],
  showCapRate: false,
  showResidualMode: false,
};

// =================================================================
// CONFIGURATION LOOKUP MAP
// =================================================================

export const GRID_CONFIGURATIONS: Record<SalesGridType, SalesGridConfiguration> = {
  retail_office: RETAIL_OFFICE_CONFIG,
  medical_office: MEDICAL_CONFIG,
  industrial: INDUSTRIAL_CONFIG,
  land_sf: LAND_SF_CONFIG,
  land_acre: LAND_ACRE_CONFIG,
  multi_family: MULTI_FAMILY_CONFIG,
  hotel_motel: HOTEL_CONFIG,
  mobile_home_park: MOBILE_HOME_PARK_CONFIG,
  golf_course: GOLF_COURSE_CONFIG,
  residential: RESIDENTIAL_CONFIG,
};

// =================================================================
// GRID TYPE DETECTION LOGIC
// =================================================================

/**
 * Determines the appropriate grid configuration based on property type and site characteristics.
 * 
 * @param propertyCategory - Top-level category (land, commercial, residential)
 * @param propertyType - Specific type (office, retail, industrial, multifamily, etc.)
 * @param propertySubtypeOrMsCode - Further refinement OR Marshall & Swift occupancy code
 * @param siteSize - Site size in the specified unit
 * @param siteUnit - Unit of site size ('sf' or 'acres')
 * @returns The appropriate SalesGridConfiguration
 */
export function determineGridConfiguration(
  propertyCategory: string | null,
  propertyType: string | null,
  propertySubtypeOrMsCode?: string | null,
  siteSize?: number,
  siteUnit?: 'sf' | 'acres'
): SalesGridConfiguration {
  // Normalize the subtype/code for matching
  const subtypeLower = propertySubtypeOrMsCode?.toLowerCase() || '';
  // Land: Choose SF vs Acre based on size (5 acre threshold)
  if (propertyCategory === 'land') {
    if (siteSize !== undefined && siteUnit !== undefined) {
      const sizeInAcres = siteUnit === 'acres' ? siteSize : siteSize / 43560;
      return sizeInAcres > 5 ? LAND_ACRE_CONFIG : LAND_SF_CONFIG;
    }
    return LAND_SF_CONFIG; // Default to SF for urban land
  }

  // Industrial
  if (propertyCategory === 'industrial' || propertyType?.toLowerCase().includes('industrial') || propertyType?.toLowerCase().includes('warehouse')) {
    return INDUSTRIAL_CONFIG;
  }

  // Multi-Family (5+ units)
  if (
    propertyType?.toLowerCase().includes('multifamily') ||
    propertyType?.toLowerCase().includes('multi-family') ||
    propertyType?.toLowerCase().includes('apartment') ||
    subtypeLower.includes('multifamily') ||
    subtypeLower.includes('apartment')
  ) {
    return MULTI_FAMILY_CONFIG;
  }

  // Hotel/Motel
  if (
    propertyType?.toLowerCase().includes('hotel') ||
    propertyType?.toLowerCase().includes('motel') ||
    subtypeLower.includes('hotel') ||
    subtypeLower.includes('motel')
  ) {
    return HOTEL_CONFIG;
  }

  // Mobile Home Park / RV Park (M&S Code 851)
  // Detected by: property type, subtype/occupancy code, or explicit ID
  if (
    propertyType?.toLowerCase().includes('mobile home') ||
    propertyType?.toLowerCase().includes('mobile-home-park') ||
    propertyType?.toLowerCase().includes('rv park') ||
    propertyType?.toLowerCase().includes('rv-park') ||
    subtypeLower.includes('mobile-home-park') ||
    subtypeLower.includes('rv-park') ||
    subtypeLower.includes('851')  // M&S occupancy code
  ) {
    return MOBILE_HOME_PARK_CONFIG;
  }

  // Golf Course (M&S Code 100)
  // Detected by: property type, subtype/occupancy code, or explicit ID
  if (
    propertyType?.toLowerCase().includes('golf') ||
    propertyType?.toLowerCase().includes('country club') ||
    propertyType?.toLowerCase().includes('driving range') ||
    subtypeLower.includes('golf') ||
    subtypeLower.includes('driving-range') ||
    subtypeLower.includes('100')  // M&S occupancy code
  ) {
    return GOLF_COURSE_CONFIG;
  }
  
  // Marina (M&S Code 852) - uses per_pad similar to mobile home parks
  if (
    propertyType?.toLowerCase().includes('marina') ||
    subtypeLower.includes('marina') ||
    subtypeLower.includes('852')
  ) {
    return MOBILE_HOME_PARK_CONFIG;  // Marinas use $/slip which is similar to $/pad
  }

  // Medical Office
  if (
    propertyType?.toLowerCase().includes('medical') ||
    subtypeLower.includes('medical')
  ) {
    return MEDICAL_CONFIG;
  }

  // Residential (single family, 2-4 units)
  if (propertyCategory === 'residential') {
    return RESIDENTIAL_CONFIG;
  }

  // Default to Retail/Office for commercial
  return RETAIL_OFFICE_CONFIG;
}

// =================================================================
// UNIT LABEL HELPERS
// =================================================================

/**
 * Returns the display label for a unit of measure.
 */
export function getUnitLabel(unit: SalesGridConfiguration['unitOfMeasure']): string {
  switch (unit) {
    case 'sf_building': return '$/SF Building';
    case 'sf_land': return '$/SF';
    case 'acre': return '$/Acre';
    case 'per_unit': return '$/Unit';
    case 'per_room': return '$/Room';
    case 'per_pad': return '$/Pad';
    case 'per_hole': return '$/Hole';
    default: return '$/SF';
  }
}

/**
 * Returns a short label for the unit (used in column headers).
 */
export function getUnitShortLabel(unit: SalesGridConfiguration['unitOfMeasure']): string {
  switch (unit) {
    case 'sf_building': return 'PSF';
    case 'sf_land': return 'PSF';
    case 'acre': return 'Per Acre';
    case 'per_unit': return 'Per Unit';
    case 'per_room': return 'Per Room';
    case 'per_pad': return 'Per Pad';
    case 'per_hole': return 'Per Hole';
    default: return 'PSF';
  }
}
