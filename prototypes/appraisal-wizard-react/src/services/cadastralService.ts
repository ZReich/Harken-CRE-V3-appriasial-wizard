/**
 * Cadastral Service
 * 
 * Provides property parcel data lookup functionality.
 * Montana: Uses free state GIS data
 * Other states: Uses mock data (Cotality integration pending)
 * 
 * 100% portable - works with Vercel API Routes or Harken backend.
 */

import { apiPost } from './api';
import type { CadastralQueryRequest, CadastralResponse, CadastralData } from '../types/api';

/**
 * Query parcel data by coordinates
 * 
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param state - State code (e.g., 'MT')
 * @returns Promise resolving to cadastral data
 */
export async function queryParcelByLocation(
  latitude: number,
  longitude: number,
  state?: string
): Promise<CadastralResponse> {
  const request: CadastralQueryRequest = {
    latitude,
    longitude,
    state,
  };

  return apiPost<CadastralResponse, CadastralQueryRequest>(
    '/cadastral/query',
    request
  );
}

/**
 * Query parcel data by Parcel ID / Tax ID
 * 
 * @param parcelId - The parcel/tax ID
 * @param state - State code (e.g., 'MT')
 * @returns Promise resolving to cadastral data
 */
export async function queryParcelByParcelId(
  parcelId: string,
  state?: string
): Promise<CadastralResponse> {
  const request: CadastralQueryRequest = {
    parcelId,
    state,
  };

  return apiPost<CadastralResponse, CadastralQueryRequest>(
    '/cadastral/query',
    request
  );
}

/**
 * Query parcel data by address
 * 
 * @param address - Street address
 * @param city - City name
 * @param state - State code (e.g., 'MT')
 * @returns Promise resolving to cadastral data
 */
export async function queryParcelByAddress(
  address: string,
  city: string,
  state: string
): Promise<CadastralResponse> {
  const request: CadastralQueryRequest = {
    address,
    city,
    state,
  };

  return apiPost<CadastralResponse, CadastralQueryRequest>(
    '/cadastral/query',
    request
  );
}

/**
 * Check if a state uses free Montana Cadastral API
 * 
 * @param state - State code or name
 * @returns true if Montana (free), false otherwise
 */
export function isMontanaProperty(state: string): boolean {
  const normalized = state.toUpperCase().trim();
  return normalized === 'MT' || normalized === 'MONTANA';
}

/**
 * Map cadastral data to wizard subject data format
 * 
 * @param cadastral - Cadastral API response data
 * @returns Object with wizard-compatible field names
 */
export function mapCadastralToSubjectData(cadastral: CadastralData): Record<string, string | number> {
  return {
    // Address fields
    address_street: cadastral.situsAddress,
    address_city: cadastral.situsCity,
    address_zip: cadastral.situsZip,
    address_county: cadastral.county,
    
    // Legal/Tax fields
    legalDescription: cadastral.legalDescription,
    taxId: cadastral.parcelId,
    
    // Site details
    siteArea: cadastral.acres > 0 ? cadastral.acres.toString() : (cadastral.sqft / 43560).toFixed(2),
    siteAreaUnit: cadastral.acres > 0 ? 'acres' : 'sf',
    
    // Owner info
    ownerName: cadastral.ownerName,
    
    // Tax assessment
    assessedLandValue: cadastral.assessedLandValue,
    assessedImprovementValue: cadastral.assessedImprovementValue,
    totalAssessedValue: cadastral.totalAssessedValue,
    taxYear: cadastral.taxYear,
  };
}


