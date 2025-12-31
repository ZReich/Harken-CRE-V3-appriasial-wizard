/**
 * Traffic Data Service
 * 
 * Fetches traffic data from the Vercel API routes.
 * - MDOT for Montana properties
 * - State DOT APIs for other states (mock data until integrated)
 */

import { apiPost } from './api';

export interface TrafficDataEntry {
  roadName: string;
  roadClass: 'local' | 'collector' | 'arterial' | 'highway' | 'interstate';
  annualAverageDailyTraffic: number;
  truckPercentage?: number;
  speedLimit?: number;
  lanesCount?: number;
  distance?: string;
  direction?: string;
  year?: number;
  stationId?: string;
  source: 'mdot' | 'state_dot' | 'manual' | 'mock';
}

interface TrafficResponse {
  success: boolean;
  data: TrafficDataEntry[];
  source: string;
  note?: string;
  error?: string;
}

/**
 * Fetch traffic data for a location
 */
export async function fetchTrafficData(
  latitude: number,
  longitude: number,
  state?: string,
  radiusMiles: number = 0.5
): Promise<{
  data: TrafficDataEntry[];
  source: string;
  note?: string;
  error?: string;
}> {
  try {
    const response = await apiPost<TrafficResponse, {
      latitude: number;
      longitude: number;
      state?: string;
      radiusMiles?: number;
    }>('/traffic/query', {
      latitude,
      longitude,
      state,
      radiusMiles,
    });

    if (!response.success) {
      return {
        data: [],
        source: 'error',
        error: response.error || 'Failed to fetch traffic data',
      };
    }

    return {
      data: response.data || [],
      source: response.source || 'unknown',
      note: response.note,
    };
  } catch (error) {
    console.error('Traffic service error:', error);
    return {
      data: [],
      source: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if the traffic data source is MDOT (Montana)
 */
export function isMontana(state?: string): boolean {
  if (!state) return false;
  const normalized = state.toUpperCase().trim();
  return normalized === 'MT' || normalized === 'MONTANA';
}
