/**
 * Montana Cadastral API Wrapper
 * 
 * Provides access to Montana's free Cadastral GIS data.
 * For Montana properties only - out-of-state properties use Cotality (future).
 * 
 * API Base: https://gis.msl.mt.gov/arcgis/rest/services/Cadastral/Cadastral/
 * 100% portable - can be copied directly to Harken backend.
 */

import fetch from 'node-fetch';
import * as https from 'https';
import * as http from 'http';

// SSL agent to bypass certificate validation for Montana's misconfigured SSL certificate
// Their cert only includes *.mt.gov but NOT *.msl.mt.gov (where gis.msl.mt.gov is hosted)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const httpAgent = new http.Agent();


// Primary endpoint: DNRC (Department of Natural Resources and Conservation)
// More reliable, updated monthly
const DNRC_CADASTRAL_MAPSERVER = 'https://gis.dnrc.mt.gov/arcgis/rest/services/DNRALL/Cadastral/MapServer/0/query';
const DNRC_GEOCODER = 'https://gis.dnrc.mt.gov/arcgis/rest/services/Locators/MT_Locator/GeocodeServer/findAddressCandidates';

// Fallback endpoint: Montana State Library
const CADASTRAL_FEATURE_SERVER = 'https://gis.msl.mt.gov/arcgis/rest/services/Cadastral/Cadastral/FeatureServer/1/query';
const MONTANA_GEOCODER = 'https://gis.msl.mt.gov/arcgis/rest/services/Locators/MontanaAddressLocator/GeocodeServer/findAddressCandidates';

// =================================================================
// TYPES
// =================================================================

export interface MontanaCadastralParcel {
  parcelId: string;
  geoContoId: string;
  countyCode: string;
  countyName: string;
  legalDescription: string;
  township: string;
  range: string;
  section: string;
  propertyType: string;
  acres: number;
  sqft: number;
  situsAddress: string;
  situsCity: string;
  situsZip: string;
  ownerName: string;
  ownerName2: string;
  mailingAddress: string;
  assessedLandValue: number;
  assessedImprovementValue: number;
  totalAssessedValue: number;
  taxYear: number;
  // Centroid coordinates (for demographics lookup, etc.)
  latitude?: number;
  longitude?: number;
}

export interface CadastralQueryResult {
  success: boolean;
  parcel: MontanaCadastralParcel | null;
  error?: string;
}

// =================================================================
// QUERY FUNCTIONS
// =================================================================

/**
 * Query parcel by latitude/longitude
 * Uses ArcGIS spatial query to find parcels containing the point
 */
export async function queryParcelByLocation(
  latitude: number,
  longitude: number
): Promise<CadastralQueryResult> {
  try {
    // Try DNRC endpoint first (more reliable)
    console.log('[Cadastral] Attempting DNRC endpoint...');
    const url = new URL(DNRC_CADASTRAL_MAPSERVER);
    url.searchParams.set('f', 'json');
    url.searchParams.set('geometry', JSON.stringify({
      x: longitude,
      y: latitude,
      spatialReference: { wkid: 4326 }
    }));
    url.searchParams.set('geometryType', 'esriGeometryPoint');
    url.searchParams.set('spatialRel', 'esriSpatialRelIntersects');
    url.searchParams.set('outFields', '*');
    url.searchParams.set('returnGeometry', 'true'); // Return geometry for centroid

    console.log('[Cadastral] DNRC Query URL:', url.toString());

    const response = await fetch(url.toString(), { 
      agent: (_parsedURL) => _parsedURL.protocol == 'http:' ? httpAgent : httpsAgent,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Harken/1.0)',
      }
    });
    
    console.log('[Cadastral] DNRC Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Cadastral API error: ${response.status}`);
    }

    const data = await response.json() as { 
      features?: Array<{ 
        attributes: Record<string, unknown>;
        geometry?: { rings?: number[][][]; x?: number; y?: number };
      }> 
    };

    if (!data.features || data.features.length === 0) {
      return {
        success: true,
        parcel: null,
        error: 'No parcel found at this location',
      };
    }

    const feature = data.features[0];
    const attrs = feature.attributes;
    const parcel = mapAttributesToParcel(attrs);
    
    // Include coordinates (use query point since we know it's in the parcel)
    parcel.latitude = latitude;
    parcel.longitude = longitude;

    return {
      success: true,
      parcel,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      parcel: null,
      error: message,
    };
  }
}

/**
 * Query parcel by Parcel ID
 */
export async function queryParcelByParcelId(
  parcelId: string
): Promise<CadastralQueryResult> {
  try {
    console.log('[Cadastral] Attempting DNRC endpoint for parcel ID...');
    const url = new URL(DNRC_CADASTRAL_MAPSERVER);
    url.searchParams.set('f', 'json');
    url.searchParams.set('where', `PARCELID = '${parcelId}'`);
    url.searchParams.set('outFields', '*');
    url.searchParams.set('returnGeometry', 'false');

    console.log('[Cadastral] DNRC Query URL (by ID):', url.toString());

    const response = await fetch(url.toString(), { 
      agent: (_parsedURL) => _parsedURL.protocol == 'http:' ? httpAgent : httpsAgent,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Harken/1.0)',
      }
    });
    
    console.log('[Cadastral] DNRC Response status (by ID):', response.status);
    
    if (!response.ok) {
      throw new Error(`Cadastral API error: ${response.status}`);
    }

    const data = await response.json() as { features?: Array<{ attributes: Record<string, unknown> }> };

    if (!data.features || data.features.length === 0) {
      return {
        success: true,
        parcel: null,
        error: `No parcel found with ID: ${parcelId}`,
      };
    }

    const feature = data.features[0];
    return {
      success: true,
      parcel: mapAttributesToParcel(feature.attributes),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      parcel: null,
      error: message,
    };
  }
}

/**
 * Query parcel by address (geocode first, then spatial query)
 * Tries DNRC first, falls back to MSL if needed
 */
export async function queryParcelByAddress(
  address: string,
  city: string,
  state?: string
): Promise<CadastralQueryResult> {
  try {
    console.log('[Cadastral] queryParcelByAddress called:', { address, city, state });
    
    // Try DNRC first (more reliable infrastructure)
    console.log('[Cadastral] Attempting DNRC geocoder...');
    const dnrcResult = await tryGeocodeAndQuery(address, city, state, 'DNRC');
    
    if (dnrcResult.success && dnrcResult.parcel) {
      console.log('[Cadastral] DNRC lookup successful');
      return dnrcResult;
    }
    
    console.log('[Cadastral] DNRC lookup failed, trying MSL fallback...');
    // Fallback to MSL if DNRC doesn't find anything
    const mslResult = await tryGeocodeAndQuery(address, city, state, 'MSL');
    
    if (mslResult.success && mslResult.parcel) {
      console.log('[Cadastral] MSL lookup successful');
      return mslResult;
    }
    
    // Neither found anything
    return {
      success: true,
      parcel: null,
      error: 'Address not found in Montana cadastral databases',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Cadastral] queryParcelByAddress error:', error);
    return {
      success: false,
      parcel: null,
      error: message,
    };
  }
}

/**
 * Helper function to try geocoding and querying with a specific endpoint
 */
async function tryGeocodeAndQuery(
  address: string,
  city: string,
  state: string | undefined,
  source: 'DNRC' | 'MSL'
): Promise<CadastralQueryResult> {
  try {
    const geocoder = source === 'DNRC' ? DNRC_GEOCODER : MONTANA_GEOCODER;
    const geocodeUrl = new URL(geocoder);
    geocodeUrl.searchParams.set('f', 'json');
    geocodeUrl.searchParams.set('SingleLine', `${address}, ${city}, ${state || 'MT'}`);
    geocodeUrl.searchParams.set('outFields', '*');
    geocodeUrl.searchParams.set('maxLocations', '1');

    console.log(`[Cadastral] ${source} Geocoder URL:`, geocodeUrl.toString());

    const geocodeResponse = await fetch(geocodeUrl.toString(), { 
      agent: (_parsedURL) => _parsedURL.protocol == 'http:' ? httpAgent : httpsAgent,
      redirect: 'manual', // Don't follow redirects, we want to see what's happening
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Harken/1.0)',
      }
    });
    
    console.log('[Cadastral] Geocode response status:', geocodeResponse.status);
    console.log('[Cadastral] Geocode response URL:', geocodeResponse.url);
    console.log('[Cadastral] Geocode response headers:', JSON.stringify([...geocodeResponse.headers]));
    
    if (!geocodeResponse.ok) {
      // Log the error response body
      const errorText = await geocodeResponse.text();
      console.error('[Cadastral] Error response body:', errorText.substring(0, 500));
      throw new Error(`Geocoding error: ${geocodeResponse.status}`);
    }

    const geocodeData = await geocodeResponse.json() as { candidates?: Array<{ location: { x: number; y: number }; score?: number } > };

    console.log('[Cadastral] Geocode data:', JSON.stringify(geocodeData));

    if (!geocodeData.candidates || geocodeData.candidates.length === 0) {
      return {
        success: true,
        parcel: null,
        error: 'Address not found in Montana',
      };
    }

    const location = geocodeData.candidates[0].location;
    const geocodedLat = location.y;
    const geocodedLng = location.x;
    
    console.log(`[Cadastral] ${source} geocoded coordinates:`, { lat: geocodedLat, lng: geocodedLng });
    
    // Now query by the geocoded location (coordinates will be included)
    const result = await queryParcelByLocation(geocodedLat, geocodedLng);
    
    console.log(`[Cadastral] ${source} parcel query result:`, result.success);
    
    // The coordinates are already set in queryParcelByLocation
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Cadastral] ${source} tryGeocodeAndQuery error:`, message);
    return {
      success: false,
      parcel: null,
      error: message,
    };
  }
}

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Map raw ArcGIS attributes to our parcel interface
 */
function mapAttributesToParcel(attrs: Record<string, unknown>): MontanaCadastralParcel {
  return {
    parcelId: String(attrs.PARCELID || ''),
    geoContoId: String(attrs.GEOCONTOID || ''),
    countyCode: String(attrs.COUNTYCD || ''),
    countyName: String(attrs.COUNTYNAME || ''),
    legalDescription: String(attrs.LEGALDESC || ''),
    township: String(attrs.TOWNSHIP || ''),
    range: String(attrs.RANGE || ''),
    section: String(attrs.SECTION || ''),
    propertyType: String(attrs.PROPTYPE || ''),
    acres: Number(attrs.ACRES) || 0,
    sqft: Number(attrs.SQFT) || 0,
    situsAddress: String(attrs.SITUS_ADDR || ''),
    situsCity: String(attrs.SITUS_CITY || ''),
    situsZip: String(attrs.SITUS_ZIP || ''),
    ownerName: String(attrs.OWNERNME1 || ''),
    ownerName2: String(attrs.OWNERNME2 || ''),
    mailingAddress: String(attrs.MAILADDR || ''),
    assessedLandValue: Number(attrs.LANDVAL) || 0,
    assessedImprovementValue: Number(attrs.IMPVAL) || 0,
    totalAssessedValue: Number(attrs.TOTALVAL) || 0,
    taxYear: Number(attrs.TAXYR) || new Date().getFullYear(),
  };
}

/**
 * Check if a state code is Montana
 */
export function isMontana(state: string): boolean {
  const normalized = state.toUpperCase().trim();
  return normalized === 'MT' || normalized === 'MONTANA';
}


