import { LandComp, SubjectProperty, GridRow } from './types';

export const SUBJECT_PROPERTY: SubjectProperty = {
  address: 'N. Side of N. Kootenai Cr. Rd., W. of Wakantanka Way',
  cityState: 'Stevensville, MT',
  landSf: 68.565,
  landAcres: 68.565,
  hbuUse: 'Development Land',
  irrigation: 'Irrigated',
  utilities: 'Well/Elec.',
  topography: 'Level/Slightly Sloped',
  zoning: 'None',
  propRights: 'Fee Simple',
  financing: 'Cash to Seller',
  condSale: 'Typical',
  locationQuality: 'Good',
  imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
};

export const MOCK_LAND_COMPS: LandComp[] = [
  {
    id: 'land1',
    address: 'N. Side of Dry Gulch SEC Red Crow Rd. & Wild Rose Ln.',
    cityStateZip: 'Stevensville, MT',
    dateSold: '08-2024',
    location: 'Rd. W. of Store Ln.',
    salePrice: 650000,
    landSf: 50.15 * 43560, // Convert acres to SF
    landAcres: 50.15,
    pricePerAcre: 12961,
    pricePerSf: 0.30,
    imageUrl: 'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=400&h=300&fit=crop',
    hbuUse: 'Development Land',
    irrigation: 'None',
    utilities: 'Elec.',
    topography: 'Level/Sloped',
    zoning: 'None',
    propRights: 'Fee Simple',
    financing: 'Cash to Seller',
    condSale: 'Typical',
    marketCond: 'Similar',
    adjustment: 0,
    locationAdj: '-',
    irrigationAdj: 'Inferior',
    utilitiesAdj: 'Inferior',
    topographyAdj: 'Inferior',
    sizeAdj: '-',
    zoningAdj: '-',
    overallComparability: 'Inferior',
  },
  {
    id: 'land2',
    address: 'Red Crow Rd. & Wild Rose Ln.',
    cityStateZip: 'Victor, MT',
    dateSold: '01-2024',
    location: 'N. of Jenne Ln., E. of Heavens Way',
    salePrice: 1270000,
    landSf: 65.00 * 43560,
    landAcres: 65.00,
    pricePerAcre: 19538,
    pricePerSf: 0.45,
    imageUrl: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=400&h=300&fit=crop',
    hbuUse: 'Development Land',
    irrigation: 'None',
    utilities: 'Well/Septic/Elec.',
    topography: 'Level/Slightly Sloped',
    zoning: 'None',
    propRights: 'Fee Simple',
    financing: 'Cash to Seller',
    condSale: 'Typical',
    marketCond: 'Similar',
    adjustment: 0,
    locationAdj: 'Superior',
    irrigationAdj: 'Inferior',
    utilitiesAdj: 'Superior',
    topographyAdj: '-',
    sizeAdj: '-',
    zoningAdj: '-',
    overallComparability: 'Superior',
  },
  {
    id: 'land3',
    address: 'N. of Jenne Ln., E. of Heavens Way',
    cityStateZip: 'Florence, MT',
    dateSold: '06-2023',
    location: 'Heavens Way',
    salePrice: 560000,
    landSf: 80.00 * 43560,
    landAcres: 80.00,
    pricePerAcre: 7000,
    pricePerSf: 0.16,
    imageUrl: 'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=400&h=300&fit=crop',
    hbuUse: 'Development Land',
    irrigation: 'None',
    utilities: 'Elec.',
    topography: 'Level/Rolling',
    zoning: 'None',
    propRights: 'Fee Simple',
    financing: 'Cash to Seller',
    condSale: 'Typical',
    marketCond: 'Inferior',
    adjustment: 2.50,
    locationAdj: '-',
    irrigationAdj: 'Inferior',
    utilitiesAdj: 'Inferior',
    topographyAdj: '-',
    sizeAdj: 'Inferior',
    zoningAdj: '-',
    overallComparability: 'Inferior',
  },
];

export const TRANSACTION_DATA_ROWS: GridRow[] = [
  { id: 'dateSold', label: 'Date of Sale:', section: 'transaction', field: 'dateSold' },
  { id: 'location', label: 'Location:', section: 'transaction', field: 'location' },
  { id: 'cityState', label: 'City, St.:', section: 'transaction', field: 'cityStateZip' },
  { id: 'hbuUse', label: 'H & B Use:', section: 'transaction', field: 'hbuUse' },
  { id: 'irrigation', label: 'Irrigation:', section: 'transaction', field: 'irrigation' },
  { id: 'utilities', label: 'Utilities:', section: 'transaction', field: 'utilities' },
  { id: 'topography', label: 'Topography:', section: 'transaction', field: 'topography' },
  { id: 'zoning', label: 'Zoning:', section: 'transaction', field: 'zoning' },
  { id: 'salePrice', label: 'Sales Price:', section: 'transaction', field: 'salePrice' },
  { id: 'sizeAcres', label: 'Size/Acres:', section: 'transaction', field: 'landAcres' },
  { id: 'priceAcre', label: 'Price/Acre:', section: 'transaction', field: 'pricePerAcre' },
];

export const TRANSACTION_ADJ_ROWS: GridRow[] = [
  { id: 'propRights', label: 'Prop. Rights:', section: 'adjustments', field: 'propRights' },
  { id: 'financing', label: 'Financing:', section: 'adjustments', field: 'financing' },
  { id: 'condSale', label: 'Cond. Sale:', section: 'adjustments', field: 'condSale' },
  { id: 'marketCond', label: 'Market Cond.:', section: 'adjustments', field: 'marketCond' },
  { id: 'adjustment', label: 'Adjustment:', section: 'adjustments', field: 'adjustment' },
  { id: 'adjPriceAcre', label: 'Adj. $/Acre:', section: 'adjustments' },
];

export const QUALITATIVE_ROWS: GridRow[] = [
  { id: 'locationAdj', label: 'Location:', section: 'qualitative', field: 'locationAdj', removable: true },
  { id: 'irrigationAdj', label: 'Irrigation:', section: 'qualitative', field: 'irrigationAdj', removable: true },
  { id: 'utilitiesAdj', label: 'Utilities:', section: 'qualitative', field: 'utilitiesAdj', removable: true },
  { id: 'topographyAdj', label: 'Topography:', section: 'qualitative', field: 'topographyAdj', removable: true },
  { id: 'sizeAdj', label: 'Size/SF:', section: 'qualitative', field: 'sizeAdj', removable: true },
  { id: 'zoningAdj', label: 'Zoning:', section: 'qualitative', field: 'zoningAdj', removable: true },
];

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercent = (value: number): string => {
  return `${value >= 0 ? '' : ''}${(value * 100).toFixed(2)}%`;
};

// Available elements for adding to each section (based on Harken land valuation fields)
export interface AvailableElement {
  id: string;
  label: string;
  description?: string;
}

// Transaction Data available elements
export const AVAILABLE_TRANSACTION_ELEMENTS: AvailableElement[] = [
  { id: 'landType', label: 'Land Type', description: 'Agricultural, CBD, Industrial, Residential, etc.' },
  { id: 'lotShape', label: 'Lot Shape', description: 'Rectangular, Square, Irregular' },
  { id: 'frontageQuality', label: 'Frontage Quality', description: 'Poor, Fair, Average, Good, Excellent' },
  { id: 'lotFrontage', label: 'Lot Frontage', description: 'Front feet measurement' },
  { id: 'lotDepth', label: 'Lot Depth', description: 'Lot depth measurement' },
  { id: 'access', label: 'Access', description: 'Road access type' },
  { id: 'floodZone', label: 'Flood Zone', description: 'FEMA flood zone designation' },
  { id: 'cornerLot', label: 'Corner Lot', description: 'Yes/No' },
  { id: 'view', label: 'View', description: 'View quality assessment' },
  { id: 'environmental', label: 'Environmental', description: 'Environmental factors/conditions' },
];

// Transaction Adjustments available elements
export const AVAILABLE_ADJUSTMENT_ELEMENTS: AvailableElement[] = [
  { id: 'expendAfterSale', label: 'Expenditures After Sale', description: 'Post-sale expenditures adjustment' },
  { id: 'legalTitle', label: 'Legal/Title Issues', description: 'Title or legal encumbrances' },
  { id: 'personalProperty', label: 'Personal Property Included', description: 'Non-real property included' },
  { id: 'sellerConcessions', label: 'Seller Concessions', description: 'Seller-paid concessions' },
  { id: 'leaseEncumbrances', label: 'Lease Encumbrances', description: 'Existing lease impacts' },
];

// Qualitative Adjustments available elements
export const AVAILABLE_QUALITATIVE_ELEMENTS: AvailableElement[] = [
  { id: 'accessVisibility', label: 'Access/Visibility', description: 'Access and visibility comparison' },
  { id: 'viewAdj', label: 'View', description: 'View quality comparison' },
  { id: 'environmentalAdj', label: 'Environmental', description: 'Environmental factors comparison' },
  { id: 'floodZoneAdj', label: 'Flood Zone Status', description: 'Flood zone comparison' },
  { id: 'cornerInfluence', label: 'Corner Influence', description: 'Corner lot premium/adjustment' },
  { id: 'shapeConfig', label: 'Shape/Configuration', description: 'Lot shape comparison' },
  { id: 'frontageAdj', label: 'Frontage Quality', description: 'Frontage quality comparison' },
  { id: 'devPotential', label: 'Development Potential', description: 'Development potential comparison' },
  { id: 'waterRights', label: 'Water Rights', description: 'Water rights comparison' },
  { id: 'mineralRights', label: 'Mineral Rights', description: 'Mineral rights comparison' },
];

