/**
 * Risk Rating Engine
 * 
 * Calculates a "Bond Rating for Buildings" using dynamic weighting.
 * This is the core algorithm for the Investment Risk Rating System.
 * 
 * 100% portable - pure TypeScript with no framework dependencies.
 * Can be copied directly to Harken backend.
 */

import type { RiskInputs, RiskOutput, RiskDimensionScore } from './types.js';

// =================================================================
// RATING SCALE
// =================================================================

export type RiskGrade = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'CC' | 'C';

const GRADE_THRESHOLDS: Array<{ min: number; grade: RiskGrade }> = [
  { min: 95, grade: 'AAA' },
  { min: 90, grade: 'AA' },
  { min: 80, grade: 'A' },
  { min: 70, grade: 'BBB' },
  { min: 60, grade: 'BB' },
  { min: 50, grade: 'B' },
  { min: 40, grade: 'CCC' },
  { min: 30, grade: 'CC' },
  { min: 0, grade: 'C' },
];

// =================================================================
// BASE WEIGHTS BY PROPERTY TYPE
// =================================================================

interface BaseWeights {
  marketVolatility: number;
  liquidity: number;
  incomeStability: number;
  assetQuality: number;
}

const BASE_WEIGHTS: Record<string, BaseWeights> = {
  multifamily:  { marketVolatility: 0.25, liquidity: 0.25, incomeStability: 0.35, assetQuality: 0.15 },
  office:       { marketVolatility: 0.30, liquidity: 0.25, incomeStability: 0.30, assetQuality: 0.15 },
  retail:       { marketVolatility: 0.30, liquidity: 0.30, incomeStability: 0.25, assetQuality: 0.15 },
  industrial:   { marketVolatility: 0.25, liquidity: 0.30, incomeStability: 0.30, assetQuality: 0.15 },
  hospitality:  { marketVolatility: 0.35, liquidity: 0.25, incomeStability: 0.25, assetQuality: 0.15 },
  land:         { marketVolatility: 0.40, liquidity: 0.35, incomeStability: 0.05, assetQuality: 0.20 },
  residential:  { marketVolatility: 0.30, liquidity: 0.30, incomeStability: 0.10, assetQuality: 0.30 },
  mixed_use:    { marketVolatility: 0.28, liquidity: 0.27, incomeStability: 0.28, assetQuality: 0.17 },
  special:      { marketVolatility: 0.35, liquidity: 0.30, incomeStability: 0.20, assetQuality: 0.15 },
};

// Default weights for unknown property types
const DEFAULT_WEIGHTS: BaseWeights = {
  marketVolatility: 0.25,
  liquidity: 0.25,
  incomeStability: 0.25,
  assetQuality: 0.25,
};

// =================================================================
// CORE CALCULATION FUNCTIONS
// =================================================================

/**
 * Calculate dynamic weights based on property characteristics
 */
function calculateDynamicWeights(inputs: RiskInputs): BaseWeights {
  // Get base weights for property type
  const propertyTypeKey = inputs.propertyType.toLowerCase().replace(/\s+/g, '_');
  const baseWeights = BASE_WEIGHTS[propertyTypeKey] || DEFAULT_WEIGHTS;
  
  // Create mutable copy
  const weights = { ...baseWeights };
  
  // Adjust for income-producing vs non-income properties
  if (!inputs.isIncomeProducing) {
    weights.incomeStability *= 0.5;
    weights.assetQuality *= 1.3;
    weights.marketVolatility *= 1.1;
  }
  
  // Normalize weights to sum to 1.0
  const total = weights.marketVolatility + weights.liquidity + 
                weights.incomeStability + weights.assetQuality;
  
  return {
    marketVolatility: weights.marketVolatility / total,
    liquidity: weights.liquidity / total,
    incomeStability: weights.incomeStability / total,
    assetQuality: weights.assetQuality / total,
  };
}

/**
 * Calculate Market Volatility Score (Beta)
 * Higher score = lower volatility = better
 */
function calculateMarketVolatilityScore(inputs: RiskInputs): number {
  // Without historical price data, use property type proxies
  const volatilityByType: Record<string, number> = {
    multifamily: 75,   // Lower volatility
    industrial: 72,
    office: 65,
    retail: 60,
    hospitality: 50,   // Higher volatility
    land: 45,
    special: 55,
  };
  
  const typeKey = inputs.propertyType.toLowerCase().replace(/\s+/g, '_');
  return volatilityByType[typeKey] || 65;
}

/**
 * Calculate Liquidity Score
 * Based on Days on Market - lower DOM = higher score
 */
function calculateLiquidityScore(inputs: RiskInputs): number {
  if (inputs.daysOnMarket === undefined || inputs.daysOnMarket === null) {
    return 60; // Default when DOM not available
  }
  
  const dom = inputs.daysOnMarket;
  
  if (dom < 30) return 95;
  if (dom < 45) return 88;
  if (dom < 60) return 80;
  if (dom < 90) return 70;
  if (dom < 120) return 60;
  if (dom < 180) return 50;
  if (dom < 270) return 40;
  return 30;
}

/**
 * Calculate Income Stability Score (Yield Spread)
 * Based on Cap Rate vs Risk-Free Rate
 */
function calculateIncomeStabilityScore(inputs: RiskInputs): number {
  if (!inputs.isIncomeProducing) {
    return 50; // Neutral for non-income properties
  }
  
  if (inputs.capRate === undefined || inputs.treasuryRate === undefined) {
    return 60; // Default when rates not available
  }
  
  // Yield spread: Cap Rate - Risk-Free Rate
  const yieldSpread = inputs.capRate - inputs.treasuryRate;
  
  // Lower spread = more stable (like a bond), but too low might indicate overpriced
  // Sweet spot is 150-350 bps spread
  
  if (yieldSpread < 1.0) return 70;  // Very tight spread - potentially overpriced
  if (yieldSpread < 1.5) return 85;  // Core asset
  if (yieldSpread < 2.5) return 90;  // Core-plus
  if (yieldSpread < 3.5) return 85;  // Value-add
  if (yieldSpread < 4.5) return 75;  // Value-add with more risk
  if (yieldSpread < 5.5) return 65;  // Opportunistic
  if (yieldSpread < 7.0) return 55;  // High risk
  return 45;  // Very high risk
}

/**
 * Calculate Asset Quality Score
 * Based on age, condition, and location factors
 */
function calculateAssetQualityScore(inputs: RiskInputs): number {
  let score = 70; // Base score
  
  // Age factor
  if (inputs.yearBuilt) {
    const age = new Date().getFullYear() - inputs.yearBuilt;
    
    if (age < 5) score += 15;        // New construction
    else if (age < 10) score += 12;
    else if (age < 20) score += 8;
    else if (age < 30) score += 3;
    else if (age < 40) score -= 2;
    else if (age < 50) score -= 8;
    else score -= 12;                 // Very old
  }
  
  // Condition factor
  if (inputs.condition) {
    const conditionBonus: Record<string, number> = {
      excellent: 12,
      'very good': 8,
      good: 4,
      average: 0,
      fair: -8,
      poor: -15,
    };
    const conditionKey = inputs.condition.toLowerCase();
    score += conditionBonus[conditionKey] || 0;
  }
  
  // School rating factor (if available)
  if (inputs.schoolRating !== undefined && inputs.schoolRating !== null) {
    // 1-10 scale, 5 is neutral
    score += (inputs.schoolRating - 5) * 2;
  }
  
  // Crime score factor (if available) - higher crime = lower score
  if (inputs.crimeScore !== undefined && inputs.crimeScore !== null) {
    // Assume crimeScore is 0-100, where lower is better
    score -= (inputs.crimeScore - 50) * 0.3;
  }
  
  // Clamp to valid range
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Convert numeric score to letter grade
 */
function scoreToGrade(score: number): RiskGrade {
  for (const threshold of GRADE_THRESHOLDS) {
    if (score >= threshold.min) {
      return threshold.grade;
    }
  }
  return 'C';
}

/**
 * Build weighting rationale explanation
 */
function buildWeightingRationale(inputs: RiskInputs, weights: BaseWeights): string {
  const parts: string[] = [];
  
  parts.push(`Property type: ${inputs.propertyType}`);
  parts.push(`Income-producing: ${inputs.isIncomeProducing ? 'Yes' : 'No'}`);
  
  if (!inputs.isIncomeProducing) {
    parts.push('Income stability weight reduced for non-income property');
    parts.push('Asset quality weight increased');
  }
  
  // Identify the highest weight
  const maxWeight = Math.max(
    weights.marketVolatility,
    weights.liquidity,
    weights.incomeStability,
    weights.assetQuality
  );
  
  if (maxWeight === weights.incomeStability) {
    parts.push('Income stability is primary driver for this property type');
  } else if (maxWeight === weights.marketVolatility) {
    parts.push('Market volatility is primary driver due to asset type');
  } else if (maxWeight === weights.liquidity) {
    parts.push('Liquidity is emphasized for this property type');
  }
  
  return parts.join('. ') + '.';
}

// =================================================================
// MAIN CALCULATION FUNCTION
// =================================================================

/**
 * Calculate the complete risk rating for a property
 * 
 * @param inputs - Property characteristics and market data
 * @returns Complete risk rating with score, grade, and dimension breakdown
 */
export function calculateRiskRating(inputs: RiskInputs): RiskOutput {
  // Calculate dynamic weights
  const weights = calculateDynamicWeights(inputs);
  
  // Calculate dimension scores
  const marketVolatilityScore = calculateMarketVolatilityScore(inputs);
  const liquidityScore = calculateLiquidityScore(inputs);
  const incomeStabilityScore = calculateIncomeStabilityScore(inputs);
  const assetQualityScore = calculateAssetQualityScore(inputs);
  
  // Calculate weighted overall score
  const overallScore = Math.round(
    marketVolatilityScore * weights.marketVolatility +
    liquidityScore * weights.liquidity +
    incomeStabilityScore * weights.incomeStability +
    assetQualityScore * weights.assetQuality
  );
  
  // Build output
  return {
    overallGrade: scoreToGrade(overallScore),
    overallScore,
    dimensions: {
      marketVolatility: {
        score: marketVolatilityScore,
        weight: Math.round(weights.marketVolatility * 100) / 100,
      },
      liquidity: {
        score: liquidityScore,
        weight: Math.round(weights.liquidity * 100) / 100,
      },
      incomeStability: {
        score: incomeStabilityScore,
        weight: Math.round(weights.incomeStability * 100) / 100,
      },
      assetQuality: {
        score: assetQualityScore,
        weight: Math.round(weights.assetQuality * 100) / 100,
      },
    },
    weightingRationale: buildWeightingRationale(inputs, weights),
  };
}

/**
 * Get USPAP-compliant disclosure for risk rating
 */
export function getRiskRatingDisclosure(): string {
  return `RISK RATING DISCLOSURE

The Investment Risk Rating presented in this report is a statistical model based on aggregated market data and is used as a supplementary risk analysis tool to support the appraiser's conclusions. This rating does not replace the appraiser's value conclusion or professional judgment.

The risk rating methodology incorporates data from multiple sources including federal economic indicators, property records, demographic data, and market statistics. The appraiser has reviewed the model inputs and outputs and determined them to be reasonable for this analysis.

This rating is provided for informational purposes and should be considered alongside the complete appraisal analysis contained in this report.`;
}


