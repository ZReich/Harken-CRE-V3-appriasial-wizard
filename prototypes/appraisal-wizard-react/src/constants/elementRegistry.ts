// =================================================================
// ELEMENT REGISTRY - Dynamic Context-Aware Element Definitions
// =================================================================
// This file defines ALL available elements for appraisal grids with
// their applicability metadata. Elements are filtered based on:
// - Property Type (commercial, residential, land)
// - Property Subtype (office, industrial, multifamily, etc.)
// - Approach (sales_comparison, income, land_valuation, multi_family)
// - Section (transaction, cap_rate, adjustments, quantitative, qualitative, valuation)
// - Scenario (as_is, as_completed, as_stabilized)
// =================================================================

export type PropertyType = 'commercial' | 'residential' | 'land' | 'all';
export type ApproachType = 'sales_comparison' | 'income' | 'land_valuation' | 'multi_family' | 'all';
export type SectionType = 'transaction' | 'cap_rate' | 'adjustments' | 'quantitative' | 'qualitative' | 'valuation';
export type ScenarioType = 'as_is' | 'as_completed' | 'as_stabilized' | 'all';
export type InputType = 'text' | 'number' | 'currency' | 'date' | 'percentage' | 'select';

export interface ElementDefinition {
  key: string;
  label: string;
  description?: string;
  // Applicability rules
  propertyTypes: PropertyType[];
  subtypes?: string[];  // Specific subtypes or undefined for all subtypes of the property type
  approaches: ApproachType[];
  sections: SectionType[];
  scenarios?: ScenarioType[];  // Defaults to 'all' if not specified
  // Input type - ONLY used for 'transaction' and 'cap_rate' sections
  // Other sections have fixed input types based on appraisal standards:
  //   - 'adjustments' & 'quantitative' -> quantitative adjustment (% / $ popover)
  //   - 'qualitative' -> qualitative chip (SIM / SUP / INF)
  //   - 'valuation' -> calculated (read-only)
  inputType?: InputType;
  selectOptions?: string[];  // Only for inputType: 'select'
  unit?: string;  // Display unit (e.g., 'SF', 'AC', 'units')
}

// =================================================================
// UNIVERSAL ELEMENTS (All Property Types)
// =================================================================
const UNIVERSAL_ELEMENTS: ElementDefinition[] = [
  // Transaction Data - Core Fields
  {
    key: 'sale_price',
    label: 'Sale Price',
    description: 'Transaction sale price',
    propertyTypes: ['all'],
    approaches: ['all'],
    sections: ['transaction'],
    inputType: 'currency'
  },
  {
    key: 'sale_date',
    label: 'Sale Date',
    description: 'Date of sale/transfer',
    propertyTypes: ['all'],
    approaches: ['all'],
    sections: ['transaction'],
    inputType: 'date'
  },
  {
    key: 'address',
    label: 'Address',
    description: 'Property street address',
    propertyTypes: ['all'],
    approaches: ['all'],
    sections: ['transaction'],
    inputType: 'text'
  },
  {
    key: 'grantor',
    label: 'Grantor',
    description: 'Seller name',
    propertyTypes: ['all'],
    approaches: ['all'],
    sections: ['transaction'],
    inputType: 'text'
  },
  {
    key: 'grantee',
    label: 'Grantee',
    description: 'Buyer name',
    propertyTypes: ['all'],
    approaches: ['all'],
    sections: ['transaction'],
    inputType: 'text'
  },
  {
    key: 'data_source',
    label: 'Data Source',
    description: 'Source of comparable data (MLS, CoStar, etc.)',
    propertyTypes: ['all'],
    approaches: ['all'],
    sections: ['transaction'],
    inputType: 'text'
  },
  {
    key: 'verification',
    label: 'Verification',
    description: 'How data was verified',
    propertyTypes: ['all'],
    approaches: ['all'],
    sections: ['transaction'],
    inputType: 'text'
  },
  
  // Transactional Adjustments
  {
    key: 'property_rights',
    label: 'Property Rights',
    description: 'Property rights conveyed in transaction',
    propertyTypes: ['all'],
    approaches: ['all'],
    sections: ['transaction', 'adjustments'],
    inputType: 'select',
    selectOptions: ['Fee Simple', 'Leased Fee', 'Leasehold', 'Life Estate', 'Other']
  },
  {
    key: 'financing_terms',
    label: 'Financing Terms',
    description: 'Financing conditions of sale',
    propertyTypes: ['all'],
    approaches: ['all'],
    sections: ['transaction', 'adjustments'],
    inputType: 'select',
    selectOptions: ['Cash/Conventional', 'Seller Financing', 'Assumed Mortgage', 'Below Market', 'Other']
  },
  {
    key: 'conditions_of_sale',
    label: 'Conditions of Sale',
    description: 'Transaction conditions (arms-length, REO, etc.)',
    propertyTypes: ['all'],
    approaches: ['all'],
    sections: ['transaction', 'adjustments'],
    inputType: 'select',
    selectOptions: ['Arms-Length', 'REO/Bank Owned', 'Short Sale', 'Estate Sale', 'Relocation', 'Related Parties', 'Other']
  },
  {
    key: 'market_conditions',
    label: 'Market Conditions',
    description: 'Time adjustment for market changes',
    propertyTypes: ['all'],
    approaches: ['all'],
    sections: ['adjustments'],
    inputType: 'percentage'
  },
  
  // Universal Quantitative/Qualitative Adjustments
  {
    key: 'location',
    label: 'Location',
    description: 'Location quality adjustment',
    propertyTypes: ['all'],
    approaches: ['all'],
    sections: ['quantitative', 'qualitative']
  },
  {
    key: 'condition',
    label: 'Condition',
    description: 'Physical condition adjustment',
    propertyTypes: ['all'],
    approaches: ['all'],
    sections: ['quantitative', 'qualitative']
  },
  {
    key: 'age',
    label: 'Age/Effective Age',
    description: 'Building age adjustment',
    propertyTypes: ['commercial', 'residential'],
    approaches: ['all'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'yrs'
  },
  {
    key: 'quality',
    label: 'Quality',
    description: 'Construction quality adjustment',
    propertyTypes: ['commercial', 'residential'],
    approaches: ['all'],
    sections: ['quantitative', 'qualitative']
  },
  
  // Valuation Analysis (Universal)
  {
    key: 'net_adjustment',
    label: 'Net Adjustment',
    description: 'Sum of all adjustments',
    propertyTypes: ['all'],
    approaches: ['all'],
    sections: ['valuation']
  },
  {
    key: 'gross_adjustment',
    label: 'Gross Adjustment',
    description: 'Absolute sum of adjustments',
    propertyTypes: ['all'],
    approaches: ['all'],
    sections: ['valuation']
  },
  {
    key: 'adjusted_price',
    label: 'Adjusted Sale Price',
    description: 'Price after all adjustments',
    propertyTypes: ['all'],
    approaches: ['all'],
    sections: ['valuation']
  },
  {
    key: 'indicated_value',
    label: 'Indicated Value',
    description: 'Value indication from this comparable',
    propertyTypes: ['all'],
    approaches: ['all'],
    sections: ['valuation']
  }
];

// =================================================================
// COMMERCIAL - OFFICE ELEMENTS
// =================================================================
const COMMERCIAL_OFFICE_ELEMENTS: ElementDefinition[] = [
  {
    key: 'building_class',
    label: 'Building Class',
    description: 'Office building classification',
    propertyTypes: ['commercial'],
    subtypes: ['office'],
    approaches: ['sales_comparison', 'income'],
    sections: ['transaction', 'qualitative'],
    inputType: 'select',
    selectOptions: ['Class A', 'Class B', 'Class C']
  },
  {
    key: 'rentable_area',
    label: 'Rentable Area',
    description: 'Total rentable square footage',
    propertyTypes: ['commercial'],
    subtypes: ['office', 'retail'],
    approaches: ['sales_comparison', 'income'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'SF'
  },
  {
    key: 'floor_area_ratio',
    label: 'Floor Area Ratio (FAR)',
    description: 'Building area to land area ratio',
    propertyTypes: ['commercial'],
    subtypes: ['office', 'retail'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number'
  },
  {
    key: 'parking_ratio',
    label: 'Parking Ratio',
    description: 'Parking spaces per 1,000 SF',
    propertyTypes: ['commercial'],
    subtypes: ['office', 'retail', 'industrial'],
    approaches: ['sales_comparison', 'income'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: '/1,000 SF'
  },
  {
    key: 'typical_floor_size',
    label: 'Typical Floor Size',
    description: 'Average floor plate size',
    propertyTypes: ['commercial'],
    subtypes: ['office'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'SF'
  },
  {
    key: 'elevator_count',
    label: 'Elevator Count',
    description: 'Number of elevators',
    propertyTypes: ['commercial'],
    subtypes: ['office'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number'
  },
  {
    key: 'stories',
    label: 'Stories',
    description: 'Number of stories',
    propertyTypes: ['commercial', 'residential'],
    subtypes: ['office', 'retail', 'multifamily', 'townhome'],
    approaches: ['sales_comparison', 'income'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number'
  }
];

// =================================================================
// COMMERCIAL - RETAIL ELEMENTS
// =================================================================
const COMMERCIAL_RETAIL_ELEMENTS: ElementDefinition[] = [
  {
    key: 'frontage',
    label: 'Frontage',
    description: 'Street frontage in feet',
    propertyTypes: ['commercial', 'land'],
    subtypes: ['retail', 'commsite'],
    approaches: ['sales_comparison', 'land_valuation'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'ft'
  },
  {
    key: 'visibility',
    label: 'Visibility',
    description: 'Site visibility rating',
    propertyTypes: ['commercial'],
    subtypes: ['retail'],
    approaches: ['sales_comparison'],
    sections: ['qualitative']
  },
  {
    key: 'traffic_count',
    label: 'Traffic Count',
    description: 'Average daily traffic count',
    propertyTypes: ['commercial'],
    subtypes: ['retail'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'ADT'
  },
  {
    key: 'anchor_tenant',
    label: 'Anchor Tenant',
    description: 'Primary anchor tenant',
    propertyTypes: ['commercial'],
    subtypes: ['retail'],
    approaches: ['sales_comparison', 'income'],
    sections: ['transaction', 'qualitative'],
    inputType: 'text'
  },
  {
    key: 'pad_sites',
    label: 'Pad Sites',
    description: 'Number of pad sites',
    propertyTypes: ['commercial'],
    subtypes: ['retail'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number'
  },
  {
    key: 'drive_thru',
    label: 'Drive-Thru',
    description: 'Drive-through capability',
    propertyTypes: ['commercial'],
    subtypes: ['retail'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'qualitative'],
    inputType: 'select',
    selectOptions: ['Yes', 'No', 'Possible']
  }
];

// =================================================================
// COMMERCIAL - INDUSTRIAL ELEMENTS
// =================================================================
const COMMERCIAL_INDUSTRIAL_ELEMENTS: ElementDefinition[] = [
  {
    key: 'clear_height',
    label: 'Clear Height',
    description: 'Usable clear height in feet',
    propertyTypes: ['commercial'],
    subtypes: ['industrial'],
    approaches: ['sales_comparison', 'income'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'ft'
  },
  {
    key: 'dock_doors',
    label: 'Dock Doors',
    description: 'Number of dock-high doors',
    propertyTypes: ['commercial'],
    subtypes: ['industrial'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number'
  },
  {
    key: 'drive_in_doors',
    label: 'Drive-In Doors',
    description: 'Number of grade-level doors',
    propertyTypes: ['commercial'],
    subtypes: ['industrial'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number'
  },
  {
    key: 'power_amps',
    label: 'Power (Amps)',
    description: 'Electrical service amperage',
    propertyTypes: ['commercial'],
    subtypes: ['industrial'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'amps'
  },
  {
    key: 'crane_capacity',
    label: 'Crane Capacity',
    description: 'Overhead crane capacity',
    propertyTypes: ['commercial'],
    subtypes: ['industrial'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'tons'
  },
  {
    key: 'rail_access',
    label: 'Rail Access',
    description: 'Rail siding availability',
    propertyTypes: ['commercial'],
    subtypes: ['industrial'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'qualitative'],
    inputType: 'select',
    selectOptions: ['Yes', 'No', 'Nearby']
  },
  {
    key: 'office_percentage',
    label: '% Office',
    description: 'Percentage of office space',
    propertyTypes: ['commercial'],
    subtypes: ['industrial'],
    approaches: ['sales_comparison', 'income'],
    sections: ['transaction', 'quantitative'],
    inputType: 'percentage'
  },
  {
    key: 'sprinklers',
    label: 'Sprinklers',
    description: 'Fire sprinkler system',
    propertyTypes: ['commercial'],
    subtypes: ['industrial'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'qualitative'],
    inputType: 'select',
    selectOptions: ['ESFR', 'Wet', 'Dry', 'None']
  },
  {
    key: 'truck_court_depth',
    label: 'Truck Court Depth',
    description: 'Truck maneuvering area depth',
    propertyTypes: ['commercial'],
    subtypes: ['industrial'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'ft'
  },
  {
    key: 'column_spacing',
    label: 'Column Spacing',
    description: 'Bay/column spacing dimensions',
    propertyTypes: ['commercial'],
    subtypes: ['industrial'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'text'
  }
];

// =================================================================
// COMMERCIAL - MULTI-FAMILY (5+) ELEMENTS
// =================================================================
const COMMERCIAL_MULTIFAMILY_ELEMENTS: ElementDefinition[] = [
  {
    key: 'unit_count',
    label: 'Unit Count',
    description: 'Total number of units',
    propertyTypes: ['commercial'],
    subtypes: ['multifamily'],
    approaches: ['sales_comparison', 'income', 'multi_family'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'units'
  },
  {
    key: 'unit_mix',
    label: 'Unit Mix',
    description: 'Distribution of unit types',
    propertyTypes: ['commercial', 'residential'],
    subtypes: ['multifamily', '2-4unit'],
    approaches: ['sales_comparison', 'income', 'multi_family'],
    sections: ['transaction', 'qualitative'],
    inputType: 'text'
  },
  {
    key: 'avg_unit_size',
    label: 'Avg Unit Size',
    description: 'Average unit square footage',
    propertyTypes: ['commercial'],
    subtypes: ['multifamily'],
    approaches: ['sales_comparison', 'income', 'multi_family'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'SF'
  },
  {
    key: 'price_per_unit',
    label: 'Price/Unit',
    description: 'Sale price per unit',
    propertyTypes: ['commercial', 'residential'],
    subtypes: ['multifamily', '2-4unit'],
    approaches: ['sales_comparison', 'income', 'multi_family'],
    sections: ['transaction', 'valuation'],
    inputType: 'currency'
  },
  {
    key: 'rent_per_unit',
    label: 'Rent/Unit',
    description: 'Average rent per unit',
    propertyTypes: ['commercial'],
    subtypes: ['multifamily'],
    approaches: ['income', 'multi_family'],
    sections: ['transaction', 'cap_rate'],
    inputType: 'currency'
  },
  {
    key: 'occupancy_rate',
    label: 'Occupancy Rate',
    description: 'Physical occupancy at time of sale',
    propertyTypes: ['commercial'],
    subtypes: ['multifamily', 'hospitality', 'office', 'retail'],
    approaches: ['sales_comparison', 'income', 'multi_family'],
    sections: ['transaction', 'cap_rate'],
    inputType: 'percentage'
  },
  {
    key: 'laundry',
    label: 'Laundry',
    description: 'Laundry facilities type',
    propertyTypes: ['commercial'],
    subtypes: ['multifamily'],
    approaches: ['sales_comparison', 'multi_family'],
    sections: ['transaction', 'qualitative'],
    inputType: 'select',
    selectOptions: ['In-Unit', 'Common Area', 'Hookups Only', 'None']
  },
  {
    key: 'parking_type',
    label: 'Parking Type',
    description: 'Type of parking provided',
    propertyTypes: ['commercial'],
    subtypes: ['multifamily', 'office'],
    approaches: ['sales_comparison', 'income', 'multi_family'],
    sections: ['transaction', 'qualitative'],
    inputType: 'select',
    selectOptions: ['Covered', 'Garage', 'Surface', 'Street', 'None']
  },
  {
    key: 'amenities',
    label: 'Amenities',
    description: 'Property amenities',
    propertyTypes: ['commercial'],
    subtypes: ['multifamily'],
    approaches: ['sales_comparison', 'multi_family'],
    sections: ['qualitative']
  }
];

// =================================================================
// COMMERCIAL - HOSPITALITY ELEMENTS
// =================================================================
const COMMERCIAL_HOSPITALITY_ELEMENTS: ElementDefinition[] = [
  {
    key: 'room_count',
    label: 'Room Count',
    description: 'Total number of rooms/keys',
    propertyTypes: ['commercial'],
    subtypes: ['hospitality'],
    approaches: ['sales_comparison', 'income'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'keys'
  },
  {
    key: 'price_per_room',
    label: 'Price/Room',
    description: 'Sale price per room',
    propertyTypes: ['commercial'],
    subtypes: ['hospitality'],
    approaches: ['sales_comparison', 'income'],
    sections: ['transaction', 'valuation'],
    inputType: 'currency'
  },
  {
    key: 'adr',
    label: 'ADR',
    description: 'Average Daily Rate',
    propertyTypes: ['commercial'],
    subtypes: ['hospitality'],
    approaches: ['sales_comparison', 'income'],
    sections: ['transaction', 'cap_rate'],
    inputType: 'currency'
  },
  {
    key: 'revpar',
    label: 'RevPAR',
    description: 'Revenue per available room',
    propertyTypes: ['commercial'],
    subtypes: ['hospitality'],
    approaches: ['sales_comparison', 'income'],
    sections: ['transaction', 'cap_rate'],
    inputType: 'currency'
  },
  {
    key: 'brand_scale',
    label: 'Brand/Scale',
    description: 'Hotel brand and scale segment',
    propertyTypes: ['commercial'],
    subtypes: ['hospitality'],
    approaches: ['sales_comparison', 'income'],
    sections: ['transaction', 'qualitative'],
    inputType: 'select',
    selectOptions: ['Luxury', 'Upper Upscale', 'Upscale', 'Upper Midscale', 'Midscale', 'Economy', 'Independent']
  },
  {
    key: 'chain_affiliation',
    label: 'Chain',
    description: 'Chain/brand affiliation',
    propertyTypes: ['commercial'],
    subtypes: ['hospitality'],
    approaches: ['sales_comparison', 'income'],
    sections: ['transaction'],
    inputType: 'text'
  },
  {
    key: 'meeting_space',
    label: 'Meeting Space',
    description: 'Meeting/conference space SF',
    propertyTypes: ['commercial'],
    subtypes: ['hospitality'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'SF'
  },
  {
    key: 'fb_revenue',
    label: 'F&B Revenue',
    description: 'Food & beverage revenue',
    propertyTypes: ['commercial'],
    subtypes: ['hospitality'],
    approaches: ['income'],
    sections: ['cap_rate'],
    inputType: 'currency'
  }
];

// =================================================================
// COMMERCIAL - MIXED USE ELEMENTS
// =================================================================
const COMMERCIAL_MIXEDUSE_ELEMENTS: ElementDefinition[] = [
  {
    key: 'retail_sf',
    label: 'Retail SF',
    description: 'Retail component square footage',
    propertyTypes: ['commercial'],
    subtypes: ['mixeduse'],
    approaches: ['sales_comparison', 'income'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'SF'
  },
  {
    key: 'residential_units',
    label: 'Residential Units',
    description: 'Number of residential units',
    propertyTypes: ['commercial'],
    subtypes: ['mixeduse'],
    approaches: ['sales_comparison', 'income'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'units'
  },
  {
    key: 'office_sf',
    label: 'Office SF',
    description: 'Office component square footage',
    propertyTypes: ['commercial'],
    subtypes: ['mixeduse'],
    approaches: ['sales_comparison', 'income'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'SF'
  },
  {
    key: 'income_allocation',
    label: 'Income Allocation',
    description: 'Income breakdown by use',
    propertyTypes: ['commercial'],
    subtypes: ['mixeduse'],
    approaches: ['income'],
    sections: ['cap_rate'],
    inputType: 'text'
  }
];

// =================================================================
// RESIDENTIAL - SINGLE FAMILY ELEMENTS
// =================================================================
const RESIDENTIAL_SINGLEFAMILY_ELEMENTS: ElementDefinition[] = [
  {
    key: 'gla',
    label: 'Gross Living Area',
    description: 'Above-grade finished living area',
    propertyTypes: ['residential'],
    subtypes: ['singlefamily', 'townhome'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'SF'
  },
  {
    key: 'bedrooms',
    label: 'Bedrooms',
    description: 'Number of bedrooms',
    propertyTypes: ['residential'],
    subtypes: ['singlefamily', 'condo', 'townhome', '2-4unit'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number'
  },
  {
    key: 'bathrooms',
    label: 'Bathrooms',
    description: 'Number of bathrooms',
    propertyTypes: ['residential'],
    subtypes: ['singlefamily', 'condo', 'townhome', '2-4unit'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number'
  },
  {
    key: 'lot_size',
    label: 'Lot Size',
    description: 'Land area',
    propertyTypes: ['residential', 'land'],
    subtypes: ['singlefamily', 'townhome', 'reslot'],
    approaches: ['sales_comparison', 'land_valuation'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'SF'
  },
  {
    key: 'garage_spaces',
    label: 'Garage Spaces',
    description: 'Number of garage spaces',
    propertyTypes: ['residential'],
    subtypes: ['singlefamily', 'townhome'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number'
  },
  {
    key: 'basement_sf',
    label: 'Basement SF',
    description: 'Finished basement square footage',
    propertyTypes: ['residential'],
    subtypes: ['singlefamily', 'townhome'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'SF'
  },
  {
    key: 'year_built',
    label: 'Year Built',
    description: 'Original construction year',
    propertyTypes: ['residential', 'commercial'],
    approaches: ['sales_comparison'],
    sections: ['transaction'],
    inputType: 'number'
  },
  {
    key: 'pool',
    label: 'Pool',
    description: 'Swimming pool',
    propertyTypes: ['residential'],
    subtypes: ['singlefamily'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'select',
    selectOptions: ['Yes', 'No']
  },
  {
    key: 'fireplace',
    label: 'Fireplace',
    description: 'Number of fireplaces',
    propertyTypes: ['residential'],
    subtypes: ['singlefamily', 'townhome'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number'
  },
  {
    key: 'view',
    label: 'View',
    description: 'View quality/type',
    propertyTypes: ['residential'],
    approaches: ['sales_comparison'],
    sections: ['qualitative']
  },
  {
    key: 'design_style',
    label: 'Design/Style',
    description: 'Architectural style',
    propertyTypes: ['residential'],
    subtypes: ['singlefamily', 'townhome'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'qualitative'],
    inputType: 'text'
  },
  {
    key: 'functional_utility',
    label: 'Functional Utility',
    description: 'Layout and functionality',
    propertyTypes: ['residential'],
    approaches: ['sales_comparison'],
    sections: ['qualitative']
  },
  {
    key: 'energy_efficiency',
    label: 'Energy Efficiency',
    description: 'Energy efficient features',
    propertyTypes: ['residential'],
    approaches: ['sales_comparison'],
    sections: ['qualitative']
  }
];

// =================================================================
// RESIDENTIAL - CONDO ELEMENTS
// =================================================================
const RESIDENTIAL_CONDO_ELEMENTS: ElementDefinition[] = [
  {
    key: 'unit_sf',
    label: 'Unit SF',
    description: 'Unit square footage',
    propertyTypes: ['residential'],
    subtypes: ['condo'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'SF'
  },
  {
    key: 'floor_level',
    label: 'Floor Level',
    description: 'Unit floor location',
    propertyTypes: ['residential'],
    subtypes: ['condo'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'qualitative'],
    inputType: 'number'
  },
  {
    key: 'balcony',
    label: 'Balcony',
    description: 'Balcony/patio',
    propertyTypes: ['residential'],
    subtypes: ['condo'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'qualitative'],
    inputType: 'select',
    selectOptions: ['Yes', 'No']
  },
  {
    key: 'hoa_fees',
    label: 'HOA Fees',
    description: 'Monthly HOA fees',
    propertyTypes: ['residential'],
    subtypes: ['condo', 'townhome'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'currency'
  },
  {
    key: 'common_amenities',
    label: 'Common Amenities',
    description: 'Building/community amenities',
    propertyTypes: ['residential'],
    subtypes: ['condo', 'townhome'],
    approaches: ['sales_comparison'],
    sections: ['qualitative']
  },
  {
    key: 'parking_deeded',
    label: 'Parking',
    description: 'Parking type and spaces',
    propertyTypes: ['residential'],
    subtypes: ['condo'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'select',
    selectOptions: ['Deeded', 'Assigned', 'None']
  },
  {
    key: 'storage',
    label: 'Storage',
    description: 'Storage unit availability',
    propertyTypes: ['residential'],
    subtypes: ['condo'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'qualitative'],
    inputType: 'select',
    selectOptions: ['Yes', 'No']
  },
  {
    key: 'building_age',
    label: 'Building Age',
    description: 'Age of the building',
    propertyTypes: ['residential'],
    subtypes: ['condo'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'yrs'
  },
  {
    key: 'reserve_funding',
    label: 'Reserve Funding',
    description: 'HOA reserve funding status',
    propertyTypes: ['residential'],
    subtypes: ['condo'],
    approaches: ['sales_comparison'],
    sections: ['qualitative']
  }
];

// =================================================================
// RESIDENTIAL - TOWNHOME ELEMENTS
// =================================================================
const RESIDENTIAL_TOWNHOME_ELEMENTS: ElementDefinition[] = [
  {
    key: 'end_unit',
    label: 'End Unit',
    description: 'End unit vs interior',
    propertyTypes: ['residential'],
    subtypes: ['townhome'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'qualitative'],
    inputType: 'select',
    selectOptions: ['Yes', 'No']
  },
  {
    key: 'patio_deck',
    label: 'Patio/Deck',
    description: 'Outdoor living space',
    propertyTypes: ['residential'],
    subtypes: ['townhome', 'condo'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'qualitative'],
    inputType: 'select',
    selectOptions: ['Patio', 'Deck', 'Both', 'None']
  },
  {
    key: 'attached_walls',
    label: 'Attached Walls',
    description: 'Number of shared walls',
    propertyTypes: ['residential'],
    subtypes: ['townhome'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number'
  }
];

// =================================================================
// RESIDENTIAL - 2-4 UNIT ELEMENTS
// =================================================================
const RESIDENTIAL_24UNIT_ELEMENTS: ElementDefinition[] = [
  {
    key: 'total_gla',
    label: 'Total GLA',
    description: 'Total gross living area',
    propertyTypes: ['residential'],
    subtypes: ['2-4unit'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'SF'
  },
  {
    key: 'grm',
    label: 'Gross Rent Multiplier',
    description: 'Sale price / annual gross rent',
    propertyTypes: ['residential'],
    subtypes: ['2-4unit'],
    approaches: ['sales_comparison', 'income'],
    sections: ['transaction', 'valuation'],
    inputType: 'number'
  },
  {
    key: 'gross_income',
    label: 'Gross Income',
    description: 'Annual gross rental income',
    propertyTypes: ['residential', 'commercial'],
    subtypes: ['2-4unit', 'multifamily'],
    approaches: ['sales_comparison', 'income'],
    sections: ['transaction', 'cap_rate'],
    inputType: 'currency'
  },
  {
    key: 'vacancy_rate',
    label: 'Vacancy Rate',
    description: 'Current vacancy percentage',
    propertyTypes: ['residential', 'commercial'],
    subtypes: ['2-4unit', 'multifamily'],
    approaches: ['income'],
    sections: ['cap_rate'],
    inputType: 'percentage'
  },
  {
    key: 'separate_utilities',
    label: 'Separate Utilities',
    description: 'Individually metered utilities',
    propertyTypes: ['residential'],
    subtypes: ['2-4unit'],
    approaches: ['sales_comparison'],
    sections: ['transaction', 'qualitative'],
    inputType: 'select',
    selectOptions: ['All', 'Electric Only', 'Gas Only', 'None']
  },
  {
    key: 'below_market_rents',
    label: 'Below Market Rents',
    description: 'Rents below market level',
    propertyTypes: ['residential', 'commercial'],
    subtypes: ['2-4unit', 'multifamily'],
    approaches: ['sales_comparison', 'income'],
    sections: ['qualitative']
  }
];

// =================================================================
// LAND ELEMENTS
// =================================================================
const LAND_ELEMENTS: ElementDefinition[] = [
  {
    key: 'acreage',
    label: 'Acreage',
    description: 'Land area in acres',
    propertyTypes: ['land'],
    approaches: ['land_valuation', 'sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'number',
    unit: 'AC'
  },
  {
    key: 'price_per_acre',
    label: 'Price/Acre',
    description: 'Sale price per acre',
    propertyTypes: ['land'],
    approaches: ['land_valuation', 'sales_comparison'],
    sections: ['transaction', 'valuation'],
    inputType: 'currency'
  },
  {
    key: 'price_per_sf',
    label: 'Price/SF',
    description: 'Sale price per square foot',
    propertyTypes: ['land', 'commercial'],
    approaches: ['land_valuation', 'sales_comparison'],
    sections: ['transaction', 'valuation'],
    inputType: 'currency'
  },
  {
    key: 'zoning',
    label: 'Zoning',
    description: 'Zoning classification',
    propertyTypes: ['land', 'commercial', 'residential'],
    approaches: ['land_valuation', 'sales_comparison'],
    sections: ['transaction', 'qualitative'],
    inputType: 'text'
  },
  {
    key: 'topography',
    label: 'Topography',
    description: 'Land contour and slope',
    propertyTypes: ['land'],
    approaches: ['land_valuation', 'sales_comparison'],
    sections: ['transaction', 'qualitative'],
    inputType: 'select',
    selectOptions: ['Level', 'Gently Sloping', 'Moderate Slope', 'Steep', 'Rolling']
  },
  {
    key: 'utilities_available',
    label: 'Utilities',
    description: 'Available utilities',
    propertyTypes: ['land'],
    approaches: ['land_valuation', 'sales_comparison'],
    sections: ['transaction', 'qualitative'],
    inputType: 'text'
  },
  {
    key: 'flood_zone',
    label: 'Flood Zone',
    description: 'FEMA flood zone designation',
    propertyTypes: ['land'],
    approaches: ['land_valuation', 'sales_comparison'],
    sections: ['transaction', 'qualitative'],
    inputType: 'select',
    selectOptions: ['X', 'A', 'AE', 'AO', 'V', 'VE', 'Other']
  },
  {
    key: 'environmental',
    label: 'Environmental',
    description: 'Environmental conditions',
    propertyTypes: ['land'],
    approaches: ['land_valuation', 'sales_comparison'],
    sections: ['qualitative']
  },
  {
    key: 'entitlements',
    label: 'Entitlements',
    description: 'Development entitlements/approvals',
    propertyTypes: ['land'],
    approaches: ['land_valuation', 'sales_comparison'],
    sections: ['transaction', 'qualitative'],
    inputType: 'select',
    selectOptions: ['Fully Entitled', 'Partially Entitled', 'Unentitled']
  },
  {
    key: 'development_potential',
    label: 'Development Potential',
    description: 'Highest and best use potential',
    propertyTypes: ['land'],
    approaches: ['land_valuation', 'sales_comparison'],
    sections: ['qualitative']
  },
  {
    key: 'access',
    label: 'Access',
    description: 'Road access type',
    propertyTypes: ['land'],
    approaches: ['land_valuation', 'sales_comparison'],
    sections: ['transaction', 'qualitative'],
    inputType: 'select',
    selectOptions: ['Paved Road', 'Gravel Road', 'Dirt Road', 'Easement', 'Landlocked']
  },
  {
    key: 'shape',
    label: 'Shape',
    description: 'Parcel shape/configuration',
    propertyTypes: ['land'],
    approaches: ['land_valuation', 'sales_comparison'],
    sections: ['transaction', 'qualitative'],
    inputType: 'select',
    selectOptions: ['Regular', 'Irregular', 'Flag Lot', 'Corner']
  }
];

// =================================================================
// LAND - AGRICULTURAL ELEMENTS
// =================================================================
const LAND_AGRICULTURAL_ELEMENTS: ElementDefinition[] = [
  {
    key: 'irrigation',
    label: 'Irrigation',
    description: 'Irrigation system type',
    propertyTypes: ['land'],
    subtypes: ['agricultural'],
    approaches: ['land_valuation', 'sales_comparison'],
    sections: ['transaction', 'qualitative'],
    inputType: 'select',
    selectOptions: ['Flood', 'Pivot', 'Drip', 'None']
  },
  {
    key: 'water_rights',
    label: 'Water Rights',
    description: 'Water rights included',
    propertyTypes: ['land'],
    subtypes: ['agricultural'],
    approaches: ['land_valuation', 'sales_comparison'],
    sections: ['transaction', 'qualitative'],
    inputType: 'select',
    selectOptions: ['Yes - Adjudicated', 'Yes - Unadjudicated', 'No']
  },
  {
    key: 'mineral_rights',
    label: 'Mineral Rights',
    description: 'Mineral rights included',
    propertyTypes: ['land'],
    subtypes: ['agricultural'],
    approaches: ['land_valuation', 'sales_comparison'],
    sections: ['transaction', 'qualitative'],
    inputType: 'select',
    selectOptions: ['Yes', 'Partial', 'No']
  },
  {
    key: 'soil_class',
    label: 'Soil Class',
    description: 'USDA soil classification',
    propertyTypes: ['land'],
    subtypes: ['agricultural'],
    approaches: ['land_valuation', 'sales_comparison'],
    sections: ['transaction', 'quantitative'],
    inputType: 'text'
  },
  {
    key: 'crop_type',
    label: 'Crop Type',
    description: 'Current or historical crop',
    propertyTypes: ['land'],
    subtypes: ['agricultural'],
    approaches: ['land_valuation', 'sales_comparison'],
    sections: ['transaction'],
    inputType: 'text'
  }
];

// =================================================================
// CAP RATE / INCOME APPROACH ELEMENTS
// =================================================================
const INCOME_ELEMENTS: ElementDefinition[] = [
  {
    key: 'noi',
    label: 'Net Operating Income',
    description: 'Annual NOI',
    propertyTypes: ['commercial'],
    approaches: ['income', 'sales_comparison'],
    sections: ['cap_rate'],
    inputType: 'currency'
  },
  {
    key: 'cap_rate',
    label: 'Cap Rate',
    description: 'Capitalization rate',
    propertyTypes: ['commercial'],
    approaches: ['income', 'sales_comparison'],
    sections: ['cap_rate', 'valuation'],
    inputType: 'percentage'
  },
  {
    key: 'egim',
    label: 'EGIM',
    description: 'Effective Gross Income Multiplier',
    propertyTypes: ['commercial'],
    approaches: ['income'],
    sections: ['cap_rate', 'valuation'],
    inputType: 'number'
  },
  {
    key: 'expense_ratio',
    label: 'Expense Ratio',
    description: 'Operating expense ratio',
    propertyTypes: ['commercial'],
    approaches: ['income'],
    sections: ['cap_rate'],
    inputType: 'percentage'
  },
  {
    key: 'egi',
    label: 'Effective Gross Income',
    description: 'Gross income less vacancy',
    propertyTypes: ['commercial'],
    approaches: ['income'],
    sections: ['cap_rate'],
    inputType: 'currency'
  }
];

// =================================================================
// SCENARIO-SPECIFIC ELEMENTS
// =================================================================
const SCENARIO_ELEMENTS: ElementDefinition[] = [
  {
    key: 'stabilized_occupancy',
    label: 'Stabilized Occupancy',
    description: 'Projected stabilized occupancy',
    propertyTypes: ['commercial'],
    approaches: ['income', 'multi_family'],
    sections: ['cap_rate'],
    scenarios: ['as_stabilized'],
    inputType: 'percentage'
  },
  {
    key: 'lease_up_period',
    label: 'Lease-Up Period',
    description: 'Time to achieve stabilization',
    propertyTypes: ['commercial'],
    approaches: ['income', 'multi_family'],
    sections: ['cap_rate'],
    scenarios: ['as_stabilized'],
    inputType: 'number',
    unit: 'months'
  },
  {
    key: 'completion_date',
    label: 'Completion Date',
    description: 'Expected construction completion',
    propertyTypes: ['commercial', 'residential'],
    approaches: ['all'],
    sections: ['transaction'],
    scenarios: ['as_completed'],
    inputType: 'date'
  },
  {
    key: 'remaining_costs',
    label: 'Remaining Costs',
    description: 'Costs to complete construction',
    propertyTypes: ['commercial', 'residential'],
    approaches: ['all'],
    sections: ['transaction'],
    scenarios: ['as_completed'],
    inputType: 'currency'
  }
];

// =================================================================
// COMBINED ELEMENT REGISTRY
// =================================================================
export const ELEMENT_REGISTRY: ElementDefinition[] = [
  ...UNIVERSAL_ELEMENTS,
  ...COMMERCIAL_OFFICE_ELEMENTS,
  ...COMMERCIAL_RETAIL_ELEMENTS,
  ...COMMERCIAL_INDUSTRIAL_ELEMENTS,
  ...COMMERCIAL_MULTIFAMILY_ELEMENTS,
  ...COMMERCIAL_HOSPITALITY_ELEMENTS,
  ...COMMERCIAL_MIXEDUSE_ELEMENTS,
  ...RESIDENTIAL_SINGLEFAMILY_ELEMENTS,
  ...RESIDENTIAL_CONDO_ELEMENTS,
  ...RESIDENTIAL_TOWNHOME_ELEMENTS,
  ...RESIDENTIAL_24UNIT_ELEMENTS,
  ...LAND_ELEMENTS,
  ...LAND_AGRICULTURAL_ELEMENTS,
  ...INCOME_ELEMENTS,
  ...SCENARIO_ELEMENTS
];

// Export grouped registries for easier access if needed
export const ELEMENT_GROUPS = {
  universal: UNIVERSAL_ELEMENTS,
  commercial: {
    office: COMMERCIAL_OFFICE_ELEMENTS,
    retail: COMMERCIAL_RETAIL_ELEMENTS,
    industrial: COMMERCIAL_INDUSTRIAL_ELEMENTS,
    multifamily: COMMERCIAL_MULTIFAMILY_ELEMENTS,
    hospitality: COMMERCIAL_HOSPITALITY_ELEMENTS,
    mixeduse: COMMERCIAL_MIXEDUSE_ELEMENTS
  },
  residential: {
    singlefamily: RESIDENTIAL_SINGLEFAMILY_ELEMENTS,
    condo: RESIDENTIAL_CONDO_ELEMENTS,
    townhome: RESIDENTIAL_TOWNHOME_ELEMENTS,
    '2-4unit': RESIDENTIAL_24UNIT_ELEMENTS
  },
  land: {
    general: LAND_ELEMENTS,
    agricultural: LAND_AGRICULTURAL_ELEMENTS
  },
  income: INCOME_ELEMENTS,
  scenario: SCENARIO_ELEMENTS
};

