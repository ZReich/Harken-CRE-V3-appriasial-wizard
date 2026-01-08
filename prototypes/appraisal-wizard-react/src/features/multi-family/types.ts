// Multi-Family Approach Types

/**
 * Override data for calculated fields
 */
export interface OverrideData {
  overrideValue: number | string;
  note: string;
  originalCalculated?: number | string | null;
  overriddenAt?: string;
}

export interface MultiFamilyComp {
  id: string;
  address: string;
  cityStateZip: string;
  imageUrl: string;
  
  // Transaction Data
  propertyType: string;
  bedBath: string;
  includedUtilities: string;
  rentalRatePerMonth: number;
  
  // Property Details
  unitCount?: number;
  yearBuilt?: number;
  condition?: string;
  
  // Quantitative Adjustments (percentage values)
  parkingAdj: number;
  qualityConditionAdj: number;
  yearBuiltAdj: number;
  
  // Qualitative Adjustments
  locationQual: 'Similar' | 'Superior' | 'Inferior';
  bedBathQual: 'Similar' | 'Superior' | 'Inferior';
  utilitiesQual: 'Similar' | 'Superior' | 'Inferior';
  parkingQual: 'Similar' | 'Superior' | 'Inferior';
  yearBuiltQual: 'Similar' | 'Superior' | 'Inferior';
  conditionQual: 'Similar' | 'Superior' | 'Inferior';
  
  // Overall
  overallComparability: 'Superior' | 'Similar' | 'Inferior';
  
  // Override for adjusted rental rate (calculated field)
  adjustedRateOverride?: OverrideData;
}

export interface MultiFamilySubject {
  address: string;
  cityState: string;
  imageUrl: string;
  propertyType: string;
  bedBath: string;
  includedUtilities: string;
  currentRentPerMonth?: number;
  unitCount?: number;
  yearBuilt?: number;
  condition?: string;
  parking?: string;
}

export interface MultiFamilyGridRow {
  id: string;
  label: string;
  section: 'transaction' | 'quantitative' | 'qualitative';
  field?: string;
  format?: 'currency' | 'percent' | 'number';
  removable?: boolean;
}

export interface AvailableMultiFamilyElement {
  id: string;
  label: string;
  description?: string;
  section: 'transaction' | 'quantitative' | 'qualitative';
}





