/**
 * FEMA Flood Zone Service
 * 
 * Integrates with FEMA's National Flood Hazard Layer (NFHL) API
 * to retrieve flood zone information for a given location.
 * 
 * API Documentation: https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer
 */

// =================================================================
// TYPES
// =================================================================

export interface FloodZoneResult {
  /** FEMA flood zone designation (e.g., "AE", "X", "VE") */
  floodZone: string;
  /** Human-readable zone description */
  zoneDescription: string;
  /** FEMA map panel number */
  panelNumber: string;
  /** Panel effective date */
  effectiveDate: string;
  /** Whether flood insurance is required */
  insuranceRequired: boolean;
  /** Base flood elevation if available */
  baseFloodElevation?: number;
  /** Static flood map image URL */
  mapImageUrl?: string;
  /** Full zone details */
  details: FloodZoneDetails;
}

export interface FloodZoneDetails {
  communityName?: string;
  countyFips?: string;
  stateFips?: string;
  floodwayStatus?: string;
  specialFloodHazardArea: boolean;
  coastalHighHazard: boolean;
}

// Flood zone descriptions
const FLOOD_ZONE_DESCRIPTIONS: Record<string, { description: string; insuranceRequired: boolean }> = {
  'A': { description: 'High-risk area with 1% annual chance of flooding', insuranceRequired: true },
  'AE': { description: 'High-risk area with base flood elevations determined', insuranceRequired: true },
  'AH': { description: 'High-risk area with 1-3 foot flood depths', insuranceRequired: true },
  'AO': { description: 'High-risk area with sheet flow flooding', insuranceRequired: true },
  'AR': { description: 'High-risk area due to levee restoration', insuranceRequired: true },
  'A99': { description: 'High-risk area to be protected by levee', insuranceRequired: true },
  'V': { description: 'Coastal high-risk area with wave action', insuranceRequired: true },
  'VE': { description: 'Coastal high-risk area with base flood elevations', insuranceRequired: true },
  'X': { description: 'Moderate to low risk area', insuranceRequired: false },
  'B': { description: 'Moderate risk area (0.2% annual chance)', insuranceRequired: false },
  'C': { description: 'Minimal risk area', insuranceRequired: false },
  'D': { description: 'Undetermined risk area', insuranceRequired: false },
};

// =================================================================
// FEMA API INTEGRATION
// =================================================================

const FEMA_NFHL_BASE_URL = 'https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer';

/**
 * Query FEMA NFHL for flood zone at a specific point.
 * Uses the identify operation on the Flood Hazard Zones layer.
 * 
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Flood zone information or null if not found
 */
export async function getFloodZone(
  lat: number,
  lng: number
): Promise<FloodZoneResult | null> {
  try {
    // FEMA NFHL uses Web Mercator projection
    // We need to query the Flood Hazard Zones layer (layer 28)
    const params = new URLSearchParams({
      geometry: JSON.stringify({
        x: lng,
        y: lat,
        spatialReference: { wkid: 4326 }
      }),
      geometryType: 'esriGeometryPoint',
      sr: '4326',
      layers: 'all:28', // Flood Hazard Zones layer
      tolerance: '10',
      mapExtent: `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`,
      imageDisplay: '600,400,96',
      returnGeometry: 'false',
      f: 'json'
    });

    const response = await fetch(
      `${FEMA_NFHL_BASE_URL}/identify?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`FEMA API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const attrs = result.attributes;

      const zoneCode = attrs.FLD_ZONE || attrs.ZONE_SUBTY || 'X';
      const zoneInfo = FLOOD_ZONE_DESCRIPTIONS[zoneCode] || FLOOD_ZONE_DESCRIPTIONS['X'];

      return {
        floodZone: zoneCode,
        zoneDescription: zoneInfo.description,
        panelNumber: attrs.DFIRM_ID || attrs.FLD_AR_ID || 'Unknown',
        effectiveDate: formatFemaDate(attrs.EFF_DATE),
        insuranceRequired: zoneInfo.insuranceRequired,
        baseFloodElevation: attrs.STATIC_BFE ? parseFloat(attrs.STATIC_BFE) : undefined,
        mapImageUrl: generateFloodMapUrl(lat, lng),
        details: {
          communityName: attrs.GNIS_NAME,
          countyFips: attrs.CO_FIPS,
          stateFips: attrs.ST_FIPS,
          floodwayStatus: attrs.FLOODWAY,
          specialFloodHazardArea: ['A', 'AE', 'AH', 'AO', 'AR', 'A99', 'V', 'VE'].includes(zoneCode),
          coastalHighHazard: ['V', 'VE'].includes(zoneCode),
        },
      };
    }

    // No flood zone data found - return default X zone
    return {
      floodZone: 'X',
      zoneDescription: 'Moderate to low risk area (outside mapped flood zones)',
      panelNumber: 'N/A',
      effectiveDate: 'N/A',
      insuranceRequired: false,
      mapImageUrl: generateFloodMapUrl(lat, lng),
      details: {
        specialFloodHazardArea: false,
        coastalHighHazard: false,
      },
    };
  } catch (error) {
    console.error('FEMA flood zone lookup error:', error);
    return null;
  }
}

/**
 * Format FEMA date string to readable format.
 */
function formatFemaDate(dateStr: string | number | undefined): string {
  if (!dateStr) return 'Unknown';
  
  // FEMA dates can be milliseconds since epoch or string
  if (typeof dateStr === 'number') {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  return dateStr;
}

/**
 * Generate a static flood map image URL using FEMA's map export service.
 */
export function generateFloodMapUrl(
  lat: number,
  lng: number,
  options?: {
    width?: number;
    height?: number;
    zoom?: number;
  }
): string {
  const { width = 600, height = 400, zoom = 15 } = options || {};
  
  // Calculate extent based on zoom level
  const delta = 0.005 * (18 - zoom);
  const extent = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  
  const params = new URLSearchParams({
    bbox: extent,
    bboxSR: '4326',
    imageSR: '4326',
    size: `${width},${height}`,
    format: 'png',
    transparent: 'true',
    layers: 'show:28', // Flood Hazard Zones
    f: 'image'
  });

  return `${FEMA_NFHL_BASE_URL}/export?${params.toString()}`;
}

/**
 * Generate a composite flood map with Google Maps base layer and FEMA overlay.
 * This creates a URL that can be used to display the flood zones on a map.
 */
export function generateCompositeFloodMapUrl(
  lat: number,
  lng: number,
  apiKey: string,
  options?: {
    width?: number;
    height?: number;
    zoom?: number;
  }
): { baseMapUrl: string; overlayUrl: string } {
  const { width = 600, height = 400, zoom = 15 } = options || {};
  
  // Google Maps static base layer
  const baseMapUrl = `https://maps.googleapis.com/maps/api/staticmap?` +
    `center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}` +
    `&maptype=roadmap&key=${apiKey}` +
    `&markers=color:red|${lat},${lng}`;
  
  // FEMA overlay
  const overlayUrl = generateFloodMapUrl(lat, lng, { width, height, zoom });
  
  return { baseMapUrl, overlayUrl };
}

/**
 * Get flood zone color for display.
 */
export function getFloodZoneColor(zone: string): string {
  if (zone.startsWith('V')) return '#0000FF'; // Coastal high hazard - Blue
  if (zone.startsWith('A')) return '#FF6B6B'; // High risk - Red/Pink
  if (zone === 'X' || zone === 'B' || zone === 'C') return '#90EE90'; // Low risk - Light green
  if (zone === 'D') return '#FFFF00'; // Undetermined - Yellow
  return '#808080'; // Unknown - Gray
}

/**
 * Get flood zone risk level for display.
 */
export function getFloodZoneRiskLevel(zone: string): 'high' | 'moderate' | 'low' | 'undetermined' {
  if (zone.startsWith('V') || zone.startsWith('A')) return 'high';
  if (zone === 'B' || zone === 'X500') return 'moderate';
  if (zone === 'D') return 'undetermined';
  return 'low';
}

// =================================================================
// EXPORTS
// =================================================================

export default {
  getFloodZone,
  generateFloodMapUrl,
  generateCompositeFloodMapUrl,
  getFloodZoneColor,
  getFloodZoneRiskLevel,
  FLOOD_ZONE_DESCRIPTIONS,
};
