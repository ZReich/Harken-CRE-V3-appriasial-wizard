/**
 * ESRI GeoEnrichment API Wrapper
 * 
 * Provides access to ESRI's GeoEnrichment API for accurate radius-based demographics.
 * Supports both API Key and OAuth 2.0 client credentials authentication.
 * Falls back to Census API when ESRI is unavailable.
 * 
 * API Documentation: https://developers.arcgis.com/rest/geoenrichment/
 * 100% portable - can be copied directly to Harken backend.
 */

// =================================================================
// TYPES
// =================================================================

export interface ESRIDemographics {
  radius: number;
  population: {
    current: number;
    projected5Year: number;
    annualGrowthRate: number;
  };
  households: {
    current: number;
    projected5Year: number;
    averageSize: number;
  };
  income: {
    medianHousehold: number;
    averageHousehold: number;
    perCapita: number;
  };
  education: {
    percentCollegeGraduates: number;
    percentGraduateDegree: number;
  };
  employment: {
    laborForce: number;
    unemployed: number;
    unemploymentRate: number;
  };
  employmentByIndustry: Array<{
    industry: string;
    percentage: number;
  }>;
}

export interface ESRIEnrichResponse {
  results: Array<{
    value: {
      FeatureSet: Array<{
        features: Array<{
          attributes: Record<string, number | string>;
        }>;
      }>;
    };
  }>;
  error?: {
    code: number;
    message: string;
    details?: string[];
  };
}

interface OAuthTokenResponse {
  access_token: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

// =================================================================
// CONFIGURATION
// =================================================================

const ESRI_ENRICH_URL = 'https://geoenrich.arcgis.com/arcgis/rest/services/World/geoenrichmentserver/GeoEnrichment/enrich';
const ESRI_TOKEN_URL = 'https://www.arcgis.com/sharing/rest/oauth2/token';

// Token cache for OAuth 2.0
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Analysis variables for demographics
 * These map to ESRI's data collections
 */
export const ESRI_VARIABLES = {
  // Population
  TOTAL_POPULATION: 'KeyUSFacts.TOTPOP_CY',
  POPULATION_5YR: 'KeyUSFacts.TOTPOP_FY',
  POPULATION_GROWTH: 'KeyUSFacts.POPGRW_CY',
  
  // Households
  TOTAL_HOUSEHOLDS: 'KeyUSFacts.TOTHH_CY',
  HOUSEHOLDS_5YR: 'KeyUSFacts.TOTHH_FY',
  AVG_HOUSEHOLD_SIZE: 'KeyUSFacts.AVGHHSZ_CY',
  
  // Income
  MEDIAN_HOUSEHOLD_INCOME: 'KeyUSFacts.MEDHINC_CY',
  AVERAGE_HOUSEHOLD_INCOME: 'KeyUSFacts.AVGHINC_CY',
  PER_CAPITA_INCOME: 'KeyUSFacts.PCI_CY',
  
  // Education
  EDUCATION_BASE: 'educationalattainment.EDUCBASECY',
  BACHELORS_DEGREE: 'educationalattainment.BACHDEG_CY',
  GRADUATE_DEGREE: 'educationalattainment.GRADDEG_CY',
  
  // Employment
  CIVILIAN_LABOR_FORCE: 'KeyUSFacts.CIVLBFR_CY',
  UNEMPLOYMENT_RATE: 'KeyUSFacts.UNEMPRT_CY',
  UNEMPLOYED_COUNT: 'KeyUSFacts.UNEMPCNT_CY',
} as const;

/**
 * Industry employment variables (NAICS sectors)
 */
export const INDUSTRY_VARIABLES = {
  AGRICULTURE: 'industry.INDAGRI_CY',
  MINING: 'industry.INDMIN_CY',
  CONSTRUCTION: 'industry.INDCONS_CY',
  MANUFACTURING: 'industry.INDMANU_CY',
  WHOLESALE_TRADE: 'industry.INDTRADE_CY',
  RETAIL_TRADE: 'industry.INDRTRADE_CY',
  TRANSPORTATION: 'industry.INDTRANS_CY',
  INFORMATION: 'industry.INDINFO_CY',
  FINANCE_INSURANCE: 'industry.INDFIN_CY',
  REAL_ESTATE: 'industry.INDRE_CY',
  PROFESSIONAL_TECH: 'industry.INDTECH_CY',
  MANAGEMENT: 'industry.INDMGMT_CY',
  ADMINISTRATIVE: 'industry.INDADMIN_CY',
  EDUCATION: 'industry.INDEDUC_CY',
  HEALTHCARE: 'industry.INDHLTH_CY',
  ARTS_ENTERTAINMENT: 'industry.INDARTS_CY',
  FOOD_ACCOMMODATION: 'industry.INDFOOD_CY',
  OTHER_SERVICES: 'industry.INDOTSV_CY',
  PUBLIC_ADMIN: 'industry.INDPUB_CY',
} as const;

/**
 * Human-readable labels for industry codes
 */
export const INDUSTRY_LABELS: Record<string, string> = {
  INDAGRI_CY: 'Agriculture & Forestry',
  INDMIN_CY: 'Mining & Oil/Gas',
  INDCONS_CY: 'Construction',
  INDMANU_CY: 'Manufacturing',
  INDTRADE_CY: 'Wholesale Trade',
  INDRTRADE_CY: 'Retail Trade',
  INDTRANS_CY: 'Transportation & Warehousing',
  INDINFO_CY: 'Information',
  INDFIN_CY: 'Finance & Insurance',
  INDRE_CY: 'Real Estate',
  INDTECH_CY: 'Professional & Technical',
  INDMGMT_CY: 'Management',
  INDADMIN_CY: 'Administrative Services',
  INDEDUC_CY: 'Education Services',
  INDHLTH_CY: 'Healthcare & Social',
  INDARTS_CY: 'Arts & Entertainment',
  INDFOOD_CY: 'Accommodation & Food',
  INDOTSV_CY: 'Other Services',
  INDPUB_CY: 'Public Administration',
};

// =================================================================
// OAUTH 2.0 FUNCTIONS
// =================================================================

/**
 * Get OAuth 2.0 access token using client credentials flow
 * Tokens are cached until they expire (with 5 minute buffer)
 * 
 * @returns Promise resolving to access token string
 */
export async function getOAuthToken(): Promise<string> {
  const clientId = process.env.ESRI_CLIENT_ID;
  const clientSecret = process.env.ESRI_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('ESRI_CLIENT_ID and ESRI_CLIENT_SECRET must be configured');
  }

  // Check if we have a valid cached token (with 5 minute buffer)
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 300000) {
    console.log('Using cached ESRI OAuth token');
    return cachedToken.token;
  }

  console.log('Requesting new ESRI OAuth token...');

  // Request new token
  const formData = new URLSearchParams();
  formData.append('client_id', clientId);
  formData.append('client_secret', clientSecret);
  formData.append('grant_type', 'client_credentials');

  const response = await fetch(ESRI_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`ESRI OAuth error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as OAuthTokenResponse;

  if (data.error) {
    throw new Error(`ESRI OAuth error: ${data.error} - ${data.error_description}`);
  }

  if (!data.access_token) {
    throw new Error('ESRI OAuth response missing access_token');
  }

  // Cache the token
  cachedToken = {
    token: data.access_token,
    expiresAt: now + (data.expires_in * 1000), // expires_in is in seconds
  };

  console.log(`ESRI OAuth token obtained, expires in ${data.expires_in} seconds`);

  return data.access_token;
}

/**
 * Clear the cached OAuth token (useful for testing or forcing refresh)
 */
export function clearTokenCache(): void {
  cachedToken = null;
}

// =================================================================
// CONFIGURATION HELPERS
// =================================================================

/**
 * Check if ESRI is configured (either API Key or OAuth)
 */
export function isESRIConfigured(): boolean {
  // Check for API Key first
  if (process.env.ESRI_API_KEY) {
    return true;
  }
  // Check for OAuth credentials
  if (process.env.ESRI_CLIENT_ID && process.env.ESRI_CLIENT_SECRET) {
    return true;
  }
  return false;
}

/**
 * Get the authentication method being used
 */
export function getESRIAuthMethod(): 'api_key' | 'oauth' | 'none' {
  if (process.env.ESRI_API_KEY) {
    return 'api_key';
  }
  if (process.env.ESRI_CLIENT_ID && process.env.ESRI_CLIENT_SECRET) {
    return 'oauth';
  }
  return 'none';
}

/**
 * Get ESRI token (either API key or OAuth token)
 * 
 * @returns Promise resolving to token string
 */
export async function getESRIToken(): Promise<string> {
  // Prefer API Key if available (simpler, no token exchange needed)
  if (process.env.ESRI_API_KEY) {
    return process.env.ESRI_API_KEY;
  }

  // Fall back to OAuth
  if (process.env.ESRI_CLIENT_ID && process.env.ESRI_CLIENT_SECRET) {
    return await getOAuthToken();
  }

  throw new Error('No ESRI credentials configured. Set ESRI_API_KEY or ESRI_CLIENT_ID + ESRI_CLIENT_SECRET');
}

// Legacy function for backward compatibility
export function getESRIApiKey(): string | undefined {
  return process.env.ESRI_API_KEY;
}

// =================================================================
// API FUNCTIONS
// =================================================================

/**
 * Fetch demographics from ESRI GeoEnrichment API
 * 
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param radii - Array of radii in miles (default: [1, 3, 5])
 * @param token - ESRI token (API key or OAuth access token)
 * @returns Promise resolving to array of demographics for each radius
 */
export async function fetchGeoEnrichment(
  latitude: number,
  longitude: number,
  radii: number[] = [1, 3, 5],
  token: string
): Promise<ESRIDemographics[]> {
  // Build analysis variables array
  const analysisVariables = [
    ...Object.values(ESRI_VARIABLES),
    ...Object.values(INDUSTRY_VARIABLES),
  ];

  // Build study areas with ring buffers
  const studyAreas = [{
    geometry: {
      x: longitude,
      y: latitude,
      spatialReference: { wkid: 4326 }
    },
    areaType: 'RingBuffer',
    bufferUnits: 'esriMiles',
    bufferRadii: radii,
  }];

  // Build request body
  const formData = new URLSearchParams();
  formData.append('f', 'json');
  formData.append('token', token);
  formData.append('studyAreas', JSON.stringify(studyAreas));
  formData.append('analysisVariables', JSON.stringify(analysisVariables));
  formData.append('returnGeometry', 'false');
  formData.append('useData', JSON.stringify({
    sourceCountry: 'US',
  }));

  // Make API request
  const response = await fetch(ESRI_ENRICH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`ESRI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as ESRIEnrichResponse;

  // Check for API errors in response
  if (data.error) {
    throw new Error(`ESRI API error ${data.error.code}: ${data.error.message}`);
  }

  if (!data.results || data.results.length === 0) {
    throw new Error('ESRI API returned no results');
  }

  const featureSet = data.results[0]?.value?.FeatureSet?.[0];
  if (!featureSet || !featureSet.features) {
    throw new Error('ESRI API returned invalid feature set');
  }

  // Transform response to our format
  return transformESRIResponse(featureSet.features, radii);
}

/**
 * Transform ESRI API response to our demographics format
 * 
 * @param features - Array of feature objects from ESRI response
 * @param radii - Array of radii that were requested
 * @returns Array of ESRIDemographics objects
 */
export function transformESRIResponse(
  features: Array<{ attributes: Record<string, number | string> }>,
  radii: number[]
): ESRIDemographics[] {
  return features.map((feature, index) => {
    const attrs = feature.attributes;
    const radius = radii[index] || index + 1;

    // Get numeric value safely
    const getNum = (key: string): number => {
      const val = attrs[key];
      return typeof val === 'number' ? val : parseFloat(String(val)) || 0;
    };

    // Calculate education percentages
    const educBase = getNum('EDUCBASECY') || 1;
    const bachelors = getNum('BACHDEG_CY');
    const graduate = getNum('GRADDEG_CY');
    const percentCollege = ((bachelors + graduate) / educBase) * 100;
    const percentGrad = (graduate / educBase) * 100;

    // Build industry breakdown
    const industryData: Array<{ industry: string; percentage: number }> = [];
    let totalIndustry = 0;

    // First pass: calculate total
    for (const [code] of Object.entries(INDUSTRY_LABELS)) {
      totalIndustry += getNum(code);
    }

    // Second pass: calculate percentages
    for (const [code, label] of Object.entries(INDUSTRY_LABELS)) {
      const count = getNum(code);
      if (count > 0 && totalIndustry > 0) {
        industryData.push({
          industry: label,
          percentage: Math.round((count / totalIndustry) * 1000) / 10,
        });
      }
    }

    // Sort by percentage descending and take top 10
    industryData.sort((a, b) => b.percentage - a.percentage);
    const topIndustries = industryData.slice(0, 10);

    // Calculate population growth rate
    const popCurrent = getNum('TOTPOP_CY');
    const pop5Yr = getNum('TOTPOP_FY');
    const growthRate = popCurrent > 0 
      ? ((pop5Yr - popCurrent) / popCurrent) * 100 / 5  // Annual rate
      : 0;

    return {
      radius,
      population: {
        current: Math.round(getNum('TOTPOP_CY')),
        projected5Year: Math.round(getNum('TOTPOP_FY')),
        annualGrowthRate: Math.round(growthRate * 10) / 10,
      },
      households: {
        current: Math.round(getNum('TOTHH_CY')),
        projected5Year: Math.round(getNum('TOTHH_FY')),
        averageSize: Math.round(getNum('AVGHHSZ_CY') * 100) / 100,
      },
      income: {
        medianHousehold: Math.round(getNum('MEDHINC_CY')),
        averageHousehold: Math.round(getNum('AVGHINC_CY')),
        perCapita: Math.round(getNum('PCI_CY')),
      },
      education: {
        percentCollegeGraduates: Math.round(percentCollege * 10) / 10,
        percentGraduateDegree: Math.round(percentGrad * 10) / 10,
      },
      employment: {
        laborForce: Math.round(getNum('CIVLBFR_CY')),
        unemployed: Math.round(getNum('UNEMPCNT_CY')),
        unemploymentRate: Math.round(getNum('UNEMPRT_CY') * 10) / 10,
      },
      employmentByIndustry: topIndustries,
    };
  });
}
