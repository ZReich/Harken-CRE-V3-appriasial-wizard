/**
 * Rent Comparable Types
 * 
 * Matches the pattern from land-valuation/types.ts for consistency
 */

export interface RentComp {
  id: string;
  address: string;
  cityStateZip: string;
  leaseDate: string;
  imageUrl: string;
  
  // Transaction Data
  hbuUse: string;
  sizeSfBldg: number;
  condition: string;
  nnnRentPerSf: number;
  
  // Optional Transaction Fields
  yearBuilt?: number;
  propertyType?: string;
  occupancy?: number;
  leaseType?: string;
  leaseTerm?: string;
  
  // Qualitative Adjustments
  locationAdj: 'Superior' | 'Similar' | 'Inferior' | '-';
  hbuUseAdj: 'Superior' | 'Similar' | 'Inferior' | '-';
  sizeSfBldgAdj: 'Superior' | 'Similar' | 'Inferior' | '-';
  conditionAdj: 'Superior' | 'Similar' | 'Inferior' | '-';
  
  // Optional Qualitative Fields
  ageAdj?: 'Superior' | 'Similar' | 'Inferior' | '-';
  amenitiesAdj?: 'Superior' | 'Similar' | 'Inferior' | '-';
  parkingAdj?: 'Superior' | 'Similar' | 'Inferior' | '-';
  
  // Overall
  overallComparability: 'Superior' | 'Similar' | 'Inferior';
}

export interface SubjectRentProperty {
  address: string;
  cityState: string;
  hbuUse: string;
  sizeSfBldg: number;
  condition: string;
  yearBuilt?: number;
  propertyType?: string;
  currentRentPerSf?: number;
  imageUrl: string;
}

export interface RentGridRow {
  id: string;
  label: string;
  section: 'transaction' | 'qualitative' | 'footer';
  field?: keyof RentComp;
  removable?: boolean;
}



