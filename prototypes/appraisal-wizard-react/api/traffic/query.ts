/**
 * Traffic Data API Route
 * POST /api/traffic/query
 * 
 * Returns traffic data for roads near a property location.
 * 
 * Data Sources:
 * - MDOT (Montana Department of Transportation) for Montana properties
 * - Mock data for other states (state DOT integrations pending)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  queryMDOTTrafficData,
  generateMockTrafficData,
  isMontana,
} from '../_lib/traffic';

interface TrafficRequestBody {
  latitude: number;
  longitude: number;
  state?: string;
  radiusMiles?: number;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
      data: null,
    });
  }

  try {
    const body = req.body as TrafficRequestBody;
    const { latitude, longitude, state, radiusMiles = 0.5 } = body;

    // Validate coordinates
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'latitude and longitude must be valid numbers',
        data: null,
      });
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates',
        data: null,
      });
    }

    const effectiveState = state || 'MT';  // Default to MT
    const isMT = isMontana(effectiveState);

    if (isMT) {
      // Use MDOT API for Montana
      console.log('[Traffic API] Using MDOT for Montana property');
      const result = await queryMDOTTrafficData(latitude, longitude, radiusMiles);

      if (!result.success) {
        // MDOT failed, return mock data as fallback
        console.log('[Traffic API] MDOT failed, using mock data');
        const mockData = generateMockTrafficData(latitude, longitude, effectiveState);
        return res.status(200).json({
          success: true,
          data: mockData,
          source: 'mock',
          note: 'MDOT query failed, showing estimated data',
          error: null,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        source: 'mdot',
        note: 'Traffic data from Montana Department of Transportation',
        error: null,
      });
    }

    // Non-Montana: Use mock data
    // In production, this would route to state-specific DOT APIs
    console.log(`[Traffic API] Using mock data for ${effectiveState}`);
    const mockData = generateMockTrafficData(latitude, longitude, effectiveState);

    return res.status(200).json({
      success: true,
      data: mockData,
      source: 'mock',
      note: `Traffic data for ${effectiveState} is estimated. State DOT integration pending.`,
      error: null,
    });
  } catch (error) {
    console.error('Traffic query error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({
      success: false,
      error: `Failed to query traffic data: ${errorMessage}`,
      data: null,
    });
  }
}
