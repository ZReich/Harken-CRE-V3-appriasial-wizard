/**
 * Cotality (CoreLogic) API Wrapper
 * 
 * Provides property data for out-of-state (non-Montana) properties.
 * Cotality is the rebranded CoreLogic property data service.
 * 
 * API Documentation: https://developer.corelogic.com/
 * 
 * Environment Variables Required:
 * - COTALITY_API_KEY: API key for Cotality/CoreLogic
 * - COTALITY_API_SECRET: API secret for OAuth
 * 
 * 100% portable - can be copied directly to Harken backend.
 */

import fetch from 'node-fetch';

// Cotality API endpoints
const COTALITY_AUTH_URL = 'https://api-prod.corelogic.com/oauth/token';
const COTALITY_PROPERTY_URL = 'https://api-prod.corelogic.com/property/v2';

// =================================================================
// TYPES
// =================================================================

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
  
  // Coordinates
  latitude?: number;
  longitude?: number;
  
  // Permits (from Cotality data)
  permits: Array<{
    permitNumber: string;
    permitType: string;
    issueDate: string;
    completionDate: string;
    estimatedValue: number;
    description: string;
  }>;
}

export interface CotalityQueryResult {
  success: boolean;
  data: CotalityPropertyData | null;
  source: 'cotality' | 'mock';
  error?: string;
}

// =================================================================
// CONFIGURATION
// =================================================================

/**
 * Check if Cotality API is configured
 */
export function isCotalityConfigured(): boolean {
  return !!(process.env.COTALITY_API_KEY && process.env.COTALITY_API_SECRET);
}

/**
 * Get OAuth token for Cotality API
 */
async function getCotalityToken(): Promise<string> {
  const apiKey = process.env.COTALITY_API_KEY;
  const apiSecret = process.env.COTALITY_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    throw new Error('Cotality API credentials not configured');
  }
  
  const response = await fetch(COTALITY_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });
  
  if (!response.ok) {
    throw new Error(`Cotality auth failed: ${response.status}`);
  }
  
  const data = await response.json() as { access_token: string };
  return data.access_token;
}

// =================================================================
// QUERY FUNCTIONS
// =================================================================

/**
 * Query property data from Cotality by address
 */
export async function queryCotalityByAddress(
  address: string,
  city: string,
  state: string,
  zip?: string
): Promise<CotalityQueryResult> {
  if (!isCotalityConfigured()) {
    console.log('[Cotality] API not configured, using mock data');
    return {
      success: true,
      data: generateMockCotalityData(address, city, state),
      source: 'mock',
    };
  }
  
  try {
    const token = await getCotalityToken();
    
    // Build address query
    const queryParams = new URLSearchParams({
      address: address,
      city: city,
      state: state,
      ...(zip && { zip }),
    });
    
    const response = await fetch(
      `${COTALITY_PROPERTY_URL}/search?${queryParams}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Cotality query failed: ${response.status}`);
    }
    
    const data = await response.json() as { properties?: Array<Record<string, unknown>> };
    
    if (!data.properties || data.properties.length === 0) {
      return {
        success: true,
        data: null,
        source: 'cotality',
        error: 'No property found at this address',
      };
    }
    
    return {
      success: true,
      data: mapCotalityResponse(data.properties[0]),
      source: 'cotality',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Cotality] Query error:', message);
    
    // Fall back to mock data on error
    return {
      success: true,
      data: generateMockCotalityData(address, city, state),
      source: 'mock',
      error: `Cotality API error: ${message}. Using estimated data.`,
    };
  }
}

/**
 * Query property data from Cotality by coordinates
 */
export async function queryCotalityByLocation(
  latitude: number,
  longitude: number
): Promise<CotalityQueryResult> {
  if (!isCotalityConfigured()) {
    console.log('[Cotality] API not configured, using mock data');
    return {
      success: true,
      data: generateMockCotalityData('Unknown Address', 'Unknown City', 'XX'),
      source: 'mock',
    };
  }
  
  try {
    const token = await getCotalityToken();
    
    const response = await fetch(
      `${COTALITY_PROPERTY_URL}/geo?latitude=${latitude}&longitude=${longitude}&radius=0.01`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Cotality geo query failed: ${response.status}`);
    }
    
    const data = await response.json() as { properties?: Array<Record<string, unknown>> };
    
    if (!data.properties || data.properties.length === 0) {
      return {
        success: true,
        data: null,
        source: 'cotality',
        error: 'No property found at this location',
      };
    }
    
    const propertyData = mapCotalityResponse(data.properties[0]);
    propertyData.latitude = latitude;
    propertyData.longitude = longitude;
    
    return {
      success: true,
      data: propertyData,
      source: 'cotality',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Cotality] Geo query error:', message);
    
    return {
      success: true,
      data: generateMockCotalityData('Unknown Address', 'Unknown City', 'XX'),
      source: 'mock',
      error: `Cotality API error: ${message}. Using estimated data.`,
    };
  }
}

// =================================================================
// MAPPING FUNCTIONS
// =================================================================

/**
 * Map Cotality API response to our standard format
 */
function mapCotalityResponse(property: Record<string, unknown>): CotalityPropertyData {
  // This mapping will need to be adjusted based on actual Cotality API response
  // The field names below are based on typical CoreLogic/Cotality field naming
  return {
    apn: String(property.apn || property.assessorParcelNumber || ''),
    fips: String(property.fipsCode || ''),
    
    yearBuilt: Number(property.yearBuilt) || 0,
    effectiveYearBuilt: Number(property.effectiveYearBuilt || property.yearBuilt) || 0,
    grossLivingArea: Number(property.buildingArea || property.grossLivingArea) || 0,
    lotSizeSqFt: Number(property.lotSizeSqFt || property.landArea) || 0,
    lotSizeAcres: Number(property.lotSizeAcres) || (Number(property.lotSizeSqFt) / 43560) || 0,
    bedrooms: Number(property.bedrooms) || 0,
    bathrooms: Number(property.bathrooms || property.bathroomsFull) || 0,
    stories: Number(property.stories || property.numberOfStories) || 1,
    
    constructionType: String(property.constructionType || property.buildingCondition || ''),
    roofType: String(property.roofType || property.roofCover || ''),
    foundationType: String(property.foundationType || ''),
    heatingType: String(property.heatingType || ''),
    coolingType: String(property.coolingType || property.airConditioningType || ''),
    
    assessedLandValue: Number(property.assessedLandValue || property.landValue) || 0,
    assessedImprovementValue: Number(property.assessedImprovementValue || property.improvementValue) || 0,
    assessedTotalValue: Number(property.assessedTotalValue || property.totalAssessedValue) || 0,
    marketValue: Number(property.marketValue || property.estimatedValue) || 0,
    taxYear: Number(property.taxYear || property.assessmentYear) || new Date().getFullYear(),
    
    ownerName: String(property.ownerName || property.owner1FullName || ''),
    ownerMailingAddress: String(property.ownerMailingAddress || property.mailAddress || ''),
    
    legalDescription: String(property.legalDescription || property.legal1 || ''),
    subdivision: String(property.subdivision || property.subdivisionName || ''),
    zoning: String(property.zoning || property.zoningCode || ''),
    
    situsAddress: String(property.situsAddress || property.propertyAddress || ''),
    situsCity: String(property.situsCity || property.city || ''),
    situsState: String(property.situsState || property.state || ''),
    situsZip: String(property.situsZip || property.zip || ''),
    county: String(property.county || property.countyName || ''),
    
    latitude: property.latitude ? Number(property.latitude) : undefined,
    longitude: property.longitude ? Number(property.longitude) : undefined,
    
    permits: [], // Permits would be in a separate API call or field
  };
}

// =================================================================
// MOCK DATA
// =================================================================

/**
 * Generate mock property data for development/demo
 */
function generateMockCotalityData(
  address: string,
  city: string,
  state: string
): CotalityPropertyData {
  // Generate deterministic data based on address hash
  const hash = Math.abs(hashString(address + city + state));
  const yearBase = 1960 + (hash % 50);
  const sizeBase = 1500 + (hash % 3000);
  const lotBase = 5000 + (hash % 20000);
  const valueBase = 150000 + (hash % 500000);
  
  return {
    apn: `${(hash % 999).toString().padStart(3, '0')}-${((hash * 7) % 9999).toString().padStart(4, '0')}-${((hash * 13) % 999).toString().padStart(3, '0')}`,
    fips: `${(hash % 99).toString().padStart(2, '0')}${((hash + 1) % 999).toString().padStart(3, '0')}`,
    
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
        permitNumber: `P-${yearBase + 30}-${hash % 9999}`,
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
 * Simple string hash function
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

/**
 * Map Cotality data to unified CadastralData format (for compatibility with Montana data)
 */
export function mapCotalityToCadastral(cotality: CotalityPropertyData) {
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
    propertyType: 'Commercial',
    zoning: cotality.zoning,
    yearBuilt: cotality.yearBuilt,
    buildingSize: cotality.grossLivingArea,
    latitude: cotality.latitude,
    longitude: cotality.longitude,
  };
}
