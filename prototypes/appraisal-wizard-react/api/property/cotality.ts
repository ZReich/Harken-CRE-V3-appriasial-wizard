/**
 * Cotality (CoreLogic) Property Lookup API
 * 
 * This is a Vercel serverless function that proxies requests to the Cotality API.
 * It handles OAuth token generation and returns property data.
 * 
 * Based on the Harken backend implementation at:
 * packages/backend/src/services/common/common.service.ts
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Constants
const CORELOGIC_API_TIMEOUT = 15000;
const DEFAULT_BASE_URL = 'https://property.corelogicapi.com';
const OAUTH_URL = 'https://api-prod.corelogic.com/oauth/token?grant_type=client_credentials';

/**
 * Get Cotality OAuth Bearer Token
 */
async function getCotalityToken(): Promise<string | null> {
  try {
    const clientId = process.env.CORELOGIC_CONSUMER_KEY;
    const clientSecret = process.env.CORELOGIC_CONSUMER_SECRET;

    if (!clientId || !clientSecret) {
      console.error('[Cotality] Missing credentials');
      return null;
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenResponse = await axios.post(
      OAUTH_URL,
      {},
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: CORELOGIC_API_TIMEOUT,
      }
    );

    return tokenResponse.data.access_token;
  } catch (error) {
    console.error('[Cotality] Token request failed:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Search for properties by address
 */
async function searchProperties(token: string, params: {
  streetAddress: string;
  city: string;
  state: string;
  zipCode?: string;
}): Promise<any> {
  const baseUrl = process.env.CORELOGIC_BASE_URL || DEFAULT_BASE_URL;
  const url = `${baseUrl}/v2/properties/search`;

  const searchParams = new URLSearchParams({
    streetAddress: params.streetAddress,
    city: params.city,
    stateCode: params.state,
    ...(params.zipCode && { zipCode: params.zipCode }),
    bestMatch: 'true',
  });

  const response = await axios.get(`${url}?${searchParams.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
    timeout: CORELOGIC_API_TIMEOUT,
  });

  return response.data;
}

/**
 * Get property details by clipId
 */
async function getPropertyDetails(token: string, clipId: string): Promise<any> {
  const baseUrl = process.env.CORELOGIC_BASE_URL || DEFAULT_BASE_URL;
  
  // Fetch all property data concurrently
  const [propertyData, buildingData, siteData, taxData, ownershipData] = await Promise.allSettled([
    axios.get(`${baseUrl}/v2/properties/${clipId}/property-detail`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      timeout: CORELOGIC_API_TIMEOUT,
    }),
    axios.get(`${baseUrl}/v2/properties/${clipId}/buildings`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      timeout: CORELOGIC_API_TIMEOUT,
    }),
    axios.get(`${baseUrl}/v2/properties/${clipId}/site-location`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      timeout: CORELOGIC_API_TIMEOUT,
    }),
    axios.get(`${baseUrl}/v2/properties/${clipId}/tax-assessments/latest`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      timeout: CORELOGIC_API_TIMEOUT,
    }),
    axios.get(`${baseUrl}/v2/properties/${clipId}/ownership`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      timeout: CORELOGIC_API_TIMEOUT,
    }),
  ]);

  // Extract values from settled promises
  const extractValue = <T>(result: PromiseSettledResult<{ data: T }>): T | null => {
    if (result.status === 'fulfilled') {
      return result.value.data;
    }
    return null;
  };

  return buildPropertyDetails({
    property: extractValue(propertyData),
    building: extractValue(buildingData),
    site: extractValue(siteData),
    tax: extractValue(taxData),
    ownership: extractValue(ownershipData),
  });
}

/**
 * Build normalized property details from Cotality API responses
 * Maps Cotality fields to wizard field paths
 */
function buildPropertyDetails(data: {
  property: any;
  building: any;
  site: any;
  tax: any;
  ownership: any;
}): Record<string, { value: string | null; confidence: number }> {
  const result: Record<string, { value: string | null; confidence: number }> = {};

  // Property Data
  if (data.property) {
    const prop = data.property;
    
    // Address fields
    if (prop.streetAddress) {
      result['subjectData.address.street'] = { value: prop.streetAddress, confidence: 0.95 };
    }
    if (prop.city) {
      result['subjectData.address.city'] = { value: prop.city, confidence: 0.95 };
    }
    if (prop.state || prop.stateCode) {
      result['subjectData.address.state'] = { value: prop.stateCode || prop.state, confidence: 0.95 };
    }
    if (prop.zipCode || prop.zip) {
      result['subjectData.address.zip'] = { value: prop.zipCode || prop.zip, confidence: 0.95 };
    }
    if (prop.countyName || prop.county) {
      result['subjectData.address.county'] = { value: prop.countyName || prop.county, confidence: 0.95 };
    }
    
    // Property identifiers
    if (prop.apn || prop.parcelNumber) {
      result['subjectData.taxId'] = { value: prop.apn || prop.parcelNumber, confidence: 0.95 };
    }
    if (prop.legalDescription) {
      result['subjectData.legalDescription'] = { value: prop.legalDescription, confidence: 0.90 };
    }
  }

  // Building Data
  if (data.building) {
    const bldg = Array.isArray(data.building) ? data.building[0] : data.building;
    
    if (bldg?.yearBuilt) {
      result['improvementsInventory.parcels.0.buildings.0.yearBuilt'] = { 
        value: String(bldg.yearBuilt), 
        confidence: 0.90 
      };
    }
    if (bldg?.grossLivingArea || bldg?.buildingArea || bldg?.squareFootage) {
      result['subjectData.buildingSize'] = { 
        value: String(bldg.grossLivingArea || bldg.buildingArea || bldg.squareFootage), 
        confidence: 0.85 
      };
    }
    if (bldg?.bedrooms) {
      result['subjectData.bedrooms'] = { value: String(bldg.bedrooms), confidence: 0.90 };
    }
    if (bldg?.bathrooms || bldg?.bathroomsTotal) {
      result['subjectData.bathrooms'] = { 
        value: String(bldg.bathrooms || bldg.bathroomsTotal), 
        confidence: 0.90 
      };
    }
  }

  // Site Data
  if (data.site) {
    const site = data.site;
    
    if (site.lotSizeAcres || site.acres) {
      result['subjectData.siteArea'] = { 
        value: String(site.lotSizeAcres || site.acres), 
        confidence: 0.90 
      };
    } else if (site.lotSizeSqFt || site.squareFeet) {
      // Convert square feet to acres
      const acres = (site.lotSizeSqFt || site.squareFeet) / 43560;
      result['subjectData.siteArea'] = { value: acres.toFixed(4), confidence: 0.85 };
    }
    
    if (site.zoning || site.zoningCode) {
      result['subjectData.zoningClass'] = { 
        value: site.zoning || site.zoningCode, 
        confidence: 0.85 
      };
    }
  }

  // Tax Data
  if (data.tax) {
    const tax = data.tax;
    
    if (tax.assessedLandValue !== undefined) {
      result['subjectData.cadastralData.assessedLandValue'] = { 
        value: String(tax.assessedLandValue), 
        confidence: 0.90 
      };
    }
    if (tax.assessedImprovementValue !== undefined) {
      result['subjectData.cadastralData.assessedImprovementValue'] = { 
        value: String(tax.assessedImprovementValue), 
        confidence: 0.90 
      };
    }
    if (tax.totalAssessedValue !== undefined) {
      result['subjectData.cadastralData.totalAssessedValue'] = { 
        value: String(tax.totalAssessedValue), 
        confidence: 0.90 
      };
    }
  }

  // Ownership Data
  if (data.ownership) {
    const owner = Array.isArray(data.ownership) ? data.ownership[0] : data.ownership;
    
    if (owner?.ownerName || owner?.owner1Name) {
      result['owners.0.name'] = { 
        value: owner.ownerName || owner.owner1Name, 
        confidence: 0.90 
      };
    }
  }

  return result;
}

/**
 * Main handler
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check for required environment variables
  if (!process.env.CORELOGIC_CONSUMER_KEY || !process.env.CORELOGIC_CONSUMER_SECRET) {
    console.warn('[Cotality] Missing CORELOGIC credentials - Cotality integration not configured');
    return res.status(200).json({
      success: false,
      error: 'Cotality integration not configured. Please add CORELOGIC_CONSUMER_KEY and CORELOGIC_CONSUMER_SECRET.',
      fields: {},
    });
  }

  try {
    // Get OAuth token
    const token = await getCotalityToken();
    if (!token) {
      return res.status(500).json({
        success: false,
        error: 'Failed to authenticate with Cotality API',
        fields: {},
      });
    }

    if (req.method === 'POST') {
      // Search by address
      const { streetAddress, city, state, zipCode } = req.body;

      if (!streetAddress || !city || !state) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: streetAddress, city, state',
          fields: {},
        });
      }

      console.log(`[Cotality] Searching for property: ${streetAddress}, ${city}, ${state}`);

      try {
        const searchResult = await searchProperties(token, { streetAddress, city, state, zipCode });

        if (!searchResult?.items?.length) {
          return res.status(200).json({
            success: false,
            error: 'No properties found',
            fields: {},
          });
        }

        // Get the best match clipId
        const clipId = searchResult.items[0].clipId;
        console.log(`[Cotality] Found property with clipId: ${clipId}`);

        // Get full property details
        const fields = await getPropertyDetails(token, clipId);

        return res.status(200).json({
          success: true,
          clipId,
          fields,
        });
      } catch (searchError: any) {
        if (searchError.response?.status === 429) {
          return res.status(429).json({
            success: false,
            error: 'Cotality API rate limit exceeded. Please try again later.',
            fields: {},
          });
        }
        throw searchError;
      }
    } else if (req.method === 'GET') {
      // Get property by clipId
      const { clipId } = req.query;

      if (!clipId || typeof clipId !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Missing required query parameter: clipId',
          fields: {},
        });
      }

      console.log(`[Cotality] Getting property details for clipId: ${clipId}`);

      const fields = await getPropertyDetails(token, clipId);

      return res.status(200).json({
        success: true,
        clipId,
        fields,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[Cotality] Error:', error instanceof Error ? error.message : error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      fields: {},
    });
  }
}
