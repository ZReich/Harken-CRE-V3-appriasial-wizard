/**
 * FEMA Flood Zone API Proxy
 * 
 * Proxies requests to FEMA's NFHL API to avoid CORS issues.
 * The FEMA API doesn't support browser CORS, so we need server-side requests.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

// FEMA NFHL API base URL
const FEMA_NFHL_BASE_URL = 'https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer';

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

interface FloodZoneResult {
  floodZone: string;
  zoneDescription: string;
  panelNumber: string;
  effectiveDate: string;
  insuranceRequired: boolean;
  baseFloodElevation?: number;
  mapImageUrl?: string;
  details: {
    communityName?: string;
    countyFips?: string;
    stateFips?: string;
    floodwayStatus?: string;
    specialFloodHazardArea: boolean;
    coastalHighHazard: boolean;
  };
}

// FEMA API response types
interface FemaIdentifyResult {
  layerId: number;
  layerName: string;
  displayFieldName: string;
  value: string;
  attributes: {
    FLD_ZONE?: string;
    ZONE_SUBTY?: string;
    DFIRM_ID?: string;
    FLD_AR_ID?: string;
    EFF_DATE?: string | number;
    STATIC_BFE?: string;
    GNIS_NAME?: string;
    CO_FIPS?: string;
    ST_FIPS?: string;
    FLOODWAY?: string;
    [key: string]: unknown;
  };
}

interface FemaIdentifyResponse {
  results?: FemaIdentifyResult[];
}

function formatFemaDate(dateStr: string | number | undefined): string {
  if (!dateStr) return 'Unknown';
  
  if (typeof dateStr === 'number') {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  return dateStr;
}

function generateFloodMapUrl(lat: number, lng: number): string {
  const delta = 0.003; // ~15 zoom
  const extent = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  
  const params = new URLSearchParams({
    bbox: extent,
    bboxSR: '4326',
    imageSR: '4326',
    size: '600,400',
    format: 'png',
    transparent: 'true',
    layers: 'show:28',
    f: 'image'
  });

  return `${FEMA_NFHL_BASE_URL}/export?${params.toString()}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing lat or lng parameter' });
  }

  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lng as string);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Invalid lat or lng parameter' });
  }

  try {
    // Build FEMA API request
    const params = new URLSearchParams({
      geometry: JSON.stringify({
        x: longitude,
        y: latitude,
        spatialReference: { wkid: 4326 }
      }),
      geometryType: 'esriGeometryPoint',
      sr: '4326',
      layers: 'all:28', // Flood Hazard Zones layer
      tolerance: '10',
      mapExtent: `${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}`,
      imageDisplay: '600,400,96',
      returnGeometry: 'false',
      f: 'json'
    });

    const femaUrl = `${FEMA_NFHL_BASE_URL}/identify?${params.toString()}`;
    
    const response = await fetch(femaUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`FEMA API error: ${response.statusText}`);
    }

    const data = await response.json() as FemaIdentifyResponse;

    let result: FloodZoneResult;

    if (data.results && data.results.length > 0) {
      const femaResult = data.results[0];
      const attrs = femaResult.attributes;

      const zoneCode = attrs.FLD_ZONE || attrs.ZONE_SUBTY || 'X';
      const zoneInfo = FLOOD_ZONE_DESCRIPTIONS[zoneCode] || FLOOD_ZONE_DESCRIPTIONS['X'];

      result = {
        floodZone: zoneCode,
        zoneDescription: zoneInfo.description,
        panelNumber: attrs.DFIRM_ID || attrs.FLD_AR_ID || 'Unknown',
        effectiveDate: formatFemaDate(attrs.EFF_DATE),
        insuranceRequired: zoneInfo.insuranceRequired,
        baseFloodElevation: attrs.STATIC_BFE ? parseFloat(attrs.STATIC_BFE) : undefined,
        mapImageUrl: generateFloodMapUrl(latitude, longitude),
        details: {
          communityName: attrs.GNIS_NAME,
          countyFips: attrs.CO_FIPS,
          stateFips: attrs.ST_FIPS,
          floodwayStatus: attrs.FLOODWAY,
          specialFloodHazardArea: ['A', 'AE', 'AH', 'AO', 'AR', 'A99', 'V', 'VE'].includes(zoneCode),
          coastalHighHazard: ['V', 'VE'].includes(zoneCode),
        },
      };
    } else {
      // No flood zone data found - return default X zone
      result = {
        floodZone: 'X',
        zoneDescription: 'Moderate to low risk area (outside mapped flood zones)',
        panelNumber: 'N/A',
        effectiveDate: 'N/A',
        insuranceRequired: false,
        mapImageUrl: generateFloodMapUrl(latitude, longitude),
        details: {
          specialFloodHazardArea: false,
          coastalHighHazard: false,
        },
      };
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('FEMA API proxy error:', error);
    
    // Log detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      latitude,
      longitude,
    };
    
    console.error('Error details:', JSON.stringify(errorDetails, null, 2));
    
    return res.status(500).json({ 
      error: 'Failed to fetch flood zone data',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: errorDetails,
    });
  }
}
