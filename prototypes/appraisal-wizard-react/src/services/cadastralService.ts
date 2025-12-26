/**
 * Cadastral Service
 * 
 * Provides property parcel data lookup functionality.
 * Montana: Uses free state GIS data (direct API calls)
 * Other states: Uses mock data (Cotality integration pending)
 * 
 * Makes DIRECT calls to Montana GIS API from the browser.
 */

import type { CadastralResponse, CadastralData } from '../types/api';

// Montana GIS API endpoints
const CADASTRAL_FEATURE_SERVER = 'https://gis.msl.mt.gov/arcgis/rest/services/Cadastral/Cadastral/FeatureServer/1/query';
const MONTANA_GEOCODER = 'https://gis.msl.mt.gov/arcgis/rest/services/Locators/MontanaAddressLocator/GeocodeServer/findAddressCandidates';

interface MontanaParcelAttributes {
  PARCELID?: string;
  GEOCONTOID?: string;
  CNTYCODE?: string;
  COUNTYNAME?: string;
  LEGALSHORT?: string;
  LEGALDESC?: string;
  TOWNSHIP?: string;
  RANGE?: string;
  SECTION?: string;
  PROPTYPE?: string;
  ACRES?: number;
  SQFT?: number;
  SITUSADDR?: string;
  SITUSCITY?: string;
  SITUSZIP?: string;
  OWNRNAME?: string;
  OWNRNAME2?: string;
  MAILADR?: string;
  LANDVALUE?: number;
  IMPVALUE?: number;
  TOTALVALUE?: number;
  TAXYR?: number;
}

function mapAttributesToCadastralData(
  attrs: MontanaParcelAttributes,
  latitude?: number,
  longitude?: number
): CadastralData {
  return {
    parcelId: attrs.PARCELID || '',
    legalDescription: attrs.LEGALSHORT || attrs.LEGALDESC || '',
    county: attrs.COUNTYNAME || '',
    acres: attrs.ACRES || 0,
    sqft: attrs.SQFT || 0,
    situsAddress: attrs.SITUSADDR || '',
    situsCity: attrs.SITUSCITY || '',
    situsZip: attrs.SITUSZIP || '',
    ownerName: attrs.OWNRNAME || '',
    ownerName2: attrs.OWNRNAME2,
    mailingAddress: attrs.MAILADR || '',
    assessedLandValue: attrs.LANDVALUE || 0,
    assessedImprovementValue: attrs.IMPVALUE || 0,
    totalAssessedValue: attrs.TOTALVALUE || 0,
    taxYear: attrs.TAXYR || new Date().getFullYear(),
    propertyType: attrs.PROPTYPE,
    township: attrs.TOWNSHIP,
    range: attrs.RANGE,
    section: attrs.SECTION,
    latitude,
    longitude,
  };
}

/**
 * Query parcel data by coordinates (direct browser call to Montana GIS)
 */
export async function queryParcelByLocation(
  latitude: number,
  longitude: number,
  _state?: string
): Promise<CadastralResponse> {
  try {
    const url = new URL(CADASTRAL_FEATURE_SERVER);
    url.searchParams.set('f', 'json');
    url.searchParams.set('geometry', JSON.stringify({
      x: longitude,
      y: latitude,
      spatialReference: { wkid: 4326 }
    }));
    url.searchParams.set('geometryType', 'esriGeometryPoint');
    url.searchParams.set('spatialRel', 'esriSpatialRelIntersects');
    url.searchParams.set('outFields', '*');
    url.searchParams.set('returnGeometry', 'false');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Montana GIS API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return {
        success: true,
        data: null,
        source: 'montana_cadastral',
        error: 'No parcel found at this location',
      };
    }

    const parcelData = mapAttributesToCadastralData(data.features[0].attributes, latitude, longitude);

    return {
      success: true,
      data: parcelData,
      source: 'montana_cadastral',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[CadastralService] Location query error:', error);
    return {
      success: false,
      data: null,
      source: 'montana_cadastral',
      error: message,
    };
  }
}

/**
 * Query parcel data by Parcel ID (direct browser call to Montana GIS)
 */
export async function queryParcelByParcelId(
  parcelId: string,
  _state?: string
): Promise<CadastralResponse> {
  try {
    const url = new URL(CADASTRAL_FEATURE_SERVER);
    url.searchParams.set('f', 'json');
    url.searchParams.set('where', `PARCELID = '${parcelId}'`);
    url.searchParams.set('outFields', '*');
    url.searchParams.set('returnGeometry', 'false');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Montana GIS API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return {
        success: true,
        data: null,
        source: 'montana_cadastral',
        error: `No parcel found with ID: ${parcelId}`,
      };
    }

    const parcelData = mapAttributesToCadastralData(data.features[0].attributes);

    return {
      success: true,
      data: parcelData,
      source: 'montana_cadastral',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[CadastralService] ParcelId query error:', error);
    return {
      success: false,
      data: null,
      source: 'montana_cadastral',
      error: message,
    };
  }
}

/**
 * Query parcel data by address (geocode first, then spatial query)
 * Direct browser call to Montana GIS
 */
export async function queryParcelByAddress(
  address: string,
  city: string,
  _state: string
): Promise<CadastralResponse> {
  try {
    // First, geocode the address
    const geocodeUrl = new URL(MONTANA_GEOCODER);
    geocodeUrl.searchParams.set('f', 'json');
    geocodeUrl.searchParams.set('SingleLine', `${address}, ${city}, MT`);
    geocodeUrl.searchParams.set('outFields', '*');
    geocodeUrl.searchParams.set('maxLocations', '1');

    console.log('[CadastralService] Geocoding address:', `${address}, ${city}, MT`);
    
    const geocodeResponse = await fetch(geocodeUrl.toString());
    
    if (!geocodeResponse.ok) {
      throw new Error(`Montana geocoding error: ${geocodeResponse.status}`);
    }

    const geocodeData = await geocodeResponse.json();

    if (!geocodeData.candidates || geocodeData.candidates.length === 0) {
      return {
        success: true,
        data: null,
        source: 'montana_cadastral',
        error: 'Address not found in Montana',
      };
    }

    const location = geocodeData.candidates[0].location;
    console.log('[CadastralService] Geocoded location:', location);
    
    // Now query by the geocoded location
    return queryParcelByLocation(location.y, location.x, 'MT');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[CadastralService] Address query error:', error);
    return {
      success: false,
      data: null,
      source: 'montana_cadastral',
      error: message,
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


