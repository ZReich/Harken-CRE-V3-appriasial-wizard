/**
 * Rent Comparable Constants
 * 
 * Mock data and row configurations matching the LandSalesGrid pattern
 */

import { RentComp, SubjectRentProperty, RentGridRow } from './rentTypes';

// =================================================================
// SUBJECT PROPERTY
// =================================================================

export const SUBJECT_RENT_PROPERTY: SubjectRentProperty = {
  address: '1211 East Main Street',
  cityState: 'Bozeman, MT',
  hbuUse: 'Retail',
  sizeSfBldg: 4290, // 1,950 + 2,340 from photo
  condition: 'Average',
  yearBuilt: 1985,
  propertyType: 'Retail',
  currentRentPerSf: 23.31,
  imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
};

// =================================================================
// MOCK RENT COMPARABLES (from user's photo)
// =================================================================

export const MOCK_RENT_COMPS: RentComp[] = [
  {
    id: 'rent1',
    address: '129 W. Main Street, Unit A1',
    cityStateZip: 'Bozeman, MT',
    leaseDate: '2024-06',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    hbuUse: 'Retail',
    sizeSfBldg: 3088,
    condition: 'Vy. Good',
    nnnRentPerSf: 37.50,
    yearBuilt: 2018,
    propertyType: 'Retail',
    locationAdj: 'Superior',
    hbuUseAdj: '-',
    sizeSfBldgAdj: 'Inferior',
    conditionAdj: 'Superior',
    overallComparability: 'Superior',
  },
  {
    id: 'rent2',
    address: '867 S. 29th Ave., Unit 106',
    cityStateZip: 'Bozeman, MT',
    leaseDate: '2024-03',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    hbuUse: 'Retail',
    sizeSfBldg: 1772,
    condition: 'Vy. Good',
    nnnRentPerSf: 28.00,
    yearBuilt: 2015,
    propertyType: 'Retail',
    locationAdj: 'Inferior',
    hbuUseAdj: '-',
    sizeSfBldgAdj: '-',
    conditionAdj: 'Superior',
    overallComparability: 'Similar',
  },
  {
    id: 'rent3',
    address: '1531 W. Main Street, Unit 104',
    cityStateZip: 'Bozeman, MT',
    leaseDate: '2024-01',
    imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop',
    hbuUse: 'Retail',
    sizeSfBldg: 1396,
    condition: 'Average-',
    nnnRentPerSf: 23.50,
    yearBuilt: 1990,
    propertyType: 'Retail',
    locationAdj: '-',
    hbuUseAdj: '-',
    sizeSfBldgAdj: 'Superior',
    conditionAdj: 'Inferior',
    overallComparability: 'Similar',
  },
  {
    id: 'rent4',
    address: '425 East Babcock',
    cityStateZip: 'Bozeman, MT',
    leaseDate: '2023-09',
    imageUrl: 'https://images.unsplash.com/photo-1582037928769-181f2644ecb7?w=400&h=300&fit=crop',
    hbuUse: 'Retail/Storage',
    sizeSfBldg: 10409,
    condition: 'Average',
    nnnRentPerSf: 17.50,
    yearBuilt: 1978,
    propertyType: 'Retail/Warehouse',
    locationAdj: 'Inferior',
    hbuUseAdj: 'Inferior',
    sizeSfBldgAdj: 'Inferior',
    conditionAdj: '-',
    overallComparability: 'Inferior',
  },
];

// =================================================================
// ROW CONFIGURATIONS
// =================================================================

export const RENT_TRANSACTION_ROWS: RentGridRow[] = [
  { id: 'address', label: 'Address:', section: 'transaction', field: 'address' },
  { id: 'cityState', label: 'City:', section: 'transaction', field: 'cityStateZip' },
  { id: 'hbuUse', label: 'H & B Use:', section: 'transaction', field: 'hbuUse' },
  { id: 'sizeSfBldg', label: 'Size/SF Bldg.:', section: 'transaction', field: 'sizeSfBldg' },
  { id: 'condition', label: 'Condition:', section: 'transaction', field: 'condition' },
  { id: 'nnnRentPerSf', label: 'NNN Rent $/SF:', section: 'transaction', field: 'nnnRentPerSf' },
];

export const RENT_QUALITATIVE_ROWS: RentGridRow[] = [
  { id: 'locationAdj', label: 'Location:', section: 'qualitative', field: 'locationAdj', removable: true },
  { id: 'hbuUseAdj', label: 'H & B Use:', section: 'qualitative', field: 'hbuUseAdj', removable: true },
  { id: 'sizeSfBldgAdj', label: 'Size/SF Bldg.:', section: 'qualitative', field: 'sizeSfBldgAdj', removable: true },
  { id: 'conditionAdj', label: 'Condition:', section: 'qualitative', field: 'conditionAdj', removable: true },
];

// =================================================================
// AVAILABLE ELEMENTS FOR ADDING
// =================================================================

export interface AvailableRentElement {
  id: string;
  label: string;
  description?: string;
}

export const AVAILABLE_TRANSACTION_ELEMENTS: AvailableRentElement[] = [
  { id: 'leaseDate', label: 'Lease Date', description: 'Date lease was signed' },
  { id: 'yearBuilt', label: 'Year Built', description: 'Year of construction' },
  { id: 'propertyType', label: 'Property Type', description: 'Retail, Office, Industrial, etc.' },
  { id: 'occupancy', label: 'Occupancy %', description: 'Current occupancy rate' },
  { id: 'leaseType', label: 'Lease Type', description: 'NNN, Gross, Modified Gross' },
  { id: 'leaseTerm', label: 'Lease Term', description: 'Length of lease' },
  { id: 'grossRent', label: 'Gross Rent $/SF', description: 'Full service rent rate' },
  { id: 'tenantType', label: 'Tenant Type', description: 'National, Regional, Local' },
];

export const AVAILABLE_QUALITATIVE_ELEMENTS: AvailableRentElement[] = [
  { id: 'ageAdj', label: 'Age/Year Built', description: 'Building age comparison' },
  { id: 'amenitiesAdj', label: 'Amenities', description: 'Building amenities comparison' },
  { id: 'parkingAdj', label: 'Parking', description: 'Parking ratio/quality comparison' },
  { id: 'visibilityAdj', label: 'Visibility', description: 'Street visibility comparison' },
  { id: 'accessAdj', label: 'Access', description: 'Ingress/egress comparison' },
  { id: 'finishLevelAdj', label: 'Finish Level', description: 'Interior finish quality' },
  { id: 'ceilingHeightAdj', label: 'Ceiling Height', description: 'Clear height comparison' },
  { id: 'hvacAdj', label: 'HVAC Quality', description: 'HVAC system comparison' },
];

// =================================================================
// FORMATTING UTILITIES
// =================================================================

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatRentPerSf = (value: number): string => {
  return `$${value.toFixed(2)}`;
};



