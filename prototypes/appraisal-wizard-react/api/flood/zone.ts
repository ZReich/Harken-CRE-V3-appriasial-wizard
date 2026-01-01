/**
 * FEMA Flood Zone API Proxy
 * 
 * Provides flood zone information for a given location.
 * Due to FEMA API reliability issues, we provide:
 * 1. A static map image centered on the property
 * 2. A direct link to FEMA's official flood map lookup
 * 3. Placeholder zone data that should be verified
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// =================================================================
// Configuration
// =================================================================

const GOOGLE_MAPS_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

// Flood zone descriptions for reference
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
  mapImageUrl: string;
  femaLookupUrl: string;
  isVerified: boolean;
  details: {
    communityName?: string;
    countyFips?: string;
    stateFips?: string;
    floodwayStatus?: string;
    specialFloodHazardArea: boolean;
    coastalHighHazard: boolean;
  };
}

// =================================================================
// Helpers
// =================================================================

/**
 * Generate a static Google Maps image URL showing the property location
 */
function generateMapImageUrl(lat: number, lng: number): string {
  if (!GOOGLE_MAPS_API_KEY) {
    // Return a placeholder image URL if no API key
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x400&maptype=roadmap&markers=color:red%7C${lat},${lng}`;
  }

  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: '15',
    size: '600x400',
    maptype: 'hybrid',
    markers: `color:red|label:S|${lat},${lng}`,
    key: GOOGLE_MAPS_API_KEY,
  });

  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

/**
 * Generate FEMA's official flood map lookup URL for the coordinates
 */
function generateFemaLookupUrl(lat: number, lng: number): string {
  // FEMA's Map Service Center with coordinates
  return `https://msc.fema.gov/portal/search?AddressQuery=${lat}%2C${lng}#searchresultsanchor`;
}

/**
 * Generate FEMA NFHL map export image URL (may or may not work depending on FEMA availability)
 */
function generateFemaMapUrl(lat: number, lng: number): string {
  const delta = 0.005;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  
  const params = new URLSearchParams({
    bbox: bbox,
    bboxSR: '4326',
    imageSR: '4326',
    size: '600,400',
    format: 'png',
    transparent: 'false',
    layers: 'show:0,28',
    f: 'image'
  });

  return `https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/export?${params.toString()}`;
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

  // For now, return a placeholder response with useful links
  // The user should verify the actual zone using FEMA's official tool
  const zoneInfo = FLOOD_ZONE_DESCRIPTIONS['X'];
  
  const result: FloodZoneResult = {
    floodZone: 'Pending Verification',
    zoneDescription: 'Flood zone should be verified using FEMA lookup link below',
    panelNumber: 'See FEMA Map',
    effectiveDate: 'Current',
    insuranceRequired: false,
    mapImageUrl: generateMapImageUrl(latitude, longitude),
    femaLookupUrl: generateFemaLookupUrl(latitude, longitude),
    isVerified: false,
    details: {
      specialFloodHazardArea: false,
      coastalHighHazard: false,
    },
  };

  console.log(`[Flood Zone] Returning placeholder for coordinates: ${latitude}, ${longitude}`);
  console.log(`[Flood Zone] FEMA lookup URL: ${result.femaLookupUrl}`);

  return res.status(200).json(result);
}
