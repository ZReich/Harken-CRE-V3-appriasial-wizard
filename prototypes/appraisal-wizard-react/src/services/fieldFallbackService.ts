/**
 * Field Fallback Service
 * 
 * Handles the priority hierarchy for field suggestions:
 * 1. Document upload (Accept/Reject UI)
 * 2. Montana GIS (free, for Montana properties - auto-apply)
 * 3. Cotality API (paid, for all properties - auto-apply)
 * 
 * When a user rejects a document suggestion, this service
 * automatically fetches from the appropriate external API.
 */

import { getPropertyData } from './propertyDataRouter';
import { canPopulateFromCotality } from '../config/cotalityFieldMapping';

const API_BASE_URL = import.meta.env.DEV 
  ? '' // Use relative URL in dev (handled by Vite proxy or vercel dev)
  : '';

export type FallbackSource = 'montana_gis' | 'cotality';

export interface FallbackResult {
  success: boolean;
  source: FallbackSource;
  value?: string;
  confidence?: number;
  error?: string;
}

/**
 * Determine if a property is in Montana based on state field.
 */
export function isMonatanaProperty(state: string | undefined): boolean {
  if (!state) return false;
  const normalized = state.toUpperCase().trim();
  return normalized === 'MT' || normalized === 'MONTANA';
}

/**
 * Fetch field value from external APIs after user rejects document suggestion.
 * Automatically chooses Montana GIS or Cotality based on property location.
 */
export async function fetchFallbackValue(
  fieldPath: string,
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    county?: string;
  }
): Promise<FallbackResult> {
  try {
    // Determine which source to use based on state
    const isMontana = isMonatanaProperty(address.state);
    const source: FallbackSource = isMontana ? 'montana_gis' : 'cotality';

    console.log(`[FieldFallback] Fetching ${fieldPath} from ${source}`);
    console.log(`[FieldFallback] Address: ${address.street}, ${address.city}, ${address.state}`);

    if (source === 'montana_gis') {
      // Try Montana GIS first (free)
      const gisResult = await fetchFromMontanaGIS(fieldPath, address);
      if (gisResult.success) {
        return gisResult;
      }
      
      // If Montana GIS fails, fall back to Cotality
      console.log(`[FieldFallback] Montana GIS failed, trying Cotality`);
      return await fetchFromCotality(fieldPath, address);
    } else {
      // Non-Montana: use Cotality directly
      return await fetchFromCotality(fieldPath, address);
    }
  } catch (error) {
    console.error('[FieldFallback] Error:', error);
    return {
      success: false,
      source: 'cotality',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch field value from Montana GIS (free).
 */
async function fetchFromMontanaGIS(
  fieldPath: string,
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    county?: string;
  }
): Promise<FallbackResult> {
  try {
    // Use the existing propertyDataRouter which handles Montana GIS
    const result = await getPropertyData({
      address: address.street || '',
      city: address.city || '',
      state: address.state || '',
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        source: 'montana_gis',
        error: result.error || 'No data found',
      };
    }

    // Map the property data to the requested field
    const value = getFieldValueFromPropertyData(result.data, fieldPath);
    
    if (!value) {
      return {
        success: false,
        source: 'montana_gis',
        error: `Field ${fieldPath} not found in Montana GIS data`,
      };
    }

    return {
      success: true,
      source: 'montana_gis',
      value,
      confidence: 0.95, // High confidence for GIS data
    };
  } catch (error) {
    console.error('[FieldFallback] Montana GIS error:', error);
    return {
      success: false,
      source: 'montana_gis',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch field value from Cotality API.
 */
async function fetchFromCotality(
  fieldPath: string,
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    county?: string;
  }
): Promise<FallbackResult> {
  try {
    // Check if this field can be populated from Cotality
    if (!canPopulateFromCotality(fieldPath)) {
      return {
        success: false,
        source: 'cotality',
        error: `Field ${fieldPath} not available from Cotality`,
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/property/cotality`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        streetAddress: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zip,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        source: 'cotality',
        error: errorData.error || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();

    if (!data.success || !data.fields) {
      return {
        success: false,
        source: 'cotality',
        error: data.error || 'No data returned',
      };
    }

    // Get the specific field value
    const fieldData = data.fields[fieldPath];
    if (!fieldData || !fieldData.value) {
      return {
        success: false,
        source: 'cotality',
        error: `Field ${fieldPath} not found in Cotality data`,
      };
    }

    return {
      success: true,
      source: 'cotality',
      value: fieldData.value,
      confidence: fieldData.confidence || 0.90,
    };
  } catch (error) {
    console.error('[FieldFallback] Cotality error:', error);
    return {
      success: false,
      source: 'cotality',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extract field value from property data based on wizard path.
 */
function getFieldValueFromPropertyData(
  data: any,
  fieldPath: string
): string | undefined {
  const pathMap: Record<string, (d: any) => string | undefined> = {
    'subjectData.address.street': (d) => d.situsAddress,
    'subjectData.address.city': (d) => d.situsCity,
    'subjectData.address.state': (d) => d.situsState || 'MT',
    'subjectData.address.zip': (d) => d.situsZip,
    'subjectData.address.county': (d) => d.county,
    'subjectData.taxId': (d) => d.parcelId,
    'subjectData.legalDescription': (d) => d.legalDescription,
    'subjectData.siteArea': (d) => d.acres?.toString() || (d.sqft ? (d.sqft / 43560).toFixed(4) : undefined),
    'subjectData.zoningClass': (d) => d.zoning,
    'owners.0.name': (d) => d.ownerName,
    'subjectData.cadastralData.assessedLandValue': (d) => d.assessedLandValue?.toString(),
    'subjectData.cadastralData.assessedImprovementValue': (d) => d.assessedImprovementValue?.toString(),
    'subjectData.cadastralData.totalAssessedValue': (d) => d.totalAssessedValue?.toString(),
  };

  const extractor = pathMap[fieldPath];
  return extractor ? extractor(data) : undefined;
}
