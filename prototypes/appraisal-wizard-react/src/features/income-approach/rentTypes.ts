/**
 * Rent Comparable Types
 * 
 * Matches the pattern from land-valuation/types.ts for consistency
 */

// Rent Comp Mode - determines which fields are displayed/used
export type RentCompMode = 'commercial' | 'residential';

export interface RentComp {
  id: string;
  address: string;
  cityStateZip: string;
  leaseDate: string;
  imageUrl: string;
  
  // Location coordinates for map display
  lat?: number;
  lng?: number;
  
  // =====================================================
  // COMMERCIAL MODE - Transaction Data
  // =====================================================
  hbuUse: string;
  sizeSfBldg: number;
  condition: string;
  nnnRentPerSf: number;
  
  // Optional Commercial Fields
  yearBuilt?: number;
  propertyType?: string;
  occupancy?: number;
  leaseType?: string;
  leaseTerm?: string;
  grossRentPerSf?: number;
  tenantType?: string;
  
  // =====================================================
  // RESIDENTIAL MODE - Transaction Data
  // (for multi-family rent comparables per plan)
  // =====================================================
  unitCount?: number;                    // Number of units
  bedBath?: string;                      // e.g., "2BR/1BA"
  avgSfPerUnit?: number;                 // Average SF per unit
  sfSource?: 'measured' | 'estimated' | 'unknown';  // SF certainty (unknown SF support)
  rentPerUnit?: number;                  // Monthly rent per unit
  rentPerSf?: number;                    // Calculated rent per SF
  
  // Optional Residential Fields
  includedUtilities?: string;
  petPolicy?: string;
  
  // =====================================================
  // QUALITATIVE ADJUSTMENTS (Both Modes)
  // =====================================================
  locationAdj: 'Superior' | 'Similar' | 'Inferior' | '-';
  hbuUseAdj: 'Superior' | 'Similar' | 'Inferior' | '-';
  sizeSfBldgAdj: 'Superior' | 'Similar' | 'Inferior' | '-';
  conditionAdj: 'Superior' | 'Similar' | 'Inferior' | '-';
  
  // Optional Qualitative Fields (Commercial)
  ageAdj?: 'Superior' | 'Similar' | 'Inferior' | '-';
  amenitiesAdj?: 'Superior' | 'Similar' | 'Inferior' | '-';
  parkingAdj?: 'Superior' | 'Similar' | 'Inferior' | '-';
  visibilityAdj?: 'Superior' | 'Similar' | 'Inferior' | '-';
  accessAdj?: 'Superior' | 'Similar' | 'Inferior' | '-';
  finishLevelAdj?: 'Superior' | 'Similar' | 'Inferior' | '-';
  ceilingHeightAdj?: 'Superior' | 'Similar' | 'Inferior' | '-';
  hvacAdj?: 'Superior' | 'Similar' | 'Inferior' | '-';
  
  // Optional Qualitative Fields (Residential)
  unitMixAdj?: 'Superior' | 'Similar' | 'Inferior' | '-';
  appliancesAdj?: 'Superior' | 'Similar' | 'Inferior' | '-';
  viewsAdj?: 'Superior' | 'Similar' | 'Inferior' | '-';
  balconyPatioAdj?: 'Superior' | 'Similar' | 'Inferior' | '-';
  
  // Overall
  overallComparability: 'Superior' | 'Similar' | 'Inferior';
}

export interface SubjectRentProperty {
  address: string;
  cityState: string;
  hbuUse: string;
  sizeSfBldg: number;
  sfSource?: 'measured' | 'estimated' | 'unknown';  // SF certainty (unknown SF support)
  condition: string;
  yearBuilt?: number;
  propertyType?: string;
  currentRentPerSf?: number;
  imageUrl: string;
  // Location coordinates for map display
  lat?: number;
  lng?: number;
  
  // Residential-specific fields
  unitCount?: number;
  bedBath?: string;
  avgSfPerUnit?: number;
  rentPerUnit?: number;
}

export interface RentGridRow {
  id: string;
  label: string;
  section: 'transaction' | 'qualitative' | 'footer';
  field?: keyof RentComp;
  removable?: boolean;
}





