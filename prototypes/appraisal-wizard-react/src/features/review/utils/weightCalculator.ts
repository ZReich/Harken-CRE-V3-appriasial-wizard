// =================================================================
// AI WEIGHT CALCULATION ALGORITHM
// =================================================================
// This module calculates suggested reconciliation weights based on:
// 1. Property Type Base Weights (40% influence)
// 2. Data Quality Scores (40% influence)
// 3. Scenario Type Modifiers (20% influence)

import type { IncomeApproachState } from '../../income-approach/types';
import type { ImprovementsInventory } from '../../../types';

// =================================================================
// TYPES
// =================================================================

export interface SalesComparisonData {
  comparables?: Array<{
    id: string;
    saleDate?: string;
    netAdjustment?: number;
    grossAdjustment?: number;
  }>;
  averageNetAdjustment?: number;
  averageGrossAdjustment?: number;
}

export interface CostApproachData {
  landValue?: number;
  improvementCost?: number;
  depreciation?: number;
  totalValue?: number;
}

export interface WeightCalculationResult {
  weights: Record<string, number>;
  explanations: Record<string, WeightExplanation>;
  qualityScores: Record<string, number>;
}

export interface WeightExplanation {
  baseWeight: number;
  qualityScore: number;
  qualityFactors: string[];
  scenarioModifier: number;
  scenarioReason: string;
  recommendation: 'primary' | 'secondary' | 'supporting';
}

// =================================================================
// PROPERTY TYPE BASE WEIGHTS
// =================================================================

const PROPERTY_TYPE_BASE_WEIGHTS: Record<string, Record<string, number>> = {
  // Commercial office/retail - income-driven
  commercial: {
    'Sales Comparison': 30,
    'Income Approach': 55,
    'Cost Approach': 15,
    'Land Valuation': 0,
    'Multi-Family Approach': 0,
  },
  // Industrial - balanced sales and income
  industrial: {
    'Sales Comparison': 40,
    'Income Approach': 45,
    'Cost Approach': 15,
    'Land Valuation': 0,
    'Multi-Family Approach': 0,
  },
  // Multi-family - heavily income-driven
  multifamily: {
    'Sales Comparison': 25,
    'Income Approach': 60,
    'Cost Approach': 15,
    'Land Valuation': 0,
    'Multi-Family Approach': 60,
  },
  // Special purpose - cost-driven (churches, schools, etc.)
  special_purpose: {
    'Sales Comparison': 15,
    'Income Approach': 20,
    'Cost Approach': 65,
    'Land Valuation': 0,
    'Multi-Family Approach': 0,
  },
  // Residential - sales-driven
  residential: {
    'Sales Comparison': 70,
    'Income Approach': 0,
    'Cost Approach': 30,
    'Land Valuation': 0,
    'Multi-Family Approach': 0,
  },
  // Land - land valuation only
  land: {
    'Sales Comparison': 0,
    'Income Approach': 0,
    'Cost Approach': 0,
    'Land Valuation': 100,
    'Multi-Family Approach': 0,
  },
};

// =================================================================
// SCENARIO TYPE MODIFIERS
// =================================================================

const SCENARIO_MODIFIERS: Record<string, Record<string, { modifier: number; reason: string }>> = {
  'As Is': {
    'Sales Comparison': { modifier: 0, reason: 'Current market conditions' },
    'Income Approach': { modifier: 0, reason: 'Current income stream' },
    'Cost Approach': { modifier: 0, reason: 'Current replacement cost' },
    'Land Valuation': { modifier: 0, reason: 'Current land value' },
    'Multi-Family Approach': { modifier: 0, reason: 'Current rental rates' },
  },
  'As Completed': {
    'Sales Comparison': { modifier: -10, reason: 'Limited comparables for proposed improvements' },
    'Income Approach': { modifier: -5, reason: 'Projected income upon completion' },
    'Cost Approach': { modifier: 25, reason: 'New construction - cost highly relevant' },
    'Land Valuation': { modifier: 10, reason: 'Land component of development' },
    'Multi-Family Approach': { modifier: -5, reason: 'Projected rental rates' },
  },
  'As Stabilized': {
    'Sales Comparison': { modifier: -15, reason: 'Forward-looking stabilized value' },
    'Income Approach': { modifier: 30, reason: 'Stabilized income projection critical' },
    'Cost Approach': { modifier: -15, reason: 'Less relevant for stabilized operations' },
    'Land Valuation': { modifier: -20, reason: 'Improved property value focus' },
    'Multi-Family Approach': { modifier: 20, reason: 'Stabilized rental income' },
  },
  'As Proposed': {
    'Sales Comparison': { modifier: -20, reason: 'No existing improvements to compare' },
    'Income Approach': { modifier: 0, reason: 'Projected income upon development' },
    'Cost Approach': { modifier: 35, reason: 'Development cost is primary indicator' },
    'Land Valuation': { modifier: 15, reason: 'Land value as development basis' },
    'Multi-Family Approach': { modifier: 0, reason: 'Projected rental rates' },
  },
};

// =================================================================
// QUALITY SCORE CALCULATIONS
// =================================================================

/**
 * Calculate quality score for Sales Comparison Approach (0-100)
 */
export function calculateSalesQualityScore(salesData?: SalesComparisonData): number {
  if (!salesData) return 50; // Default moderate score if no data
  
  let score = 0;
  const factors: string[] = [];
  
  // A. Number of comparables (max 30 points)
  const compCount = salesData.comparables?.length || 0;
  if (compCount >= 5) {
    score += 30;
    factors.push(`${compCount} comparables (excellent)`);
  } else if (compCount >= 3) {
    score += 25;
    factors.push(`${compCount} comparables (good)`);
  } else if (compCount >= 2) {
    score += 15;
    factors.push(`${compCount} comparables (adequate)`);
  } else if (compCount >= 1) {
    score += 5;
    factors.push(`${compCount} comparable (limited)`);
  } else {
    factors.push('No comparables available');
  }
  
  // B. Average net adjustment percentage (max 35 points)
  const avgNetAdj = salesData.averageNetAdjustment ?? 
    calculateAverageAdjustment(salesData.comparables, 'netAdjustment');
  
  if (avgNetAdj <= 10) {
    score += 35;
    factors.push(`Net adjustments ${avgNetAdj.toFixed(1)}% (excellent)`);
  } else if (avgNetAdj <= 15) {
    score += 28;
    factors.push(`Net adjustments ${avgNetAdj.toFixed(1)}% (good)`);
  } else if (avgNetAdj <= 25) {
    score += 18;
    factors.push(`Net adjustments ${avgNetAdj.toFixed(1)}% (acceptable)`);
  } else if (avgNetAdj <= 35) {
    score += 8;
    factors.push(`Net adjustments ${avgNetAdj.toFixed(1)}% (marginal)`);
  } else {
    factors.push(`Net adjustments ${avgNetAdj.toFixed(1)}% (high - less reliable)`);
  }
  
  // C. Gross adjustment check (max 20 points)
  const avgGrossAdj = salesData.averageGrossAdjustment ?? 
    calculateAverageAdjustment(salesData.comparables, 'grossAdjustment');
  
  if (avgGrossAdj <= 25) {
    score += 20;
  } else if (avgGrossAdj <= 35) {
    score += 12;
  } else if (avgGrossAdj <= 50) {
    score += 5;
  }
  
  // D. Sale recency (max 15 points)
  const avgMonthsOld = calculateAverageSaleAge(salesData.comparables);
  if (avgMonthsOld <= 6) {
    score += 15;
    factors.push('Recent sales data (<6 months)');
  } else if (avgMonthsOld <= 12) {
    score += 12;
    factors.push('Sales data 6-12 months old');
  } else if (avgMonthsOld <= 24) {
    score += 6;
    factors.push('Sales data 12-24 months old');
  } else {
    factors.push('Sales data >24 months old');
  }
  
  return Math.min(100, score);
}

/**
 * Calculate quality score for Income Approach (0-100)
 */
export function calculateIncomeQualityScore(incomeData?: IncomeApproachState | null): number {
  if (!incomeData) return 50; // Default moderate score if no data
  
  let score = 0;
  const factors: string[] = [];
  
  // A. NOI data source (max 30 points)
  const hasActualLeases = (incomeData.incomeData?.rentalIncome?.length ?? 0) > 0;
  if (hasActualLeases) {
    score += 30;
    factors.push('Actual lease data available');
  } else {
    score += 15;
    factors.push('Pro forma income estimates');
  }
  
  // B. Cap rate data (max 25 points)
  const hasCapRate = (incomeData.valuationData?.marketCapRate ?? 0) > 0;
  if (hasCapRate) {
    score += 25;
    factors.push('Market-derived cap rate');
  } else {
    factors.push('Cap rate not specified');
  }
  
  // C. Direct Cap vs DCF variance (max 25 points)
  const directCapValue = calculateDirectCapValue(incomeData);
  const dcfValue = calculateDCFValue(incomeData);
  
  if (directCapValue > 0 && dcfValue > 0) {
    const variance = Math.abs(directCapValue - dcfValue) / directCapValue;
    
    if (variance <= 0.05) {
      score += 25;
      factors.push(`Direct Cap/DCF variance ${(variance * 100).toFixed(1)}% (excellent agreement)`);
    } else if (variance <= 0.10) {
      score += 18;
      factors.push(`Direct Cap/DCF variance ${(variance * 100).toFixed(1)}% (good agreement)`);
    } else if (variance <= 0.15) {
      score += 10;
      factors.push(`Direct Cap/DCF variance ${(variance * 100).toFixed(1)}% (acceptable)`);
    } else {
      factors.push(`Direct Cap/DCF variance ${(variance * 100).toFixed(1)}% (methods diverge)`);
    }
  }
  
  // D. Expense data quality (max 20 points)
  const hasExpenses = (incomeData.expenseData?.expenses?.length ?? 0) > 0;
  if (hasExpenses) {
    score += 20;
    factors.push('Complete expense data');
  } else {
    score += 8;
    factors.push('Limited expense data');
  }
  
  return Math.min(100, score);
}

/**
 * Calculate quality score for Cost Approach (0-100)
 */
export function calculateCostQualityScore(
  costData?: CostApproachData,
  improvements?: ImprovementsInventory
): number {
  let score = 0;
  const factors: string[] = [];
  
  // A. Improvement age - newer = more reliable cost approach (max 40 points)
  const effectiveAge = improvements?.parcels?.[0]?.buildings?.[0]?.effectiveAge ?? 50;
  
  if (effectiveAge <= 5) {
    score += 40;
    factors.push('New construction (<5 years)');
  } else if (effectiveAge <= 10) {
    score += 32;
    factors.push('Recent construction (5-10 years)');
  } else if (effectiveAge <= 20) {
    score += 20;
    factors.push('Moderate age (10-20 years)');
  } else if (effectiveAge <= 30) {
    score += 10;
    factors.push('Older improvements (20-30 years)');
  } else {
    factors.push('Significant age (>30 years) - depreciation complex');
  }
  
  // B. Construction type - standard types more reliable (max 30 points)
  const constructionQuality = improvements?.parcels?.[0]?.buildings?.[0]?.constructionQuality;
  if (constructionQuality && ['A', 'B', 'C'].includes(constructionQuality)) {
    score += 30;
    factors.push(`Class ${constructionQuality} construction (standard)`);
  } else if (constructionQuality === 'D') {
    score += 20;
    factors.push('Class D construction');
  } else {
    score += 10;
    factors.push('Non-standard/special construction');
  }
  
  // C. Land value reliability (max 30 points)
  const hasLandValue = (costData?.landValue ?? 0) > 0;
  if (hasLandValue) {
    score += 30;
    factors.push('Land value established');
  } else {
    score += 10;
    factors.push('Land value not specified');
  }
  
  return Math.min(100, score);
}

// =================================================================
// HELPER FUNCTIONS
// =================================================================

function calculateAverageAdjustment(
  comparables?: Array<{ netAdjustment?: number; grossAdjustment?: number }>,
  field: 'netAdjustment' | 'grossAdjustment' = 'netAdjustment'
): number {
  if (!comparables || comparables.length === 0) return 20; // Default moderate
  
  const values = comparables
    .map(c => Math.abs(c[field] ?? 0))
    .filter(v => v > 0);
  
  if (values.length === 0) return 20;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function calculateAverageSaleAge(
  comparables?: Array<{ saleDate?: string }>
): number {
  if (!comparables || comparables.length === 0) return 12; // Default 12 months
  
  const now = new Date();
  const ages = comparables
    .filter(c => c.saleDate)
    .map(c => {
      const saleDate = new Date(c.saleDate!);
      const diffTime = Math.abs(now.getTime() - saleDate.getTime());
      return diffTime / (1000 * 60 * 60 * 24 * 30); // months
    });
  
  if (ages.length === 0) return 12;
  return ages.reduce((sum, a) => sum + a, 0) / ages.length;
}

function calculateDirectCapValue(incomeData?: IncomeApproachState | null): number {
  if (!incomeData?.valuationData?.marketCapRate) return 0;
  
  // Calculate NOI from income data
  const rentalIncome = incomeData.incomeData?.rentalIncome?.reduce(
    (sum, item) => sum + (item.amount || 0), 0
  ) ?? 0;
  const reimbursements = incomeData.incomeData?.expenseReimbursements?.reduce(
    (sum, item) => sum + (item.amount || 0), 0
  ) ?? 0;
  const otherIncome = incomeData.incomeData?.otherIncome?.reduce(
    (sum, item) => sum + (item.amount || 0), 0
  ) ?? 0;
  const expenses = incomeData.expenseData?.expenses?.reduce(
    (sum, item) => sum + (item.amount || 0), 0
  ) ?? 0;
  const vacancyRate = incomeData.incomeData?.vacancyRate ?? 5;
  
  const pgi = rentalIncome + reimbursements + otherIncome;
  const egi = pgi * (1 - vacancyRate / 100);
  const noi = egi - expenses;
  
  if (noi <= 0 || incomeData.valuationData.marketCapRate <= 0) return 0;
  return noi / (incomeData.valuationData.marketCapRate / 100);
}

function calculateDCFValue(incomeData?: IncomeApproachState | null): number {
  if (!incomeData?.valuationData) return 0;
  
  const { holdingPeriod, annualGrowthRate, discountRate, terminalCapRate } = incomeData.valuationData;
  
  if (!holdingPeriod || !discountRate || !terminalCapRate) return 0;
  
  // Calculate initial NOI
  const rentalIncome = incomeData.incomeData?.rentalIncome?.reduce(
    (sum, item) => sum + (item.amount || 0), 0
  ) ?? 0;
  const reimbursements = incomeData.incomeData?.expenseReimbursements?.reduce(
    (sum, item) => sum + (item.amount || 0), 0
  ) ?? 0;
  const otherIncome = incomeData.incomeData?.otherIncome?.reduce(
    (sum, item) => sum + (item.amount || 0), 0
  ) ?? 0;
  const expenses = incomeData.expenseData?.expenses?.reduce(
    (sum, item) => sum + (item.amount || 0), 0
  ) ?? 0;
  const vacancyRate = incomeData.incomeData?.vacancyRate ?? 5;
  
  const pgi = rentalIncome + reimbursements + otherIncome;
  const egi = pgi * (1 - vacancyRate / 100);
  let currentNOI = egi - expenses;
  
  if (currentNOI <= 0) return 0;
  
  const growth = (annualGrowthRate || 0) / 100;
  const discount = discountRate / 100;
  const terminalCap = terminalCapRate / 100;
  const sellingCosts = 0.02;
  
  let cumulativePV = 0;
  
  for (let i = 1; i <= holdingPeriod; i++) {
    const pvFactor = 1 / Math.pow(1 + discount, i);
    cumulativePV += currentNOI * pvFactor;
    currentNOI = currentNOI * (1 + growth);
  }
  
  const grossReversionValue = currentNOI / terminalCap;
  const netReversionValue = grossReversionValue * (1 - sellingCosts);
  const pvReversion = netReversionValue / Math.pow(1 + discount, holdingPeriod);
  
  return cumulativePV + pvReversion;
}

// =================================================================
// MAIN CALCULATION FUNCTION
// =================================================================

/**
 * Calculate AI-suggested weights for reconciliation
 */
export function calculateAIWeights(
  propertyType: string,
  scenarioName: string,
  selectedApproaches: string[],
  salesData?: SalesComparisonData,
  incomeData?: IncomeApproachState | null,
  costData?: CostApproachData,
  improvements?: ImprovementsInventory
): WeightCalculationResult {
  // Normalize property type
  const normalizedPropertyType = propertyType?.toLowerCase().replace(/[^a-z]/g, '_') || 'commercial';
  const baseWeights = PROPERTY_TYPE_BASE_WEIGHTS[normalizedPropertyType] || 
    PROPERTY_TYPE_BASE_WEIGHTS['commercial'];
  
  const scenarioMods = SCENARIO_MODIFIERS[scenarioName] || SCENARIO_MODIFIERS['As Is'];
  
  // Calculate quality scores for each approach
  const qualityScores: Record<string, number> = {
    'Sales Comparison': calculateSalesQualityScore(salesData),
    'Income Approach': calculateIncomeQualityScore(incomeData),
    'Cost Approach': calculateCostQualityScore(costData, improvements),
    'Land Valuation': calculateSalesQualityScore(salesData), // Uses similar logic
    'Multi-Family Approach': calculateIncomeQualityScore(incomeData), // Uses income logic
  };
  
  // Calculate raw weighted scores for each selected approach
  const rawWeights: Record<string, number> = {};
  const explanations: Record<string, WeightExplanation> = {};
  
  for (const approach of selectedApproaches) {
    const base = baseWeights[approach] || 33;
    const quality = qualityScores[approach] || 50;
    const scenarioData = scenarioMods[approach] || { modifier: 0, reason: '' };
    
    // Weighted formula: 40% base + 40% quality + 20% scenario
    const rawWeight = (base * 0.40) + (quality * 0.40) + (scenarioData.modifier * 0.20);
    rawWeights[approach] = Math.max(5, rawWeight); // Minimum 5% weight
    
    // Build explanation
    const qualityFactors: string[] = [];
    if (approach === 'Sales Comparison') {
      qualityFactors.push(`${salesData?.comparables?.length || 0} comparables analyzed`);
    } else if (approach === 'Income Approach' || approach === 'Multi-Family Approach') {
      qualityFactors.push(incomeData?.incomeData?.rentalIncome?.length ? 'Actual lease data' : 'Pro forma estimates');
    } else if (approach === 'Cost Approach') {
      const age = improvements?.parcels?.[0]?.buildings?.[0]?.effectiveAge ?? 'Unknown';
      qualityFactors.push(`Effective age: ${age} years`);
    }
    
    explanations[approach] = {
      baseWeight: base,
      qualityScore: quality,
      qualityFactors,
      scenarioModifier: scenarioData.modifier,
      scenarioReason: scenarioData.reason,
      recommendation: rawWeight >= 40 ? 'primary' : rawWeight >= 25 ? 'secondary' : 'supporting',
    };
  }
  
  // Normalize to 100%
  const total = Object.values(rawWeights).reduce((sum, w) => sum + w, 0);
  const normalizedWeights: Record<string, number> = {};
  
  for (const [approach, weight] of Object.entries(rawWeights)) {
    normalizedWeights[approach] = Math.round((weight / total) * 100);
  }
  
  // Ensure exactly 100% (adjust largest if rounding error)
  const normalizedTotal = Object.values(normalizedWeights).reduce((sum, w) => sum + w, 0);
  if (normalizedTotal !== 100 && Object.keys(normalizedWeights).length > 0) {
    const largest = Object.keys(normalizedWeights).reduce((a, b) =>
      normalizedWeights[a] > normalizedWeights[b] ? a : b
    );
    normalizedWeights[largest] += (100 - normalizedTotal);
  }
  
  return {
    weights: normalizedWeights,
    explanations,
    qualityScores,
  };
}

/**
 * Get Direct Cap and DCF values for display
 */
export function getIncomeSubMethodValues(incomeData?: IncomeApproachState | null): {
  directCapValue: number;
  dcfValue: number;
  reconciledValue: number;
} {
  const directCapValue = calculateDirectCapValue(incomeData);
  const dcfValue = calculateDCFValue(incomeData);
  
  // Reconciled value is typically weighted average, here we use simple average
  const reconciledValue = directCapValue > 0 && dcfValue > 0
    ? Math.round((directCapValue + dcfValue) / 2)
    : directCapValue || dcfValue;
  
  return { directCapValue, dcfValue, reconciledValue };
}

/**
 * Get typical exposure/marketing time ranges by property type
 */
export function getTypicalExposureRanges(propertyType: string): {
  exposureMin: number;
  exposureMax: number;
  marketingMin: number;
  marketingMax: number;
  description: string;
} {
  const ranges: Record<string, { min: number; max: number; desc: string }> = {
    commercial: { min: 6, max: 12, desc: 'Commercial properties typically' },
    industrial: { min: 6, max: 12, desc: 'Industrial properties typically' },
    multifamily: { min: 3, max: 9, desc: 'Multi-family properties typically' },
    residential: { min: 1, max: 6, desc: 'Residential properties typically' },
    land: { min: 12, max: 24, desc: 'Land parcels typically' },
    special_purpose: { min: 12, max: 24, desc: 'Special purpose properties typically' },
  };
  
  const normalized = propertyType?.toLowerCase().replace(/[^a-z]/g, '_') || 'commercial';
  const range = ranges[normalized] || ranges.commercial;
  
  return {
    exposureMin: range.min,
    exposureMax: range.max,
    marketingMin: range.min,
    marketingMax: range.max,
    description: `${range.desc} require ${range.min}-${range.max} months exposure`,
  };
}

