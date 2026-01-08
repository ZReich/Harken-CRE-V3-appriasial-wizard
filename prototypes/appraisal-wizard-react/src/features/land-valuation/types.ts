/**
 * Override data for calculated fields
 */
export interface OverrideData {
  overrideValue: number | string;
  note: string;
  originalCalculated?: number | string | null;
  overriddenAt?: string;
}

export interface LandComp {
  id: string;
  address: string;
  cityStateZip: string;
  dateSold: string;
  salePrice: number;
  landSf: number;
  landAcres: number;
  pricePerAcre: number;
  pricePerSf: number;
  imageUrl: string;
  // Location coordinates for map display
  lat?: number;
  lng?: number;
  // Transaction Data
  location: string;
  hbuUse: string;
  irrigation: string;
  utilities: string;
  topography: string;
  zoning: string;
  // Transaction Adjustments
  propRights: string;
  financing: string;
  condSale: string;
  marketCond: 'Similar' | 'Superior' | 'Inferior';
  adjustment: number; // percentage
  // Qualitative Adjustments
  locationAdj: 'Superior' | 'Similar' | 'Inferior' | '-';
  irrigationAdj: 'Superior' | 'Similar' | 'Inferior' | '-';
  utilitiesAdj: 'Superior' | 'Similar' | 'Inferior' | '-';
  topographyAdj: 'Superior' | 'Similar' | 'Inferior' | '-';
  sizeAdj: 'Superior' | 'Similar' | 'Inferior' | '-';
  zoningAdj: 'Superior' | 'Similar' | 'Inferior' | '-';
  // Overall
  overallComparability: 'Superior' | 'Similar' | 'Inferior';
  // Override for adjusted $/acre (calculated field)
  adjPricePerAcreOverride?: OverrideData;
}

export interface SubjectProperty {
  address: string;
  cityState: string;
  landSf: number;
  landAcres: number;
  hbuUse: string;
  irrigation: string;
  utilities: string;
  topography: string;
  zoning: string;
  propRights: string;
  financing: string;
  condSale: string;
  locationQuality: string;
  imageUrl: string;
  // Location coordinates for map display
  lat?: number;
  lng?: number;
}

export interface GridRow {
  id: string;
  label: string;
  section: 'transaction' | 'transactionAdj' | 'adjustments' | 'qualitative' | 'footer';
  field?: keyof LandComp;
  removable?: boolean;
}

