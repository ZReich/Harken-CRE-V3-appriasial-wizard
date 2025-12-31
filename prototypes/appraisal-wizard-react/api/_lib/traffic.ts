/**
 * Traffic Data API Wrapper
 * 
 * Provides access to traffic count data from various sources:
 * - MDOT (Montana Department of Transportation) for Montana properties
 * - State DOT APIs for other states (to be implemented)
 * 
 * MDOT Data Source: https://www.mdt.mt.gov/publications/datastats/traffic-maps.aspx
 * ArcGIS REST: https://gis.mdt.mt.gov/arcgis/rest/services
 * 
 * 100% portable - can be copied directly to Harken backend.
 */

import fetch from 'node-fetch';

// MDOT Traffic Counts MapServer
const MDOT_TRAFFIC_COUNTS = 'https://gis.mdt.mt.gov/arcgis/rest/services/TrafficCounts/TrafficCounts/MapServer/0/query';

// =================================================================
// TYPES
// =================================================================

export interface TrafficDataEntry {
  roadName: string;
  roadClass: 'local' | 'collector' | 'arterial' | 'highway' | 'interstate';
  annualAverageDailyTraffic: number;  // AADT
  truckPercentage?: number;
  speedLimit?: number;
  lanesCount?: number;
  distance?: string;              // Distance from property
  direction?: string;             // Direction from property (N, S, E, W)
  year?: number;                  // Year of traffic count
  stationId?: string;             // Traffic count station ID
  source: 'mdot' | 'state_dot' | 'manual' | 'mock';
}

export interface TrafficQueryResult {
  success: boolean;
  data: TrafficDataEntry[];
  source: string;
  error?: string;
}

// =================================================================
// MDOT QUERY FUNCTIONS
// =================================================================

/**
 * Query traffic data near a location from MDOT
 * Uses spatial buffer to find traffic count stations within radius
 */
export async function queryMDOTTrafficData(
  latitude: number,
  longitude: number,
  radiusMiles: number = 0.5
): Promise<TrafficQueryResult> {
  try {
    // Convert radius to meters for buffer (1 mile = 1609.34 meters)
    const radiusMeters = radiusMiles * 1609.34;
    
    const url = new URL(MDOT_TRAFFIC_COUNTS);
    url.searchParams.set('f', 'json');
    // Create a buffer geometry around the point
    url.searchParams.set('geometry', JSON.stringify({
      x: longitude,
      y: latitude,
      spatialReference: { wkid: 4326 }
    }));
    url.searchParams.set('geometryType', 'esriGeometryPoint');
    url.searchParams.set('spatialRel', 'esriSpatialRelIntersects');
    url.searchParams.set('distance', radiusMeters.toString());
    url.searchParams.set('units', 'esriSRUnit_Meter');
    url.searchParams.set('outFields', '*');
    url.searchParams.set('returnGeometry', 'false');
    url.searchParams.set('orderByFields', 'AADT DESC');  // Order by highest traffic first

    console.log('[Traffic] MDOT Query URL:', url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Harken/1.0)',
      }
    });

    if (!response.ok) {
      throw new Error(`MDOT API error: ${response.status}`);
    }

    const data = await response.json() as {
      features?: Array<{
        attributes: Record<string, unknown>;
      }>;
    };

    if (!data.features || data.features.length === 0) {
      return {
        success: true,
        data: [],
        source: 'mdot',
        error: 'No traffic data found within search radius',
      };
    }

    // Map MDOT attributes to our format
    const trafficData: TrafficDataEntry[] = data.features.map(feature => {
      const attrs = feature.attributes;
      return {
        roadName: String(attrs.ROUTE_NAME || attrs.ROUTE || 'Unknown Road'),
        roadClass: mapMDOTRouteClass(String(attrs.ROUTE_CLASS || '')),
        annualAverageDailyTraffic: Number(attrs.AADT) || 0,
        truckPercentage: attrs.TRUCK_PCT ? Number(attrs.TRUCK_PCT) : undefined,
        speedLimit: attrs.SPEED_LIMIT ? Number(attrs.SPEED_LIMIT) : undefined,
        lanesCount: attrs.LANES ? Number(attrs.LANES) : undefined,
        year: attrs.COUNT_YEAR ? Number(attrs.COUNT_YEAR) : new Date().getFullYear(),
        stationId: attrs.STATION_ID ? String(attrs.STATION_ID) : undefined,
        source: 'mdot' as const,
      };
    }).slice(0, 10); // Limit to top 10 results

    return {
      success: true,
      data: trafficData,
      source: 'mdot',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Traffic] MDOT query error:', message);
    return {
      success: false,
      data: [],
      source: 'mdot',
      error: message,
    };
  }
}

/**
 * Map MDOT route class codes to our standard classifications
 */
function mapMDOTRouteClass(routeClass: string): TrafficDataEntry['roadClass'] {
  const upper = routeClass.toUpperCase();
  if (upper.includes('INTERSTATE') || upper.includes('I-')) return 'interstate';
  if (upper.includes('HIGHWAY') || upper.includes('US-') || upper.includes('MT-')) return 'highway';
  if (upper.includes('ARTERIAL') || upper.includes('PRINCIPAL')) return 'arterial';
  if (upper.includes('COLLECTOR') || upper.includes('MINOR')) return 'collector';
  return 'local';
}

// =================================================================
// MOCK DATA FOR OTHER STATES
// =================================================================

/**
 * Generate mock traffic data for non-Montana properties
 * In production, this would call state-specific DOT APIs
 */
export function generateMockTrafficData(
  latitude: number,
  longitude: number,
  state: string
): TrafficDataEntry[] {
  // Generate deterministic mock data based on coordinates
  const hash = Math.abs(Math.floor(latitude * 1000 + longitude * 1000));
  
  const roads: TrafficDataEntry[] = [
    {
      roadName: `State Highway ${(hash % 100) + 1}`,
      roadClass: 'highway',
      annualAverageDailyTraffic: 5000 + (hash % 20000),
      truckPercentage: 5 + (hash % 15),
      speedLimit: 55,
      lanesCount: 4,
      direction: 'E',
      distance: '0.2 mi',
      year: new Date().getFullYear() - 1,
      source: 'mock',
    },
    {
      roadName: 'Main Street',
      roadClass: 'arterial',
      annualAverageDailyTraffic: 2000 + (hash % 8000),
      truckPercentage: 3 + (hash % 7),
      speedLimit: 35,
      lanesCount: 2,
      direction: 'N',
      distance: '0.1 mi',
      year: new Date().getFullYear() - 1,
      source: 'mock',
    },
  ];

  // Add interstate if hash suggests proximity
  if (hash % 5 === 0) {
    roads.unshift({
      roadName: `I-${((hash % 10) + 1) * 10}`,
      roadClass: 'interstate',
      annualAverageDailyTraffic: 15000 + (hash % 50000),
      truckPercentage: 15 + (hash % 20),
      speedLimit: 75,
      lanesCount: 4,
      direction: 'S',
      distance: '0.8 mi',
      year: new Date().getFullYear() - 1,
      source: 'mock',
    });
  }

  return roads;
}

/**
 * Check if a state is Montana
 */
export function isMontana(state: string): boolean {
  const normalized = state.toUpperCase().trim();
  return normalized === 'MT' || normalized === 'MONTANA';
}
