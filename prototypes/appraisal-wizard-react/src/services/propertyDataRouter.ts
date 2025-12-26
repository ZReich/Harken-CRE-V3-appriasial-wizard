/**
 * Property Data Router
 * 
 * Routes property data requests to the appropriate service based on state:
 * - Montana (MT): Uses FREE Montana Cadastral GIS API
 * - Other states: Uses Cotality API (mock data until API is active)
 * 
 * This pattern provides significant cost savings for Montana-based properties.
 */

import { queryParcelByLocation, queryParcelByAddress, queryParcelByParcelId, isMontanaProperty } from './cadastralService';
import { getPropertyData as getCotalityData, mapCotalityToCadastralFormat } from './cotalityService';
import type { CadastralData, CadastralResponse } from '../types/api';

// Check if running in local development (localhost)
const isLocalDev = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export interface PropertyLookupRequest {
  // Location-based lookup
  latitude?: number;
  longitude?: number;
  
  // Address-based lookup
  address?: string;
  city?: string;
  state?: string;
  
  // Parcel ID lookup
  parcelId?: string;
}

export interface PropertyLookupResult {
  success: boolean;
  data: CadastralData | null;
  source: 'montana_cadastral' | 'cotality' | 'mock';
  isFreeService: boolean;
  error?: string;
}

/**
 * Generate mock property data for local development
 */
function generateLocalMockData(address?: string, city?: string, state?: string): CadastralData {
  console.log('[PropertyDataRouter] Generating mock data for local dev');
  return {
    parcelId: `MOCK-${Date.now().toString(36).toUpperCase()}`,
    legalDescription: `Lot 1, Block 1, ${city || 'Sample'} Subdivision, ${state || 'MT'}`,
    county: city ? `${city} County` : 'Yellowstone County',
    acres: 0.25 + Math.random() * 2,
    sqft: Math.round(10890 + Math.random() * 50000),
    situsAddress: address || '123 Main Street',
    situsCity: city || 'Billings',
    situsZip: '59102',
    ownerName: 'Sample Property Owner LLC',
    mailingAddress: `${address || '123 Main Street'}, ${city || 'Billings'}, ${state || 'MT'}`,
    assessedLandValue: Math.round(75000 + Math.random() * 150000),
    assessedImprovementValue: Math.round(150000 + Math.random() * 350000),
    totalAssessedValue: 0, // Will be calculated
    taxYear: new Date().getFullYear(),
    propertyType: 'Commercial',
    latitude: 45.7833 + (Math.random() - 0.5) * 0.1,
    longitude: -108.5007 + (Math.random() - 0.5) * 0.1,
  };
}

/**
 * Route property lookup to appropriate service based on state
 * 
 * @param request - Property lookup request with coordinates, address, or parcel ID
 * @returns Promise resolving to property data from the appropriate source
 */
export async function getPropertyData(request: PropertyLookupRequest): Promise<PropertyLookupResult> {
  const { latitude, longitude, address, city, state, parcelId } = request;
  
  console.log('[PropertyDataRouter] getPropertyData called:', { address, city, state, isLocalDev });
  
  // In local development, use mock data since Vercel API routes aren't available
  if (isLocalDev) {
    console.log('[PropertyDataRouter] Local dev mode - returning mock data');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    
    const mockData = generateLocalMockData(address, city, state);
    mockData.totalAssessedValue = mockData.assessedLandValue + mockData.assessedImprovementValue;
    
    return {
      success: true,
      data: mockData,
      source: 'mock',
      isFreeService: state ? isMontanaProperty(state) : true,
      error: undefined,
    };
  }
  
  // Determine if this is a Montana property
  const isMontana = state ? isMontanaProperty(state) : false;
  
  if (isMontana) {
    // Use FREE Montana Cadastral API
    let response: CadastralResponse;
    
    if (latitude !== undefined && longitude !== undefined) {
      response = await queryParcelByLocation(latitude, longitude, state);
    } else if (parcelId) {
      response = await queryParcelByParcelId(parcelId, state);
    } else if (address && city && state) {
      response = await queryParcelByAddress(address, city, state);
    } else {
      return {
        success: false,
        data: null,
        source: 'montana_cadastral',
        isFreeService: true,
        error: 'Insufficient lookup parameters. Provide coordinates, parcel ID, or full address.',
      };
    }
    
    return {
      success: response.success,
      data: response.data,
      source: response.source,
      isFreeService: true,
      error: response.error,
    };
  } else {
    // Use Cotality API (or mock) for out-of-state properties
    if (!address || !city || !state) {
      return {
        success: false,
        data: null,
        source: 'cotality',
        isFreeService: false,
        error: 'Address, city, and state are required for out-of-state property lookup.',
      };
    }
    
    const cotalityResponse = await getCotalityData(address, city, state);
    
    if (cotalityResponse.success && cotalityResponse.data) {
      const mappedData = mapCotalityToCadastralFormat(cotalityResponse.data);
      
      return {
        success: true,
        data: mappedData as CadastralData,
        source: cotalityResponse.source === 'mock' ? 'mock' : 'cotality',
        isFreeService: false,
      };
    }
    
    return {
      success: false,
      data: null,
      source: 'cotality',
      isFreeService: false,
      error: cotalityResponse.error || 'Failed to fetch property data',
    };
  }
}

/**
 * Get the cost indication for a property lookup
 * 
 * @param state - State code or name
 * @returns Object with cost information
 */
export function getLookupCostInfo(state: string): {
  isFree: boolean;
  provider: string;
  note: string;
} {
  if (isMontanaProperty(state)) {
    return {
      isFree: true,
      provider: 'Montana Cadastral GIS',
      note: 'Free service - Montana state GIS data',
    };
  }
  
  return {
    isFree: false,
    provider: 'Cotality (CoreLogic)',
    note: 'Paid service - Enterprise API pricing applies',
  };
}

/**
 * Check if property lookup is available for a given state
 * 
 * @param state - State code or name
 * @returns Object with availability information
 */
export function getServiceAvailability(state: string): {
  available: boolean;
  service: string;
  status: 'active' | 'mock' | 'unavailable';
} {
  if (isMontanaProperty(state)) {
    return {
      available: true,
      service: 'Montana Cadastral',
      status: 'active',
    };
  }
  
  // Cotality is currently using mock data
  return {
    available: true,
    service: 'Cotality',
    status: 'mock',
  };
}

