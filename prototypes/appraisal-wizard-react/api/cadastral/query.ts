/**
 * Cadastral Query API Route
 * POST /api/cadastral/query
 * 
 * Queries property parcel data. For Montana, uses free state GIS.
 * For other states, returns mock data (Cotality integration pending).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  queryParcelByLocation,
  queryParcelByParcelId,
  queryParcelByAddress,
  isMontana,
} from '../_lib/cadastral.js';
import type { MontanaCadastralParcel } from '../_lib/cadastral.js';

interface CadastralRequestBody {
  latitude?: number;
  longitude?: number;
  parcelId?: string;
  address?: string;
  city?: string;
  state?: string;
}

// Map Montana parcel to API response format
function formatParcelResponse(parcel: MontanaCadastralParcel) {
  return {
    parcelId: parcel.parcelId,
    legalDescription: parcel.legalDescription,
    county: parcel.countyName,
    acres: parcel.acres,
    sqft: parcel.sqft,
    situsAddress: parcel.situsAddress,
    situsCity: parcel.situsCity,
    situsZip: parcel.situsZip,
    ownerName: parcel.ownerName,
    ownerName2: parcel.ownerName2,
    mailingAddress: parcel.mailingAddress,
    assessedLandValue: parcel.assessedLandValue,
    assessedImprovementValue: parcel.assessedImprovementValue,
    totalAssessedValue: parcel.totalAssessedValue,
    taxYear: parcel.taxYear,
    propertyType: parcel.propertyType,
    township: parcel.township,
    range: parcel.range,
    section: parcel.section,
    // Geocoded coordinates for demographics/economic lookups
    latitude: parcel.latitude,
    longitude: parcel.longitude,
  };
}

// Generate mock data for non-Montana properties
function generateMockParcel(address?: string, city?: string, state?: string, latitude?: number, longitude?: number) {
  return {
    parcelId: `MOCK-${Date.now()}`,
    legalDescription: 'Lot 1, Block 1, Mock Subdivision',
    county: city || 'Sample County',
    acres: 0.5 + Math.random() * 4.5,
    sqft: Math.round(21780 + Math.random() * 195000),
    situsAddress: address || '123 Main Street',
    situsCity: city || 'Sample City',
    situsZip: '00000',
    ownerName: 'Property Owner',
    mailingAddress: address || '123 Main Street',
    assessedLandValue: Math.round(50000 + Math.random() * 200000),
    assessedImprovementValue: Math.round(100000 + Math.random() * 400000),
    totalAssessedValue: 0, // Will be calculated
    taxYear: new Date().getFullYear(),
    propertyType: 'Commercial',
    // Include coordinates if provided
    latitude: latitude,
    longitude: longitude,
  };
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
    const body = req.body as CadastralRequestBody;
    const { latitude, longitude, parcelId, address, city, state } = body;

    // Validate that we have some query parameters
    const hasCoordinates = latitude !== undefined && longitude !== undefined;
    const hasParcelId = parcelId !== undefined;
    const hasAddress = address !== undefined && city !== undefined;

    if (!hasCoordinates && !hasParcelId && !hasAddress) {
      return res.status(400).json({
        success: false,
        error: 'Provide either (latitude, longitude), parcelId, or (address, city)',
        data: null,
      });
    }

    // Check if this is a Montana property
    const effectiveState = state || 'MT';  // Default to MT if not specified
    const isMT = isMontana(effectiveState);

    if (!isMT) {
      // For non-Montana properties, return mock data
      // In production, this would call Cotality API
      const mockData = generateMockParcel(address, city, state, latitude, longitude);
      mockData.totalAssessedValue = mockData.assessedLandValue + mockData.assessedImprovementValue;

      return res.status(200).json({
        success: true,
        data: mockData,
        source: 'mock',
        message: 'Non-Montana properties use mock data. Cotality integration pending.',
        error: null,
      });
    }

    // Montana property - use Cadastral API
    let result;

    if (hasCoordinates) {
      result = await queryParcelByLocation(latitude!, longitude!);
    } else if (hasParcelId) {
      result = await queryParcelByParcelId(parcelId!);
    } else if (hasAddress) {
      result = await queryParcelByAddress(address!, city!);
    }

    if (!result) {
      return res.status(500).json({
        success: false,
        error: 'Query failed unexpectedly',
        data: null,
      });
    }

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Query failed',
        data: null,
      });
    }

    if (!result.parcel) {
      return res.status(404).json({
        success: true,
        data: null,
        source: 'montana_cadastral',
        message: result.error || 'No parcel found',
        error: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: formatParcelResponse(result.parcel),
      source: 'montana_cadastral',
      error: null,
    });
  } catch (error) {
    console.error('Cadastral query error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({
      success: false,
      error: `Failed to query cadastral data: ${errorMessage}`,
      data: null,
    });
  }
}

export default handler;

