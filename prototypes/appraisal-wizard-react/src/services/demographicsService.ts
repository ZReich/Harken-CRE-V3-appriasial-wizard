/**
 * Demographics Service
 * 
 * Provides radius-based demographic data from Census Bureau.
 * 100% portable - works with Vercel API Routes or Harken backend.
 */

import { apiPost } from './api';
import type { DemographicsRequest, DemographicsResponse, RadiusDemographics } from '../types/api';

/**
 * Get demographic data for radius rings around a location
 * 
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param radii - Array of radii in miles (default: [1, 3, 5])
 * @returns Promise resolving to demographics data for each radius
 */
export async function getDemographicsByRadius(
  latitude: number,
  longitude: number,
  radii: number[] = [1, 3, 5]
): Promise<DemographicsResponse> {
  const request: DemographicsRequest = {
    latitude,
    longitude,
    radii,
  };

  return apiPost<DemographicsResponse, DemographicsRequest>(
    '/demographics/radius',
    request
  );
}

/**
 * Format population number with thousands separator
 * 
 * @param value - Number to format
 * @returns Formatted string (e.g., "12,345")
 */
export function formatPopulation(value: number): string {
  return value.toLocaleString('en-US');
}

/**
 * Format currency value
 * 
 * @param value - Dollar amount
 * @returns Formatted string (e.g., "$67,890")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage value
 * 
 * @param value - Percentage value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "45.2%")
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Create summary text from demographics data
 * 
 * @param data - Demographics data for a single radius
 * @returns Human-readable summary
 */
export function createDemographicsSummary(data: RadiusDemographics): string {
  const { radius, population, income, education } = data;
  
  return `Within a ${radius}-mile radius, the population is ${formatPopulation(population.current)} ` +
    `with a median household income of ${formatCurrency(income.medianHousehold)}. ` +
    `Approximately ${formatPercentage(education.percentCollegeGraduates)} of residents ` +
    `hold a bachelor's degree or higher.`;
}


