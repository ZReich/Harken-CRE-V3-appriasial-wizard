/**
 * Economic Indicators Service
 * 
 * Provides economic indicator data from FRED API.
 * 100% portable - works with Vercel API Routes or Harken backend.
 */

import { apiGet } from './api';
import type { EconomicIndicatorsResponse, EconomicDataPoint } from '../types/api';

/**
 * Get current economic indicators
 * 
 * Returns Federal Funds Rate, 10-Year Treasury, Inflation (CPI), and GDP Growth
 * 
 * @returns Promise resolving to economic indicators data
 */
export async function getEconomicIndicators(): Promise<EconomicIndicatorsResponse> {
  return apiGet<EconomicIndicatorsResponse>('/economic/indicators');
}

/**
 * Format rate/percentage value
 * 
 * @param value - Rate value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "5.25%")
 */
export function formatRate(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate change between two values
 * 
 * @param current - Current value
 * @param previous - Previous value
 * @returns Change object with absolute and percentage change
 */
export function calculateChange(
  current: number,
  previous: number
): { absolute: number; percentage: number; direction: 'up' | 'down' | 'unchanged' } {
  const absolute = current - previous;
  const percentage = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
  const direction = absolute > 0.01 ? 'up' : absolute < -0.01 ? 'down' : 'unchanged';
  
  return { absolute, percentage, direction };
}

/**
 * Get trend description for an indicator
 * 
 * @param history - Historical data points
 * @returns Trend description string
 */
export function getTrend(history: EconomicDataPoint[]): 'rising' | 'falling' | 'stable' {
  if (history.length < 3) return 'stable';
  
  const recent = history.slice(0, 3);
  const older = history.slice(-3);
  
  const recentAvg = recent.reduce((sum, p) => sum + p.value, 0) / recent.length;
  const olderAvg = older.reduce((sum, p) => sum + p.value, 0) / older.length;
  
  const changePct = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  if (changePct > 5) return 'rising';
  if (changePct < -5) return 'falling';
  return 'stable';
}

/**
 * Create summary text for economic context
 * 
 * @param data - Economic indicators response
 * @returns Human-readable summary paragraph
 */
export function createEconomicSummary(data: EconomicIndicatorsResponse['data']): string {
  const { federalFundsRate, treasury10Y, inflation, gdpGrowth } = data;
  
  return `Current economic conditions show the Federal Funds Rate at ${formatRate(federalFundsRate.current)}, ` +
    `with the 10-Year Treasury yield at ${formatRate(treasury10Y.current)}. ` +
    `Year-over-year inflation stands at ${formatRate(inflation.current, 1)}, ` +
    `and GDP growth is ${formatRate(gdpGrowth.current, 1)}. ` +
    `These indicators inform cap rate analysis and investment risk assessment.`;
}


