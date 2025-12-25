/**
 * Cotality (CoreLogic) Service
 * 
 * Provides property data for out-of-state properties.
 * Currently using mock data until Cotality API is reactivated.
 * 
 * 100% portable - works with Vercel API Routes or Harken backend.
 */

// Toggle this when Cotality API becomes available
const USE_MOCK_DATA = true;

export interface CotalityPropertyData {
  // Core Identification
  apn: string;
  fips: string;
  
  // Property Characteristics
  yearBuilt: number;
  effectiveYearBuilt: number;
  grossLivingArea: number;
  lotSizeSqFt: number;
  lotSizeAcres: number;
  bedrooms: number;
  bathrooms: number;
  stories: number;
  
  // Building Details
  constructionType: string;
  roofType: string;
  foundationType: string;
  heatingType: string;
  coolingType: string;
  
  // Valuation
  assessedLandValue: number;
  assessedImprovementValue: number;
  assessedTotalValue: number;
  marketValue: number;
  taxYear: number;
  
  // Owner Info
  ownerName: string;
  ownerMailingAddress: string;
  
  // Legal
  legalDescription: string;
  subdivision: string;
  zoning: string;
  
  // Address
  situsAddress: string;
  situsCity: string;
  situsState: string;
  situsZip: string;
  county: string;
  
  // Permits (for Risk Rating asset quality)
  permits: Array<{
    permitNumber: string;
    permitType: string;
    issueDate: string;
    completionDate: string;
    estimatedValue: number;
    description: string;
  }>;
}

export interface CotalityResponse {
  success: boolean;
  data: CotalityPropertyData | null;
  source: 'cotality' | 'mock';
  error?: string;
}

/**
 * Generate mock property data based on address
 */
function generateMockPropertyData(
  address: string,
  city: string,
  state: string
): CotalityPropertyData {
  // Generate deterministic-ish data based on address hash
  const hash = address.length + city.length + state.length;
  const yearBase = 1960 + (hash % 50);
  const sizeBase = 1500 + (hash % 3000);
  const lotBase = 5000 + (hash % 20000);
  const valueBase = 150000 + (hash % 500000);
  
  return {
    apn: `${hash.toString().padStart(3, '0')}-${(hash * 7).toString().padStart(4, '0')}-${(hash * 13).toString().padStart(3, '0')}`,
    fips: `${state.length.toString().padStart(2, '0')}${city.length.toString().padStart(3, '0')}`,
    
    yearBuilt: yearBase,
    effectiveYearBuilt: yearBase + (hash % 20),
    grossLivingArea: sizeBase,
    lotSizeSqFt: lotBase,
    lotSizeAcres: lotBase / 43560,
    bedrooms: 2 + (hash % 4),
    bathrooms: 1 + (hash % 3),
    stories: 1 + (hash % 2),
    
    constructionType: ['Wood Frame', 'Masonry', 'Steel Frame', 'Concrete'][hash % 4],
    roofType: ['Composition Shingle', 'Metal', 'Tile', 'Built-up'][hash % 4],
    foundationType: ['Slab', 'Crawl Space', 'Basement', 'Pier & Beam'][hash % 4],
    heatingType: ['Forced Air', 'Radiant', 'Heat Pump', 'Baseboard'][hash % 4],
    coolingType: ['Central Air', 'Window Units', 'Evaporative', 'None'][hash % 4],
    
    assessedLandValue: Math.round(valueBase * 0.3),
    assessedImprovementValue: Math.round(valueBase * 0.7),
    assessedTotalValue: valueBase,
    marketValue: Math.round(valueBase * 1.1),
    taxYear: new Date().getFullYear() - 1,
    
    ownerName: 'Property Owner',
    ownerMailingAddress: `${address}, ${city}, ${state}`,
    
    legalDescription: `Lot ${hash % 100} Block ${hash % 20} ${city.toUpperCase()} SUBDIVISION`,
    subdivision: `${city.toUpperCase()} SUBDIVISION`,
    zoning: ['R-1', 'R-2', 'C-1', 'C-2', 'M-1'][hash % 5],
    
    situsAddress: address,
    situsCity: city,
    situsState: state,
    situsZip: `${(10000 + hash % 90000).toString()}`,
    county: `${city} County`,
    
    permits: hash % 3 === 0 ? [
      {
        permitNumber: `P-${yearBase + 30}-${hash}`,
        permitType: 'Renovation',
        issueDate: `${yearBase + 30}-06-15`,
        completionDate: `${yearBase + 30}-12-20`,
        estimatedValue: Math.round(valueBase * 0.1),
        description: 'Kitchen and bathroom renovation',
      }
    ] : [],
  };
}

/**
 * Get property data from Cotality API
 * Currently returns mock data
 */
export async function getPropertyData(
  address: string,
  city: string,
  state: string
): Promise<CotalityResponse> {
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: generateMockPropertyData(address, city, state),
      source: 'mock',
    };
  }
  
  // TODO: Implement actual Cotality API call when available
  // return fetchFromCotalityAPI(address, city, state);
  
  return {
    success: false,
    data: null,
    source: 'cotality',
    error: 'Cotality API not yet configured',
  };
}

/**
 * Map Cotality data to the unified CadastralData format
 */
export function mapCotalityToCadastralFormat(cotality: CotalityPropertyData): {
  parcelId: string;
  legalDescription: string;
  county: string;
  acres: number;
  sqft: number;
  situsAddress: string;
  situsCity: string;
  situsZip: string;
  ownerName: string;
  mailingAddress: string;
  assessedLandValue: number;
  assessedImprovementValue: number;
  totalAssessedValue: number;
  taxYear: number;
  propertyType?: string;
  yearBuilt?: number;
  buildingSize?: number;
} {
  return {
    parcelId: cotality.apn,
    legalDescription: cotality.legalDescription,
    county: cotality.county,
    acres: cotality.lotSizeAcres,
    sqft: cotality.lotSizeSqFt,
    situsAddress: cotality.situsAddress,
    situsCity: cotality.situsCity,
    situsZip: cotality.situsZip,
    ownerName: cotality.ownerName,
    mailingAddress: cotality.ownerMailingAddress,
    assessedLandValue: cotality.assessedLandValue,
    assessedImprovementValue: cotality.assessedImprovementValue,
    totalAssessedValue: cotality.assessedTotalValue,
    taxYear: cotality.taxYear,
    propertyType: cotality.zoning,
    yearBuilt: cotality.yearBuilt,
    buildingSize: cotality.grossLivingArea,
  };
}

