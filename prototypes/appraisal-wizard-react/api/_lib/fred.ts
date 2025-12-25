/**
 * FRED API Wrapper
 * 
 * Provides access to Federal Reserve Economic Data (FRED) API.
 * Used for economic indicators: Federal Funds Rate, Treasury Yields, CPI, GDP.
 * 
 * API Documentation: https://fred.stlouisfed.org/docs/api/fred/
 * 100% portable - can be copied directly to Harken backend.
 */

const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

// =================================================================
// TYPES
// =================================================================

export interface FredObservation {
  date: string;
  value: number;
}

export interface FredSeriesResponse {
  observations: FredObservation[];
  seriesId: string;
  title?: string;
}

// =================================================================
// SERIES IDS
// =================================================================

export const FRED_SERIES = {
  FEDERAL_FUNDS_RATE: 'FEDFUNDS',    // Federal Funds Effective Rate
  TREASURY_10Y: 'DGS10',              // 10-Year Treasury Constant Maturity Rate
  CPI: 'CPIAUCSL',                    // Consumer Price Index for All Urban Consumers
  GDP: 'GDP',                          // Gross Domestic Product
  UNEMPLOYMENT: 'UNRATE',              // Unemployment Rate
  MORTGAGE_30Y: 'MORTGAGE30US',        // 30-Year Fixed Rate Mortgage Average
} as const;

// =================================================================
// API FUNCTIONS
// =================================================================

/**
 * Fetch data for a specific FRED series
 * 
 * @param seriesId - The FRED series ID (e.g., 'FEDFUNDS')
 * @param observationCount - Number of observations to fetch (default: 12)
 * @param frequency - Data frequency: 'd' (daily), 'm' (monthly), 'q' (quarterly), 'a' (annual)
 * @returns Promise resolving to FredSeriesResponse
 */
export async function getFredData(
  seriesId: string,
  observationCount: number = 12,
  frequency?: 'd' | 'm' | 'q' | 'a'
): Promise<FredSeriesResponse> {
  const apiKey = process.env.FRED_API_KEY;
  
  if (!apiKey) {
    throw new Error('FRED_API_KEY environment variable is not configured');
  }

  const url = new URL(`${FRED_BASE_URL}/series/observations`);
  url.searchParams.set('series_id', seriesId);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('file_type', 'json');
  url.searchParams.set('sort_order', 'desc');
  url.searchParams.set('limit', String(observationCount));
  
  if (frequency) {
    url.searchParams.set('frequency', frequency);
  }

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`FRED API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as { 
    observations?: Array<{ date: string; value: string }>;
    title?: string;
  };

  // Parse observations, filtering out missing values
  const observations: FredObservation[] = (data.observations || [])
    .filter((obs) => obs.value !== '.')
    .map((obs) => ({
      date: obs.date,
      value: parseFloat(obs.value),
    }));

  return {
    observations,
    seriesId,
    title: data.title,
  };
}

/**
 * Fetch multiple FRED series in parallel
 * 
 * @param seriesIds - Array of FRED series IDs
 * @param observationCount - Number of observations per series
 * @returns Promise resolving to map of seriesId -> FredSeriesResponse
 */
export async function getMultipleFredSeries(
  seriesIds: string[],
  observationCount: number = 12
): Promise<Record<string, FredSeriesResponse>> {
  const results = await Promise.all(
    seriesIds.map(id => getFredData(id, observationCount))
  );

  return results.reduce((acc, result) => {
    acc[result.seriesId] = result;
    return acc;
  }, {} as Record<string, FredSeriesResponse>);
}

/**
 * Get the current (most recent) value for a FRED series
 * 
 * @param seriesId - The FRED series ID
 * @returns Promise resolving to the current value
 */
export async function getCurrentFredValue(seriesId: string): Promise<number> {
  const data = await getFredData(seriesId, 1);
  
  if (!data.observations.length) {
    throw new Error(`No data available for series ${seriesId}`);
  }
  
  return data.observations[0].value;
}

/**
 * Get the current 10-Year Treasury rate (risk-free rate for real estate)
 * 
 * @returns Promise resolving to the current 10-Year Treasury rate
 */
export async function getTreasuryRate(): Promise<number> {
  return getCurrentFredValue(FRED_SERIES.TREASURY_10Y);
}


