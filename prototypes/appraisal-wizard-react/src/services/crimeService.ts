/**
 * Crime Statistics Service
 * 
 * Provides crime data from Crimeometer API.
 * Currently using mock data until API subscription is active.
 * 
 * 100% portable - works with Vercel API Routes or Harken backend.
 */

// Toggle when Crimeometer API becomes available
const USE_MOCK_DATA = true;

export interface CrimeStatistics {
  violentCrimeRate: number; // per 100,000 population
  propertyCrimeRate: number; // per 100,000 population
  totalCrimeIndex: number; // 0-100 scale (100 = safest)
  nationalComparison: 'below_average' | 'average' | 'above_average';
  stateComparison: 'below_average' | 'average' | 'above_average';
  yearOverYearChange: number; // percentage
  lastUpdated: string;
}

export interface CrimeResponse {
  success: boolean;
  data: CrimeStatistics | null;
  source: 'crimeometer' | 'mock';
  error?: string;
}

/**
 * Generate mock crime data based on location
 */
function generateMockCrimeData(latitude: number, longitude: number): CrimeStatistics {
  // Deterministic generation based on coordinates
  const seed = Math.abs(Math.floor(latitude * 100 + longitude * 10));
  
  // Generate realistic ranges
  const violentCrimeRate = 200 + (seed % 300); // 200-500 range (national avg ~380)
  const propertyCrimeRate = 1500 + (seed % 1500); // 1500-3000 range (national avg ~2100)
  
  // Total crime index (inverse - higher is safer)
  const totalCrimeIndex = Math.max(10, 100 - ((violentCrimeRate / 10) + (propertyCrimeRate / 50)));
  
  // Comparisons
  const nationalComparison = violentCrimeRate < 350 ? 'below_average' : 
                             violentCrimeRate < 450 ? 'average' : 'above_average';
  const stateComparison = violentCrimeRate < 300 ? 'below_average' :
                          violentCrimeRate < 400 ? 'average' : 'above_average';
  
  // Year over year change (-15% to +15%)
  const yearOverYearChange = ((seed % 30) - 15);
  
  return {
    violentCrimeRate,
    propertyCrimeRate,
    totalCrimeIndex: Math.round(totalCrimeIndex),
    nationalComparison,
    stateComparison,
    yearOverYearChange,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Get crime statistics for a location
 * 
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 */
export async function getCrimeStatistics(
  latitude: number,
  longitude: number
): Promise<CrimeResponse> {
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 250));
    
    return {
      success: true,
      data: generateMockCrimeData(latitude, longitude),
      source: 'mock',
    };
  }
  
  // TODO: Implement actual Crimeometer API call when available
  return {
    success: false,
    data: null,
    source: 'crimeometer',
    error: 'Crimeometer API not yet configured',
  };
}

/**
 * Get crime safety score for risk rating (0-100, higher = safer)
 */
export function getCrimeSafetyScore(stats: CrimeStatistics | null): number {
  if (!stats) return 50; // Neutral if no data
  return stats.totalCrimeIndex;
}

/**
 * Format crime comparison for display
 */
export function formatCrimeComparison(comparison: string): string {
  switch (comparison) {
    case 'below_average': return 'Below Average (Safer)';
    case 'above_average': return 'Above Average (Higher Crime)';
    default: return 'Average';
  }
}

