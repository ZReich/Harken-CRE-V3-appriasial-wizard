/**
 * Building Permits API Route
 * POST /api/permits/query
 * 
 * Returns building permit history for a property.
 * 
 * Data Sources:
 * - County permit databases (where available)
 * - Cotality permit data (for out-of-state)
 * - Mock data for development/demo
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  queryBuildingPermits,
  queryPermitsByParcelId,
} from '../_lib/permits';

interface PermitsRequestBody {
  address?: string;
  city?: string;
  state?: string;
  county?: string;
  parcelId?: string;
  latitude?: number;
  longitude?: number;
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
    const body = req.body as PermitsRequestBody;
    const { address, city, state, county, parcelId } = body;

    // Validate that we have some query parameters
    const hasAddress = address && city;
    const hasParcelId = parcelId && county && state;

    if (!hasAddress && !hasParcelId) {
      return res.status(400).json({
        success: false,
        error: 'Provide either (address, city) or (parcelId, county, state)',
        data: null,
      });
    }

    let result;

    if (hasParcelId) {
      // Query by parcel ID (more reliable)
      console.log('[Permits API] Querying by parcel ID:', parcelId);
      result = await queryPermitsByParcelId(parcelId!, county!, state!);
    } else {
      // Query by address
      console.log('[Permits API] Querying by address:', address, city);
      result = await queryBuildingPermits(
        address!,
        city!,
        state || 'MT',
        county
      );
    }

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Query failed',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      source: result.source,
      county: result.county,
      note: result.source === 'mock' 
        ? 'Permit data is simulated. County records integration pending.'
        : `Permit data from ${result.county} County records`,
      error: null,
    });
  } catch (error) {
    console.error('Permits query error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({
      success: false,
      error: `Failed to query permit data: ${errorMessage}`,
      data: null,
    });
  }
}
