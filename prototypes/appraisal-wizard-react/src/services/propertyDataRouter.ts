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

// Property data now uses direct browser calls to Montana GIS API (no server-side proxy needed)

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
 * Route property lookup to appropriate service based on state
 * 
 * @param request - Property lookup request with coordinates, address, or parcel ID
 * @returns Promise resolving to property data from the appropriate source
 */
export async function getPropertyData(request: PropertyLookupRequest): Promise<PropertyLookupResult> {
  const { latitude, longitude, address, city, state, parcelId } = request;
  
  console.log('[PropertyDataRouter] getPropertyData called:', { address, city, state });
  
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

