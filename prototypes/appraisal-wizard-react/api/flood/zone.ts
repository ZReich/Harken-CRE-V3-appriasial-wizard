/**
 * FEMA Flood Zone API Proxy
 * 
 * Proxies requests to FEMA's NFHL API to avoid CORS issues.
 * Uses the S_FLD_HAZ_AR layer (Flood Hazard Areas) for point queries.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

// =================================================================
// FEMA NFHL API Configuration
// =================================================================

// FEMA NFHL uses multiple endpoints - we'll try the main one first
const FEMA_ENDPOINTS = [
  // Primary: NFHL MapServer with query on layer 28 (S_Fld_Haz_Ar - Flood Hazard Zones)
  'https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query',
  // Fallback: Try FIRMette service
  'https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHLWMS/MapServer/0/query',
];

// For generating static map images
const FEMA_EXPORT_URL = 'https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/export';

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
// Types
// =================================================================

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

interface FemaFeature {
  attributes: {
    FLD_ZONE?: string;
    ZONE_SUBTY?: string;
    DFIRM_ID?: string;
    FLD_AR_ID?: string;
    SFHA_TF?: string;
    STATIC_BFE?: number;
    V_DATUM?: string;
    DEPTH?: number;
    LEN_UNIT?: string;
    VELOCITY?: number;
    VEL_UNIT?: string;
    AR_REVERT?: string;
    AR_SUBTRV?: string;
    BFE_REVERT?: number;
    DEP_REVERT?: number;
    DUAL_ZONE?: string;
    SOURCE_CIT?: string;
    [key: string]: unknown;
  };
}

interface FemaQueryResponse {
  features?: FemaFeature[];
  error?: {
    code: number;
    message: string;
  };
}

// =================================================================
// Helpers
// =================================================================

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
  const delta = 0.005; // Wider view for context
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  
  const params = new URLSearchParams({
    bbox: bbox,
    bboxSR: '4326',
    imageSR: '4326',
    size: '600,400',
    format: 'png',
    transparent: 'true',
    layers: 'show:28', // S_Fld_Haz_Ar layer
    f: 'image'
  });

  return `${FEMA_EXPORT_URL}?${params.toString()}`;
}

async function queryFemaLayer(lat: number, lng: number, endpointUrl: string): Promise<FemaQueryResponse> {
  // Build query parameters for a point geometry query
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'FLD_ZONE,ZONE_SUBTY,DFIRM_ID,FLD_AR_ID,SFHA_TF,STATIC_BFE',
    returnGeometry: 'false',
    f: 'json'
  });

  const url = `${endpointUrl}?${params.toString()}`;
  console.log('[FEMA] Querying:', url);

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Harken-Appraisal-Wizard/1.0',
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json() as FemaQueryResponse;
  
  // Check for ESRI error response
  if (data.error) {
    throw new Error(`ESRI Error ${data.error.code}: ${data.error.message}`);
  }

  return data;
}

// =================================================================
// Handler
// =================================================================

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

  let lastError: Error | null = null;

  // Try each endpoint until one works
  for (const endpoint of FEMA_ENDPOINTS) {
    try {
      console.log(`[FEMA] Trying endpoint: ${endpoint}`);
      const data = await queryFemaLayer(latitude, longitude, endpoint);

      let result: FloodZoneResult;

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const attrs = feature.attributes;

        const zoneCode = attrs.FLD_ZONE || attrs.ZONE_SUBTY || 'X';
        const zoneInfo = FLOOD_ZONE_DESCRIPTIONS[zoneCode] || FLOOD_ZONE_DESCRIPTIONS['X'];

        result = {
          floodZone: zoneCode,
          zoneDescription: zoneInfo.description,
          panelNumber: attrs.DFIRM_ID || attrs.FLD_AR_ID || 'Unknown',
          effectiveDate: 'Current',
          insuranceRequired: zoneInfo.insuranceRequired,
          baseFloodElevation: attrs.STATIC_BFE ? Number(attrs.STATIC_BFE) : undefined,
          mapImageUrl: generateFloodMapUrl(latitude, longitude),
          details: {
            specialFloodHazardArea: attrs.SFHA_TF === 'T' || ['A', 'AE', 'AH', 'AO', 'AR', 'A99', 'V', 'VE'].includes(zoneCode),
            coastalHighHazard: ['V', 'VE'].includes(zoneCode),
          },
        };

        console.log(`[FEMA] Success! Zone: ${zoneCode}`);
      } else {
        // No flood zone data found - likely outside mapped areas
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

        console.log('[FEMA] No features found, defaulting to Zone X');
      }

      return res.status(200).json(result);

    } catch (error) {
      console.error(`[FEMA] Endpoint ${endpoint} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      // Continue to next endpoint
    }
  }

  // All endpoints failed
  console.error('[FEMA] All endpoints failed. Last error:', lastError);
  
  return res.status(500).json({ 
    error: 'Failed to fetch flood zone data',
    message: lastError?.message || 'All FEMA endpoints unavailable',
    details: {
      latitude,
      longitude,
      triedEndpoints: FEMA_ENDPOINTS,
    },
  });
}
