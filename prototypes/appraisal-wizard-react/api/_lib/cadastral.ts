/**
 * Montana Cadastral API Wrapper
 * 
 * Provides access to Montana's free Cadastral GIS data.
 * For Montana properties only - out-of-state properties use Cotality (future).
 * 
 * API Base: https://gis.msl.mt.gov/arcgis/rest/services/Cadastral/Cadastral/
 * 100% portable - can be copied directly to Harken backend.
 */

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
      throw new Error(`Cadastral API error: ${response.status}`);
    }

    const data = await response.json() as { features?: Array<{ attributes: Record<string, unknown> }> };

    if (!data.features || data.features.length === 0) {
      return {
        success: true,
        parcel: null,
        error: 'No parcel found at this location',
      };
    }

    const feature = data.features[0];
    const attrs = feature.attributes;

    return {
      success: true,
      parcel: mapAttributesToParcel(attrs),
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
    const url = new URL(CADASTRAL_FEATURE_SERVER);
    url.searchParams.set('f', 'json');
    url.searchParams.set('where', `PARCELID = '${parcelId}'`);
    url.searchParams.set('outFields', '*');
    url.searchParams.set('returnGeometry', 'false');

    const response = await fetch(url.toString());
    
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
 */
export async function queryParcelByAddress(
  address: string,
  city: string
): Promise<CadastralQueryResult> {
  try {
    // First, geocode the address
    const geocodeUrl = new URL(MONTANA_GEOCODER);
    geocodeUrl.searchParams.set('f', 'json');
    geocodeUrl.searchParams.set('SingleLine', `${address}, ${city}, MT`);
    geocodeUrl.searchParams.set('outFields', '*');
    geocodeUrl.searchParams.set('maxLocations', '1');

    const geocodeResponse = await fetch(geocodeUrl.toString());
    
    if (!geocodeResponse.ok) {
      throw new Error(`Geocoding error: ${geocodeResponse.status}`);
    }

    const geocodeData = await geocodeResponse.json() as { candidates?: Array<{ location: { x: number; y: number } }> };

    if (!geocodeData.candidates || geocodeData.candidates.length === 0) {
      return {
        success: true,
        parcel: null,
        error: 'Address not found in Montana',
      };
    }

    const location = geocodeData.candidates[0].location;
    
    // Now query by the geocoded location
    return queryParcelByLocation(location.y, location.x);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
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


