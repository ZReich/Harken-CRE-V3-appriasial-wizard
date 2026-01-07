/**
 * Grid Field Definitions Registry
 * ================================
 * 
 * Central registry of all field definitions for Sales Comparison grids.
 * Each field specifies which property types it applies to and how it's displayed.
 * 
 * Fields are categorized as:
 * - Transactional: Property rights, financing, market conditions (quantitative)
 * - Physical: Location, size, quality, property-specific attributes (qualitative)
 */

import type { GridFieldDefinition, SalesGridType } from '../types';

// =================================================================
// ALL PROPERTY TYPES (for fields that appear everywhere)
// =================================================================

const ALL_PROPERTY_TYPES: SalesGridType[] = [
  'retail_office',
  'medical_office',
  'industrial',
  'land_sf',
  'land_acre',
  'multi_family',
  'hotel_motel',
  'mobile_home_park',
  'golf_course',
  'residential',
];

const IMPROVED_PROPERTY_TYPES: SalesGridType[] = [
  'retail_office',
  'medical_office',
  'industrial',
  'multi_family',
  'hotel_motel',
  'mobile_home_park',
  'golf_course',
  'residential',
];

const LAND_TYPES: SalesGridType[] = ['land_sf', 'land_acre'];

const COMMERCIAL_TYPES: SalesGridType[] = [
  'retail_office',
  'medical_office',
  'industrial',
  'multi_family',
  'hotel_motel',
  'mobile_home_park',
  'golf_course',
];

// =================================================================
// TRANSACTIONAL FIELD DEFINITIONS
// =================================================================

export const TRANSACTIONAL_FIELDS: GridFieldDefinition[] = [
  {
    id: 'property_rights',
    label: 'Property Rights',
    category: 'transactional',
    adjustmentType: 'quantitative',
    propertyTypes: ALL_PROPERTY_TYPES,
    format: 'percent',
    required: true,
    description: 'Fee simple, leased fee, leasehold',
  },
  {
    id: 'financing_terms',
    label: 'Financing Terms',
    category: 'transactional',
    adjustmentType: 'quantitative',
    propertyTypes: ALL_PROPERTY_TYPES,
    format: 'percent',
    required: true,
    description: 'Cash equivalent, seller financing, assumption',
  },
  {
    id: 'conditions_of_sale',
    label: 'Conditions of Sale',
    category: 'transactional',
    adjustmentType: 'quantitative',
    propertyTypes: ALL_PROPERTY_TYPES,
    format: 'percent',
    required: true,
    description: 'Arms-length, distress, related party',
  },
  {
    id: 'expenditures_after_sale',
    label: 'Expenditures After Sale',
    category: 'transactional',
    adjustmentType: 'quantitative',
    propertyTypes: IMPROVED_PROPERTY_TYPES,
    format: 'percent',
    required: false,
    description: 'Immediate repairs, deferred maintenance',
  },
  {
    id: 'market_conditions',
    label: 'Market Conditions',
    category: 'transactional',
    adjustmentType: 'quantitative',
    propertyTypes: ALL_PROPERTY_TYPES,
    format: 'percent',
    required: true,
    description: 'Time adjustment for market changes',
  },
];

// =================================================================
// PHYSICAL FIELD DEFINITIONS - UNIVERSAL
// =================================================================

export const UNIVERSAL_PHYSICAL_FIELDS: GridFieldDefinition[] = [
  {
    id: 'location',
    label: 'Location',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ALL_PROPERTY_TYPES,
    format: 'text',
    required: true,
    description: 'Geographic location quality',
  },
  {
    id: 'highest_best_use',
    label: 'Highest & Best Use',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: [...COMMERCIAL_TYPES, ...LAND_TYPES],
    format: 'text',
    required: false,
    description: 'HBU conformance',
  },
  {
    id: 'quality_condition',
    label: 'Quality/Condition',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: IMPROVED_PROPERTY_TYPES,
    format: 'text',
    required: true,
    description: 'Overall quality and condition',
  },
  {
    id: 'year_built',
    label: 'Year Built',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: IMPROVED_PROPERTY_TYPES,
    format: 'number',
    required: true,
    description: 'Construction year',
  },
  {
    id: 'effective_age',
    label: 'Effective Age',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['retail_office', 'medical_office', 'industrial'],
    format: 'number',
    required: false,
    description: 'Effective age considering updates',
  },
];

// =================================================================
// PHYSICAL FIELD DEFINITIONS - SIZE RELATED
// =================================================================

export const SIZE_FIELDS: GridFieldDefinition[] = [
  {
    id: 'site_size_sf',
    label: 'Site Size (SF)',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['retail_office', 'medical_office', 'industrial', 'residential'],
    format: 'number',
    required: true,
    description: 'Land area in square feet',
  },
  {
    id: 'site_size_acres',
    label: 'Site Size (Acres)',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['land_acre', 'mobile_home_park', 'golf_course'],
    format: 'number',
    required: true,
    description: 'Land area in acres',
  },
  {
    id: 'size_sf',
    label: 'Size (SF)',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['land_sf'],
    format: 'number',
    required: true,
    description: 'Land area in square feet',
  },
  {
    id: 'size_acres',
    label: 'Size (Acres)',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['land_acre'],
    format: 'number',
    required: true,
    description: 'Land area in acres',
  },
  {
    id: 'building_size_sf',
    label: 'Building Size (SF)',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: IMPROVED_PROPERTY_TYPES,
    format: 'number',
    required: true,
    description: 'Gross building area',
  },
];

// =================================================================
// PHYSICAL FIELD DEFINITIONS - INDUSTRIAL SPECIFIC
// =================================================================

export const INDUSTRIAL_FIELDS: GridFieldDefinition[] = [
  {
    id: 'heated',
    label: 'Heated',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['industrial'],
    format: 'text',
    required: false,
    description: 'Heated warehouse space',
  },
  {
    id: 'demised_units',
    label: 'Demised Units',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['industrial'],
    format: 'number',
    required: false,
    description: 'Number of divisible units',
  },
  {
    id: 'sidewall_height',
    label: 'Sidewall Height',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['industrial'],
    format: 'number',
    required: true,
    description: 'Clear height in feet',
  },
  {
    id: 'dock_doors',
    label: 'Dock Doors',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['industrial'],
    format: 'number',
    required: false,
    description: 'Number of dock-high doors',
  },
  {
    id: 'drive_in_doors',
    label: 'Drive-In Doors',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['industrial'],
    format: 'number',
    required: false,
    description: 'Number of grade-level doors',
  },
  {
    id: 'office_finish',
    label: 'Office Finish %',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['industrial'],
    format: 'percent',
    required: false,
    description: 'Percentage of office finish',
  },
];

// =================================================================
// PHYSICAL FIELD DEFINITIONS - LAND SPECIFIC
// =================================================================

export const LAND_FIELDS: GridFieldDefinition[] = [
  {
    id: 'utilities',
    label: 'Utilities',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: LAND_TYPES,
    format: 'text',
    required: true,
    description: 'Available utilities',
  },
  {
    id: 'zoning',
    label: 'Zoning',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: LAND_TYPES,
    format: 'text',
    required: true,
    description: 'Zoning classification',
  },
  {
    id: 'topography',
    label: 'Topography',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: LAND_TYPES,
    format: 'text',
    required: true,
    description: 'Site topography',
  },
  {
    id: 'shape',
    label: 'Shape',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: LAND_TYPES,
    format: 'text',
    required: false,
    description: 'Site shape/configuration',
  },
  {
    id: 'frontage',
    label: 'Frontage',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: LAND_TYPES,
    format: 'text',
    required: false,
    description: 'Road frontage',
  },
  {
    id: 'site_utility',
    label: 'Site Utility',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['land_acre'],
    format: 'text',
    required: false,
    description: 'Overall site utility/usability',
  },
  {
    id: 'access',
    label: 'Access',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: LAND_TYPES,
    format: 'text',
    required: false,
    description: 'Road access quality',
  },
];

// =================================================================
// PHYSICAL FIELD DEFINITIONS - MULTI-FAMILY SPECIFIC
// =================================================================

export const MULTI_FAMILY_FIELDS: GridFieldDefinition[] = [
  {
    id: 'unit_count',
    label: 'Unit Count',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['multi_family'],
    format: 'number',
    required: true,
    description: 'Total number of units',
  },
  {
    id: 'unit_mix',
    label: 'Unit Mix',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['multi_family'],
    format: 'text',
    required: false,
    description: 'Breakdown by bedroom count',
  },
  {
    id: 'avg_unit_size',
    label: 'Avg Unit Size',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['multi_family'],
    format: 'number',
    required: false,
    description: 'Average unit square footage',
  },
  {
    id: 'amenities',
    label: 'Amenities',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['multi_family', 'hotel_motel'],
    format: 'text',
    required: false,
    description: 'Property amenities',
  },
];

// =================================================================
// PHYSICAL FIELD DEFINITIONS - HOTEL SPECIFIC
// =================================================================

export const HOTEL_FIELDS: GridFieldDefinition[] = [
  {
    id: 'room_count',
    label: 'Room Count',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['hotel_motel'],
    format: 'number',
    required: true,
    description: 'Total number of rooms',
  },
  {
    id: 'avg_room_size',
    label: 'Avg Room Size',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['hotel_motel'],
    format: 'number',
    required: false,
    description: 'Average room square footage',
  },
  {
    id: 'brand_affiliation',
    label: 'Brand Affiliation',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['hotel_motel'],
    format: 'text',
    required: false,
    description: 'Hotel brand/franchise',
  },
  {
    id: 'occupancy',
    label: 'Occupancy',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['hotel_motel', 'mobile_home_park'],
    format: 'percent',
    required: false,
    description: 'Stabilized occupancy rate',
  },
];

// =================================================================
// PHYSICAL FIELD DEFINITIONS - MOBILE HOME PARK SPECIFIC
// =================================================================

export const MOBILE_HOME_PARK_FIELDS: GridFieldDefinition[] = [
  {
    id: 'pad_count',
    label: 'Pad Count',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['mobile_home_park'],
    format: 'number',
    required: true,
    description: 'Total number of pads',
  },
  {
    id: 'lot_rent',
    label: 'Lot Rent',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['mobile_home_park'],
    format: 'currency',
    required: false,
    description: 'Average lot rent per month',
  },
];

// =================================================================
// PHYSICAL FIELD DEFINITIONS - GOLF COURSE SPECIFIC
// =================================================================

export const GOLF_COURSE_FIELDS: GridFieldDefinition[] = [
  {
    id: 'hole_count',
    label: 'Hole Count',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['golf_course'],
    format: 'number',
    required: true,
    description: 'Number of holes (9, 18, 27, 36)',
  },
  {
    id: 'course_type',
    label: 'Course Type',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['golf_course'],
    format: 'text',
    required: true,
    description: 'Public, semi-private, private',
  },
  {
    id: 'clubhouse_sf',
    label: 'Clubhouse SF',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['golf_course'],
    format: 'number',
    required: false,
    description: 'Clubhouse square footage',
  },
  {
    id: 'membership_type',
    label: 'Membership Type',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['golf_course'],
    format: 'text',
    required: false,
    description: 'Equity, non-equity, public',
  },
];

// =================================================================
// PHYSICAL FIELD DEFINITIONS - RESIDENTIAL SPECIFIC
// =================================================================

export const RESIDENTIAL_FIELDS: GridFieldDefinition[] = [
  {
    id: 'bedrooms',
    label: 'Bedrooms',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['residential'],
    format: 'number',
    required: true,
    description: 'Number of bedrooms',
  },
  {
    id: 'bathrooms',
    label: 'Bathrooms',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['residential'],
    format: 'number',
    required: true,
    description: 'Number of bathrooms',
  },
  {
    id: 'garage',
    label: 'Garage',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['residential'],
    format: 'text',
    required: false,
    description: 'Garage type and capacity',
  },
];

// =================================================================
// MEDICAL OFFICE SPECIFIC
// =================================================================

export const MEDICAL_FIELDS: GridFieldDefinition[] = [
  {
    id: 'surgical_capability',
    label: 'Surgical Capability',
    category: 'physical',
    adjustmentType: 'qualitative',
    propertyTypes: ['medical_office'],
    format: 'text',
    required: false,
    description: 'Ambulatory surgery center capability',
  },
];

// =================================================================
// METRIC FIELD DEFINITIONS (Calculated/Summary Fields)
// =================================================================

export const METRIC_FIELDS: GridFieldDefinition[] = [
  {
    id: 'price_per_sf',
    label: 'Price / SF',
    category: 'transactional',
    adjustmentType: 'quantitative',
    propertyTypes: ['retail_office', 'medical_office', 'industrial', 'multi_family', 'hotel_motel', 'residential'],
    format: 'currency',
    required: false,
    description: 'Sales price per square foot of building',
  },
  {
    id: 'price_per_unit',
    label: 'Price / Unit',
    category: 'transactional',
    adjustmentType: 'quantitative',
    propertyTypes: ['multi_family'],
    format: 'currency',
    required: false,
    description: 'Sales price per residential unit',
  },
  {
    id: 'price_per_room',
    label: 'Price / Room',
    category: 'transactional',
    adjustmentType: 'quantitative',
    propertyTypes: ['hotel_motel'],
    format: 'currency',
    required: false,
    description: 'Sales price per hotel room',
  },
  {
    id: 'price_per_pad',
    label: 'Price / Pad',
    category: 'transactional',
    adjustmentType: 'quantitative',
    propertyTypes: ['mobile_home_park'],
    format: 'currency',
    required: false,
    description: 'Sales price per mobile home pad',
  },
  {
    id: 'price_per_hole',
    label: 'Price / Hole',
    category: 'transactional',
    adjustmentType: 'quantitative',
    propertyTypes: ['golf_course'],
    format: 'currency',
    required: false,
    description: 'Sales price per golf hole',
  },
  {
    id: 'price_per_acre',
    label: 'Price / Acre',
    category: 'transactional',
    adjustmentType: 'quantitative',
    propertyTypes: ['land_acre', 'mobile_home_park', 'golf_course'],
    format: 'currency',
    required: false,
    description: 'Sales price per acre of land',
  },
  {
    id: 'cap_rate',
    label: 'Cap Rate',
    category: 'transactional',
    adjustmentType: 'quantitative',
    propertyTypes: ['retail_office', 'medical_office', 'industrial', 'multi_family', 'hotel_motel', 'mobile_home_park', 'golf_course'],
    format: 'percent',
    required: false,
    description: 'Capitalization rate (NOI / Sales Price)',
  },
];

// =================================================================
// COMBINED FIELD REGISTRY
// =================================================================

export const ALL_FIELD_DEFINITIONS: GridFieldDefinition[] = [
  ...TRANSACTIONAL_FIELDS,
  ...UNIVERSAL_PHYSICAL_FIELDS,
  ...SIZE_FIELDS,
  ...INDUSTRIAL_FIELDS,
  ...LAND_FIELDS,
  ...MULTI_FAMILY_FIELDS,
  ...HOTEL_FIELDS,
  ...MOBILE_HOME_PARK_FIELDS,
  ...GOLF_COURSE_FIELDS,
  ...RESIDENTIAL_FIELDS,
  ...MEDICAL_FIELDS,
  ...METRIC_FIELDS,
];

// =================================================================
// FIELD LOOKUP HELPERS
// =================================================================

/**
 * Get all fields for a specific grid type.
 */
export function getFieldsForGridType(gridType: SalesGridType): GridFieldDefinition[] {
  return ALL_FIELD_DEFINITIONS.filter(field => 
    field.propertyTypes.includes(gridType)
  );
}

/**
 * Get transactional fields for a grid type.
 */
export function getTransactionalFieldsForGridType(gridType: SalesGridType): GridFieldDefinition[] {
  return ALL_FIELD_DEFINITIONS.filter(field => 
    field.category === 'transactional' && field.propertyTypes.includes(gridType)
  );
}

/**
 * Get physical fields for a grid type.
 */
export function getPhysicalFieldsForGridType(gridType: SalesGridType): GridFieldDefinition[] {
  return ALL_FIELD_DEFINITIONS.filter(field => 
    field.category === 'physical' && field.propertyTypes.includes(gridType)
  );
}

/**
 * Get a field definition by ID.
 */
export function getFieldById(fieldId: string): GridFieldDefinition | undefined {
  return ALL_FIELD_DEFINITIONS.find(field => field.id === fieldId);
}

/**
 * Get required fields for a grid type.
 */
export function getRequiredFieldsForGridType(gridType: SalesGridType): GridFieldDefinition[] {
  return ALL_FIELD_DEFINITIONS.filter(field => 
    field.required && field.propertyTypes.includes(gridType)
  );
}
