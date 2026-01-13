/**
 * Map Capture Utility
 * 
 * Generates static map images using Google Maps Static API
 * with radius rings overlay matching the interactive RadiusRingMap component.
 */

// Ring styling - matches RadiusRingMap.tsx
const RING_COLORS = {
  1: { fill: '0x2fc4b240', stroke: '0x059669' }, // Teal
  3: { fill: '0x3b82f633', stroke: '0x2563eb' }, // Blue
  5: { fill: '0x8b5cf626', stroke: '0x7c3aed' }, // Purple
} as const;

// Convert miles to approximate degrees (rough approximation for circle drawing)
const MILES_TO_DEGREES = 1 / 69;

/**
 * Generate static map URL with radius rings
 */
export function generateStaticMapUrl(
  latitude: number,
  longitude: number,
  options: {
    width?: number;
    height?: number;
    zoom?: number;
    mapType?: 'satellite' | 'roadmap' | 'hybrid';
    radii?: number[];
    showMarker?: boolean;
  } = {}
): string | null {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const {
    width = 640,
    height = 400,
    zoom = 11,
    mapType = 'hybrid',
    radii = [1, 3, 5],
    showMarker = true,
  } = options;

  const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
  const params = new URLSearchParams({
    center: `${latitude},${longitude}`,
    zoom: zoom.toString(),
    size: `${width}x${height}`,
    maptype: mapType,
    scale: '2', // Retina quality
    key: apiKey,
  });

  // Add subject marker
  if (showMarker) {
    params.append('markers', `color:red|${latitude},${longitude}`);
  }

  // Add circle paths for each radius (largest first for proper layering)
  const sortedRadii = [...radii].sort((a, b) => b - a);
  
  sortedRadii.forEach((radius) => {
    const colors = RING_COLORS[radius as keyof typeof RING_COLORS] || {
      fill: '0x0da1c740',
      stroke: '0x0da1c7',
    };

    // Generate circle path points
    const circlePath = generateCirclePath(latitude, longitude, radius);
    
    // Add filled circle
    params.append(
      'path',
      `fillcolor:${colors.fill}|color:${colors.stroke}|weight:3|${circlePath}`
    );
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate circle path points for Google Static Maps API
 * Creates a polygon approximating a circle
 */
function generateCirclePath(
  centerLat: number,
  centerLng: number,
  radiusMiles: number,
  numPoints: number = 36
): string {
  const points: string[] = [];
  const radiusDegrees = radiusMiles * MILES_TO_DEGREES;

  // Account for longitude stretching at different latitudes
  const lngCorrection = Math.cos((centerLat * Math.PI) / 180);

  for (let i = 0; i <= numPoints; i++) {
    const angle = (i * 2 * Math.PI) / numPoints;
    const lat = centerLat + radiusDegrees * Math.cos(angle);
    const lng = centerLng + (radiusDegrees * Math.sin(angle)) / lngCorrection;
    points.push(`${lat.toFixed(6)},${lng.toFixed(6)}`);
  }

  return points.join('|');
}

export default { generateStaticMapUrl };
