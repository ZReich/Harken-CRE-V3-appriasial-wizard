/**
 * Debug endpoint to test ESRI GeoEnrichment API
 * GET /api/debug/esri-test?lat=45.6770&lng=-111.0429
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isESRIConfigured, getESRIToken, fetchGeoEnrichment, getESRIAuthMethod } from '../_lib/esri';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const lat = parseFloat(req.query.lat as string) || 45.6770;
  const lng = parseFloat(req.query.lng as string) || -111.0429;

  const result: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    isConfigured: isESRIConfigured(),
    authMethod: getESRIAuthMethod(),
    testLocation: { lat, lng },
  };

  try {
    // Step 1: Get token
    console.log('Step 1: Getting ESRI token...');
    const token = await getESRIToken();
    result.tokenObtained = true;
    result.tokenPreview = token.substring(0, 15) + '...' + token.substring(token.length - 5);
    console.log('Token obtained:', result.tokenPreview);

    // Step 2: Call GeoEnrichment
    console.log('Step 2: Calling GeoEnrichment API...');
    const data = await fetchGeoEnrichment(lat, lng, [1], token);
    result.geoEnrichmentSuccess = true;
    result.data = data;
    console.log('GeoEnrichment success:', data);

  } catch (error) {
    result.error = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
    console.error('ESRI test error:', error);
  }

  return res.status(200).json(result);
}

