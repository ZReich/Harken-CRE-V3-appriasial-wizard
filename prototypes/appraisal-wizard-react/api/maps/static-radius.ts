/**
 * Static Radius Map API Route
 * GET /api/maps/static-radius
 * 
 * Generates a static Google Maps image URL with radius rings for PDF reports.
 * Uses Google Maps Static API to create embeddable map images.
 * 
 * Query Parameters:
 * - lat: Latitude
 * - lng: Longitude
 * - radii: Comma-separated radii in miles (default: 1,3,5)
 * - size: Image size WxH (default: 600x400)
 * - maptype: satellite or roadmap (default: satellite)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// =================================================================
// CONSTANTS
// =================================================================

const STATIC_MAPS_URL = 'https://maps.googleapis.com/maps/api/staticmap';
const MILES_TO_METERS = 1609.344;

// Ring colors (cyan theme) - using hex without # for URL encoding
const RING_COLOR = '0da1c7';
const MARKER_COLOR = 'red';

// =================================================================
// HELPERS
// =================================================================

/**
 * Generate points for a circle path
 * Google Maps Static API requires circle to be drawn as a polygon path
 * 
 * @param lat - Center latitude
 * @param lng - Center longitude
 * @param radiusMiles - Radius in miles
 * @param numPoints - Number of points to generate (default: 36 for smooth circle)
 * @returns Array of lat,lng strings
 */
function generateCirclePoints(
  lat: number,
  lng: number,
  radiusMiles: number,
  numPoints: number = 36
): string[] {
  const points: string[] = [];
  const radiusKm = radiusMiles * 1.60934; // Convert miles to km
  const earthRadiusKm = 6371;

  for (let i = 0; i <= numPoints; i++) {
    const angle = (i * 360) / numPoints;
    const radians = (angle * Math.PI) / 180;

    // Calculate point on circle
    const dLat = (radiusKm / earthRadiusKm) * (180 / Math.PI);
    const dLng = dLat / Math.cos((lat * Math.PI) / 180);

    const pointLat = lat + dLat * Math.cos(radians);
    const pointLng = lng + dLng * Math.sin(radians);

    points.push(`${pointLat.toFixed(6)},${pointLng.toFixed(6)}`);
  }

  return points;
}

/**
 * Create a path parameter for a circle
 * 
 * @param lat - Center latitude
 * @param lng - Center longitude
 * @param radiusMiles - Radius in miles
 * @param fillOpacity - Fill opacity (0-255 as hex)
 * @returns Path parameter string for Google Static Maps API
 */
function createCirclePath(
  lat: number,
  lng: number,
  radiusMiles: number,
  fillOpacity: string
): string {
  const points = generateCirclePoints(lat, lng, radiusMiles, 48);
  
  // Format: path=fillcolor:0x{color}{opacity}|color:0x{color}|weight:2|{points}
  const pathParts = [
    `fillcolor:0x${RING_COLOR}${fillOpacity}`,
    `color:0x${RING_COLOR}`,
    'weight:2',
    ...points,
  ];

  return `path=${pathParts.join('|')}`;
}

/**
 * Calculate appropriate zoom level based on largest radius
 */
function calculateZoom(maxRadius: number, width: number): number {
  // Approximate zoom levels for different radii
  // These values work well for most map sizes
  if (maxRadius <= 1) return 13;
  if (maxRadius <= 3) return 11;
  if (maxRadius <= 5) return 10;
  if (maxRadius <= 10) return 9;
  return 8;
}

// =================================================================
// API HANDLER
// =================================================================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Allow GET for easy embedding
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET.',
    });
  }

  try {
    // Parse query parameters
    const {
      lat,
      lng,
      radii: radiiStr = '1,3,5',
      size = '600x400',
      maptype = 'satellite',
    } = req.query;

    // Validate required parameters
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'lat and lng query parameters are required',
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lat or lng values',
      });
    }

    // Parse radii
    const radii = (radiiStr as string)
      .split(',')
      .map(r => parseFloat(r.trim()))
      .filter(r => !isNaN(r) && r > 0)
      .sort((a, b) => b - a); // Sort descending (draw largest first)

    if (radii.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid radii values',
      });
    }

    // Parse size
    const [width, height] = (size as string).split('x').map(Number);
    if (isNaN(width) || isNaN(height)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid size format. Use WxH (e.g., 600x400)',
      });
    }

    // Get API key
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'Google Maps API key not configured',
      });
    }

    // Calculate zoom
    const zoom = calculateZoom(Math.max(...radii), width);

    // Build circle paths (opacity values in hex: 59=35%, 40=25%, 26=15%)
    const opacities = ['26', '40', '59']; // Reversed because we draw largest first
    const circlePaths = radii.map((radius, index) => {
      const opacity = opacities[Math.min(index, opacities.length - 1)];
      return createCirclePath(latitude, longitude, radius, opacity);
    });

    // Build static map URL
    const params = new URLSearchParams();
    params.append('center', `${latitude},${longitude}`);
    params.append('zoom', zoom.toString());
    params.append('size', `${width}x${height}`);
    params.append('maptype', maptype as string);
    params.append('key', apiKey);

    // Add marker for subject property
    params.append('markers', `color:${MARKER_COLOR}|${latitude},${longitude}`);

    // Construct full URL with paths
    // Note: Paths need to be added separately since they contain | characters
    let staticMapUrl = `${STATIC_MAPS_URL}?${params.toString()}`;
    
    // Add circle paths
    circlePaths.forEach(path => {
      staticMapUrl += `&${path}`;
    });

    return res.status(200).json({
      success: true,
      data: {
        url: staticMapUrl,
        width,
        height,
        center: { lat: latitude, lng: longitude },
        radii,
        maptype,
      },
    });
  } catch (error) {
    console.error('Static map error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({
      success: false,
      error: `Failed to generate static map: ${errorMessage}`,
    });
  }
}

// =================================================================
// UTILITY EXPORT
// =================================================================

/**
 * Generate a static map URL directly (for use in other server code)
 * This can be imported and used without making an API call
 */
export function generateStaticMapUrl(
  latitude: number,
  longitude: number,
  options: {
    radii?: number[];
    size?: string;
    maptype?: 'satellite' | 'roadmap';
    apiKey: string;
  }
): string {
  const {
    radii = [1, 3, 5],
    size = '600x400',
    maptype = 'satellite',
    apiKey,
  } = options;

  const [width, height] = size.split('x').map(Number);
  const sortedRadii = [...radii].sort((a, b) => b - a);
  const zoom = calculateZoom(Math.max(...radii), width);

  // Build circle paths
  const opacities = ['26', '40', '59'];
  const circlePaths = sortedRadii.map((radius, index) => {
    const opacity = opacities[Math.min(index, opacities.length - 1)];
    return createCirclePath(latitude, longitude, radius, opacity);
  });

  // Build URL
  const params = new URLSearchParams();
  params.append('center', `${latitude},${longitude}`);
  params.append('zoom', zoom.toString());
  params.append('size', size);
  params.append('maptype', maptype);
  params.append('key', apiKey);
  params.append('markers', `color:${MARKER_COLOR}|${latitude},${longitude}`);

  let url = `${STATIC_MAPS_URL}?${params.toString()}`;
  circlePaths.forEach(path => {
    url += `&${path}`;
  });

  return url;
}


