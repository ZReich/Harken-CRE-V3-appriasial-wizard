/**
 * Cadastral Service
 * 
 * Provides property parcel data lookup functionality.
 * Montana: Uses free state GIS data via serverless function proxy
 * Other states: Uses mock data (Cotality integration pending)
 */

import { apiPost } from './api';
import type { CadastralResponse, CadastralData } from '../types/api';

/**
 * Query parcel data by coordinates
 */
export async function queryParcelByLocation(
  latitude: number,
  longitude: number,
  state?: string
): Promise<CadastralResponse> {
  try {
    const response = await apiPost<CadastralData>('/cadastral/query', {
      latitude,
      longitude,
      state: state || 'MT',
    });

    return {
      success: true,
      data: response,
      source: 'montana_cadastral',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[CadastralService] Location query error:', error);
    return {
      success: false,
      data: null,
      source: 'montana_cadastral',
      error: `Failed to query parcel by location: ${message}`,
    };
  }
}

/**
 * Query parcel data by Parcel ID
 */
export async function queryParcelByParcelId(
  parcelId: string,
  state?: string
): Promise<CadastralResponse> {
  try {
    const response = await apiPost<CadastralData>('/cadastral/query', {
      parcelId,
      state: state || 'MT',
    });

    return {
      success: true,
      data: response,
      source: 'montana_cadastral',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[CadastralService] ParcelId query error:', error);
    return {
      success: false,
      data: null,
      source: 'montana_cadastral',
      error: `Failed to query parcel by ID: ${message}`,
    };
  }
}

/**
 * Query parcel data by address
 */
export async function queryParcelByAddress(
  address: string,
  city: string,
  state: string
): Promise<CadastralResponse> {
  try {
    const response = await apiPost<CadastralData>('/cadastral/query', {
      address,
      city,
      state: state || 'MT',
    });

    return {
      success: true,
      data: response,
      source: 'montana_cadastral',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[CadastralService] Address query error:', error);
    
    // Log the full ApiError response if available
    if (error && typeof error === 'object' && 'response' in error) {
      console.error('[CadastralService] Full error response:', JSON.stringify((error as any).response, null, 2));
    }
    
    return {
      success: false,
      data: null,
      source: 'montana_cadastral',
      error: `Failed to query parcel by address: ${message}`,
    };
  }
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


