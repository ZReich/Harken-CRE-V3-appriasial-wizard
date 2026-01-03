/**
 * Map Generation Service
 * 
 * Provides utilities for generating maps for appraisal reports, including:
 * - Comparable sales maps with auto-zoom to fit all pins
 * - Subject property maps (aerial, location, vicinity)
 * - Static map URL generation for PDF export
 */

import type {
  MapData,
  MapMarker,
  MapType,
  MapBoundsResult,
  ComparableMapConfig,
  MapGenerationOptions,
  MapMarkerType,
} from '../types';

// =================================================================
// CONSTANTS
// =================================================================

const GOOGLE_STATIC_MAPS_URL = 'https://maps.googleapis.com/maps/api/staticmap';

// Marker colors by type
export const MARKER_COLORS: Record<MapMarkerType, string> = {
  'subject': '#dc2626',       // Red
  'improved-sale': '#2563eb', // Blue
  'land-sale': '#ea580c',     // Orange
  'rental': '#16a34a',        // Green
  'landmark': '#6b7280',      // Gray
};

// Map type to marker type mapping
const APPROACH_TO_MARKER_TYPE: Record<string, MapMarkerType> = {
  'improved-sales': 'improved-sale',
  'land-sales': 'land-sale',
  'rental-comps': 'rental',
};

// =================================================================
// BOUNDS & ZOOM CALCULATION
// =================================================================

/**
 * Calculate the optimal center and zoom level to fit all markers on a map.
 * Uses bounding box calculation with appropriate padding.
 * 
 * @param markers - Array of markers with lat/lng coordinates
 * @returns Object containing center point, zoom level, and bounds
 */
export function calculateBoundsZoom(
  markers: Array<{ lat: number; lng: number }>
): MapBoundsResult {
  if (markers.length === 0) {
    return {
      center: { lat: 0, lng: 0 },
      zoom: 12,
      bounds: { north: 0, south: 0, east: 0, west: 0 },
    };
  }

  if (markers.length === 1) {
    return {
      center: { lat: markers[0].lat, lng: markers[0].lng },
      zoom: 14, // Default zoom for single marker
      bounds: {
        north: markers[0].lat,
        south: markers[0].lat,
        east: markers[0].lng,
        west: markers[0].lng,
      },
    };
  }

  // Find bounding box
  const lats = markers.map(m => m.lat);
  const lngs = markers.map(m => m.lng);

  const bounds = {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
  };

  // Calculate center
  const center = {
    lat: (bounds.north + bounds.south) / 2,
    lng: (bounds.east + bounds.west) / 2,
  };

  // Calculate zoom to fit all markers with padding
  // We add 20% padding to the span for visual breathing room
  const latSpan = (bounds.north - bounds.south) * 1.2;
  const lngSpan = (bounds.east - bounds.west) * 1.2;
  const maxSpan = Math.max(latSpan, lngSpan);

  // Zoom levels based on span (degrees)
  // These values are calibrated for typical map sizes (~600x400px)
  let zoom = 12;
  if (maxSpan < 0.005) zoom = 16;       // < 0.25 mile
  else if (maxSpan < 0.01) zoom = 15;   // < 0.5 mile
  else if (maxSpan < 0.02) zoom = 14;   // < 1 mile
  else if (maxSpan < 0.04) zoom = 13;   // < 2 miles
  else if (maxSpan < 0.08) zoom = 12;   // < 4 miles
  else if (maxSpan < 0.15) zoom = 11;   // < 8 miles
  else if (maxSpan < 0.3) zoom = 10;    // < 15 miles
  else if (maxSpan < 0.6) zoom = 9;     // < 30 miles
  else if (maxSpan < 1.2) zoom = 8;     // < 60 miles
  else zoom = 7;                         // > 60 miles

  return { center, zoom, bounds };
}

/**
 * Calculate distance between two points in miles.
 * Uses the Haversine formula.
 */
export function calculateDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// =================================================================
// MAP GENERATION
// =================================================================

/**
 * Generate a unique ID for a map.
 */
function generateMapId(): string {
  return `map_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Generate a comparable map showing subject and all comparables.
 * Automatically calculates zoom to fit all pins.
 * 
 * @param config - Configuration for the comparable map
 * @returns MapData object ready for display
 */
export function generateComparableMap(config: ComparableMapConfig): MapData {
  const {
    subject,
    comparables,
    mapType = 'roadmap',
    type,
    title,
  } = config;

  const markerType = APPROACH_TO_MARKER_TYPE[type] || 'improved-sale';

  // Create markers array
  const markers: MapMarker[] = [
    // Subject marker
    {
      id: 'subject',
      lat: subject.lat,
      lng: subject.lng,
      label: subject.propertyName || 'Subject',
      type: 'subject',
      color: MARKER_COLORS.subject,
      address: subject.address,
    },
    // Comparable markers (numbered)
    ...comparables.map((comp, index) => ({
      id: comp.id,
      lat: comp.lat,
      lng: comp.lng,
      label: comp.label || `Comp ${index + 1}`,
      type: markerType as MapMarkerType,
      color: MARKER_COLORS[markerType],
      number: index + 1,
      address: comp.address,
      details: comp.details,
    })),
  ];

  // Calculate bounds to fit all markers
  const { center, zoom } = calculateBoundsZoom(markers);

  // Generate static map URL
  const imageUrl = generateStaticMapUrl({
    center,
    zoom,
    markers,
    mapType,
    size: { width: 600, height: 400 },
  });

  // Map type title
  const mapTitles: Record<string, string> = {
    'improved-sales': 'Improved Sales Map',
    'land-sales': 'Land Sales Map',
    'rental-comps': 'Rental Comparables Map',
  };

  return {
    id: generateMapId(),
    type: type as MapType,
    title: title || mapTitles[type] || 'Comparable Map',
    source: 'generated',
    center,
    zoom,
    mapType,
    markers,
    imageUrl,
    reportSections: [type, 'addenda'],
    capturedAt: new Date().toISOString(),
  };
}

/**
 * Generate a static map URL for Google Static Maps API.
 * Used for embedding in PDF reports.
 */
export function generateStaticMapUrl(options: {
  center: { lat: number; lng: number };
  zoom: number;
  markers: MapMarker[];
  mapType?: 'satellite' | 'roadmap' | 'hybrid';
  size?: { width: number; height: number };
}): string {
  const {
    center,
    zoom,
    markers,
    mapType = 'roadmap',
    size = { width: 600, height: 400 },
  } = options;

  // Get API key from environment
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('Google Maps API key not configured');
    return '';
  }

  // Build URL parameters
  const params = new URLSearchParams();
  params.append('center', `${center.lat},${center.lng}`);
  params.append('zoom', zoom.toString());
  params.append('size', `${size.width}x${size.height}`);
  params.append('maptype', mapType);
  params.append('key', apiKey);

  // Add markers
  // Group markers by color for efficient URL
  const markersByColor: Record<string, MapMarker[]> = {};
  markers.forEach(marker => {
    const color = marker.color.replace('#', '0x');
    if (!markersByColor[color]) {
      markersByColor[color] = [];
    }
    markersByColor[color].push(marker);
  });

  // Build marker parameters
  Object.entries(markersByColor).forEach(([color, colorMarkers]) => {
    colorMarkers.forEach((marker, idx) => {
      const label = marker.type === 'subject' ? 'S' : (marker.number?.toString() || (idx + 1).toString());
      params.append(
        'markers',
        `color:${color}|label:${label}|${marker.lat},${marker.lng}`
      );
    });
  });

  return `${GOOGLE_STATIC_MAPS_URL}?${params.toString()}`;
}

/**
 * Generate a subject property map (aerial, location, vicinity).
 */
export function generateSubjectMap(
  lat: number,
  lng: number,
  type: 'aerial' | 'location' | 'vicinity',
  options?: {
    propertyName?: string;
    address?: string;
  }
): MapData {
  const mapConfigs = {
    'aerial': {
      zoom: 18,
      mapType: 'satellite' as const,
      title: 'Aerial View',
    },
    'location': {
      zoom: 15,
      mapType: 'roadmap' as const,
      title: 'Location Map',
    },
    'vicinity': {
      zoom: 13,
      mapType: 'roadmap' as const,
      title: 'Vicinity Map',
    },
  };

  const config = mapConfigs[type];

  const markers: MapMarker[] = [
    {
      id: 'subject',
      lat,
      lng,
      label: options?.propertyName || 'Subject Property',
      type: 'subject',
      color: MARKER_COLORS.subject,
      address: options?.address,
    },
  ];

  const imageUrl = generateStaticMapUrl({
    center: { lat, lng },
    zoom: config.zoom,
    markers,
    mapType: config.mapType,
    size: { width: 600, height: 400 },
  });

  return {
    id: generateMapId(),
    type,
    title: config.title,
    source: 'generated',
    center: { lat, lng },
    zoom: config.zoom,
    mapType: config.mapType,
    markers,
    imageUrl,
    reportSections: ['subject-photos', 'site-analysis', 'addenda'],
    capturedAt: new Date().toISOString(),
  };
}

/**
 * Generate all standard subject property maps at once.
 */
export function generateAllSubjectMaps(
  lat: number,
  lng: number,
  options?: {
    propertyName?: string;
    address?: string;
  }
): MapData[] {
  return [
    generateSubjectMap(lat, lng, 'aerial', options),
    generateSubjectMap(lat, lng, 'location', options),
    generateSubjectMap(lat, lng, 'vicinity', options),
  ];
}

// =================================================================
// GEOCODING HELPER
// =================================================================

/**
 * Geocode an address to lat/lng coordinates.
 * Uses Google Geocoding API.
 * 
 * @param address - Full address string
 * @returns Promise with lat/lng or null if not found
 */
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('Google Maps API key not configured for geocoding');
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }

    console.warn(`Geocoding returned no results for: ${address}`);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Batch geocode multiple addresses.
 * Returns a map of address to coordinates.
 */
export async function batchGeocodeAddresses(
  addresses: string[]
): Promise<Map<string, { lat: number; lng: number } | null>> {
  const results = new Map<string, { lat: number; lng: number } | null>();
  
  // Process in batches to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (address) => {
        const coords = await geocodeAddress(address);
        return { address, coords };
      })
    );
    
    batchResults.forEach(({ address, coords }) => {
      results.set(address, coords);
    });
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < addresses.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return results;
}

// =================================================================
// EXPORTS
// =================================================================

export default {
  calculateBoundsZoom,
  calculateDistanceMiles,
  generateComparableMap,
  generateStaticMapUrl,
  generateSubjectMap,
  generateAllSubjectMaps,
  geocodeAddress,
  batchGeocodeAddresses,
  MARKER_COLORS,
};
