import { MultiFamilyComp, MultiFamilySubject, MultiFamilyGridRow, AvailableMultiFamilyElement } from './types';

// Subject Property
export const SUBJECT_MF_PROPERTY: MultiFamilySubject = {
  address: '1110 Lynn Ave',
  cityState: 'Billings, MT, 59102',
  imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop',
  propertyType: 'Office / Professional Office St...',
  bedBath: '2 BR / 1 BA',
  includedUtilities: 'Water, Trash',
  currentRentPerMonth: 1250,
  unitCount: 12,
  yearBuilt: 1979,
  condition: 'Average',
  parking: 'Surface Lot',
};

// Mock Comparable Rentals
export const MOCK_MF_COMPS: MultiFamilyComp[] = [
  {
    id: 'mf1',
    address: '2345 Central Ave',
    cityStateZip: 'Billings, MT 59102',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
    propertyType: 'Multi-Family',
    bedBath: '2 BR / 1 BA',
    includedUtilities: 'Water, Trash',
    rentalRatePerMonth: 1350,
    unitCount: 8,
    yearBuilt: 1985,
    condition: 'Average',
    parkingAdj: 0,
    qualityConditionAdj: 0,
    yearBuiltAdj: -2.5,
    locationQual: 'Similar',
    bedBathQual: 'Similar',
    utilitiesQual: 'Similar',
    parkingQual: 'Similar',
    yearBuiltQual: 'Inferior',
    conditionQual: 'Similar',
    overallComparability: 'Similar',
  },
  {
    id: 'mf2',
    address: '789 Montana Ave',
    cityStateZip: 'Billings, MT 59101',
    imageUrl: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400&h=300&fit=crop',
    propertyType: 'Multi-Family',
    bedBath: '2 BR / 2 BA',
    includedUtilities: 'Water, Trash, Gas',
    rentalRatePerMonth: 1475,
    unitCount: 16,
    yearBuilt: 1995,
    condition: 'Good',
    parkingAdj: 2.5,
    qualityConditionAdj: 5,
    yearBuiltAdj: 0,
    locationQual: 'Superior',
    bedBathQual: 'Superior',
    utilitiesQual: 'Superior',
    parkingQual: 'Similar',
    yearBuiltQual: 'Superior',
    conditionQual: 'Superior',
    overallComparability: 'Superior',
  },
  {
    id: 'mf3',
    address: '456 Rimrock Rd',
    cityStateZip: 'Billings, MT 59102',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    propertyType: 'Multi-Family',
    bedBath: '1 BR / 1 BA',
    includedUtilities: 'None',
    rentalRatePerMonth: 995,
    unitCount: 24,
    yearBuilt: 1972,
    condition: 'Fair',
    parkingAdj: -5,
    qualityConditionAdj: -7.5,
    yearBuiltAdj: -5,
    locationQual: 'Similar',
    bedBathQual: 'Inferior',
    utilitiesQual: 'Inferior',
    parkingQual: 'Inferior',
    yearBuiltQual: 'Inferior',
    conditionQual: 'Inferior',
    overallComparability: 'Inferior',
  },
];

// Transaction Data Rows
export const TRANSACTION_ROWS: MultiFamilyGridRow[] = [
  { id: 'location', label: 'Location:', section: 'transaction', field: 'address' },
  { id: 'propertyType', label: 'Property Type:', section: 'transaction', field: 'propertyType' },
  { id: 'bedBath', label: 'Bed/Bath:', section: 'transaction', field: 'bedBath' },
  { id: 'includedUtilities', label: 'Included Utilities:', section: 'transaction', field: 'includedUtilities' },
  { id: 'rentalRate', label: 'Rental Rates $/Mo.:', section: 'transaction', field: 'rentalRatePerMonth', format: 'currency' },
];

// Quantitative Adjustment Rows
export const QUANTITATIVE_ROWS: MultiFamilyGridRow[] = [
  { id: 'parkingAdj', label: 'Parking:', section: 'quantitative', field: 'parkingAdj', format: 'percent', removable: true },
  { id: 'qualityConditionAdj', label: 'Quality / Condition:', section: 'quantitative', field: 'qualityConditionAdj', format: 'percent', removable: true },
  { id: 'yearBuiltAdj', label: 'Year Built / Renovations:', section: 'quantitative', field: 'yearBuiltAdj', format: 'percent', removable: true },
];

// Qualitative Adjustment Rows
export const QUALITATIVE_ROWS: MultiFamilyGridRow[] = [
  { id: 'locationQual', label: 'Location:', section: 'qualitative', field: 'locationQual', removable: true },
  { id: 'bedBathQual', label: 'Bed/Bath:', section: 'qualitative', field: 'bedBathQual', removable: true },
  { id: 'utilitiesQual', label: 'Utilities:', section: 'qualitative', field: 'utilitiesQual', removable: true },
  { id: 'parkingQual', label: 'Parking:', section: 'qualitative', field: 'parkingQual', removable: true },
  { id: 'yearBuiltQual', label: 'Year Built:', section: 'qualitative', field: 'yearBuiltQual', removable: true },
  { id: 'conditionQual', label: 'Condition:', section: 'qualitative', field: 'conditionQual', removable: true },
];

// Available Elements to Add
export const AVAILABLE_TRANSACTION_ELEMENTS: AvailableMultiFamilyElement[] = [
  { id: 'unitCount', label: 'Unit Count', description: 'Number of rental units', section: 'transaction' },
  { id: 'yearBuilt', label: 'Year Built', description: 'Original construction year', section: 'transaction' },
  { id: 'grossRent', label: 'Gross Rent', description: 'Total monthly rent revenue', section: 'transaction' },
  { id: 'occupancy', label: 'Occupancy Rate', description: 'Current occupancy percentage', section: 'transaction' },
  { id: 'leaseType', label: 'Lease Type', description: 'Month-to-month, Annual, etc.', section: 'transaction' },
];

export const AVAILABLE_QUANTITATIVE_ELEMENTS: AvailableMultiFamilyElement[] = [
  { id: 'locationAdj', label: 'Location Adjustment', description: 'Percentage adjustment for location', section: 'quantitative' },
  { id: 'sizeAdj', label: 'Size Adjustment', description: 'Adjustment for unit size differences', section: 'quantitative' },
  { id: 'amenitiesAdj', label: 'Amenities Adjustment', description: 'Adjustment for amenity differences', section: 'quantitative' },
  { id: 'occupancyAdj', label: 'Occupancy Adjustment', description: 'Adjustment for occupancy differences', section: 'quantitative' },
];

export const AVAILABLE_QUALITATIVE_ELEMENTS: AvailableMultiFamilyElement[] = [
  { id: 'accessQual', label: 'Access/Visibility', description: 'Property access and visibility', section: 'qualitative' },
  { id: 'amenitiesQual', label: 'Amenities', description: 'Common area amenities', section: 'qualitative' },
  { id: 'managementQual', label: 'Management Quality', description: 'Professional management', section: 'qualitative' },
  { id: 'viewQual', label: 'View', description: 'View quality comparison', section: 'qualitative' },
];

// Formatting helpers
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercent = (value: number): string => {
  if (value === 0) return '-';
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

// Grid column widths
export const LABEL_COL_WIDTH = 160;
export const SUBJECT_COL_WIDTH = 180;
export const COMP_COL_WIDTH = 170;
export const ACTION_COL_WIDTH = 160;



