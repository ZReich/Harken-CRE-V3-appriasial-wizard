/**
 * Risk Rating Service
 * 
 * Provides Investment Risk Rating ("Bond Rating for Buildings") calculation.
 * 100% portable - works with Vercel API Routes or Harken backend.
 */

import { apiPost } from './api';
import type { RiskRatingRequest, RiskRatingResponse } from '../types/api';

/**
 * Calculate Investment Risk Rating for a property
 * 
 * @param request - Property and market data for rating calculation
 * @returns Promise resolving to risk rating data
 */
export async function calculateRiskRating(
  request: RiskRatingRequest
): Promise<RiskRatingResponse> {
  return apiPost<RiskRatingResponse, RiskRatingRequest>(
    '/risk-rating/calculate',
    request
  );
}

/**
 * Risk grade color mapping for UI display
 */
export const GRADE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  AAA: { bg: 'bg-accent-teal-mint-light', text: 'text-accent-teal-mint', border: 'border-accent-teal-mint' },
  AA:  { bg: 'bg-accent-teal-mint-light', text: 'text-accent-teal-mint', border: 'border-accent-teal-mint' },
  A:   { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-400' },
  BBB: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-400' },
  BB:  { bg: 'bg-accent-amber-gold-light', text: 'text-accent-amber-gold', border: 'border-accent-amber-gold' },
  B:   { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-400' },
  CCC: { bg: 'bg-accent-red-light', text: 'text-harken-error', border: 'border-harken-error/20' },
  CC:  { bg: 'bg-accent-red-light', text: 'text-harken-error', border: 'border-harken-error' },
  C:   { bg: 'bg-harken-error/10', text: 'text-harken-error', border: 'border-harken-error' },
};

/**
 * Risk grade descriptions
 */
export const GRADE_DESCRIPTIONS: Record<string, { label: string; description: string }> = {
  AAA: { label: 'Institutional Grade', description: 'Exceptional quality with minimal risk' },
  AA:  { label: 'High Quality', description: 'Very low risk investment' },
  A:   { label: 'Upper Medium Grade', description: 'Good location and stable tenancy' },
  BBB: { label: 'Investment Grade', description: 'Moderate risk, market-correlated' },
  BB:  { label: 'Speculative', description: 'Below investment grade, transitional' },
  B:   { label: 'Highly Speculative', description: 'Significant deferred maintenance risk' },
  CCC: { label: 'Substantial Risk', description: 'Declining neighborhood or high vacancy' },
  CC:  { label: 'Extremely Speculative', description: 'Major physical or location issues' },
  C:   { label: 'Near Default Risk', description: 'Obsolete, condemned, or distressed' },
};

/**
 * Get display info for a risk grade
 * 
 * @param grade - Risk grade (AAA to C)
 * @returns Object with colors and descriptions
 */
export function getGradeDisplayInfo(grade: string) {
  return {
    colors: GRADE_COLORS[grade] || GRADE_COLORS.BBB,
    ...GRADE_DESCRIPTIONS[grade] || GRADE_DESCRIPTIONS.BBB,
  };
}

/**
 * Format dimension weight as percentage
 * 
 * @param weight - Weight value (0-1)
 * @returns Formatted percentage string
 */
export function formatWeight(weight: number): string {
  return `${Math.round(weight * 100)}%`;
}

/**
 * Create risk rating from wizard state
 * 
 * @param state - Wizard state with property data
 * @returns RiskRatingRequest object
 */
export function buildRiskRatingRequest(state: {
  propertyType?: string | null;
  subjectData?: {
    address?: { city?: string; state?: string };
  };
  incomeApproachData?: {
    capRate?: number;
  };
  improvementsInventory?: {
    buildings?: Array<{
      yearBuilt?: number;
      condition?: string;
    }>;
  };
}, coordinates: { latitude: number; longitude: number }): RiskRatingRequest {
  const building = state.improvementsInventory?.buildings?.[0];
  
  return {
    propertyType: state.propertyType || 'commercial',
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    isIncomeProducing: !!state.incomeApproachData,
    capRate: state.incomeApproachData?.capRate,
    yearBuilt: building?.yearBuilt,
    condition: building?.condition,
  };
}

/**
 * USPAP-compliant risk rating disclosure
 */
export const RISK_RATING_DISCLOSURE = `RISK RATING DISCLOSURE

The Investment Risk Rating presented in this report is a statistical model based on aggregated market data and is used as a supplementary risk analysis tool to support the appraiser's conclusions. This rating does not replace the appraiser's value conclusion or professional judgment.

The risk rating methodology incorporates data from multiple sources including federal economic indicators, property records, demographic data, and market statistics. The appraiser has reviewed the model inputs and outputs and determined them to be reasonable for this analysis.

This rating is provided for informational purposes and should be considered alongside the complete appraisal analysis contained in this report.`;


