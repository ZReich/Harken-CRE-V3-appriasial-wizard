/**
 * Sales Comparison Adjustment Calculator
 * 
 * Pure utility functions for calculating adjustments in the sales comparison approach.
 * These functions are extracted for testability and reuse.
 */

import type { PropertyValues, ComparisonValue } from '../types';

/**
 * Calculate the net adjustment percentage for a property
 * Sums all adjustment percentages across all rows (excluding price and price_sf)
 */
export function calculateNetAdjustment(propValues: Record<string, ComparisonValue>): number {
  let netAdj = 0;
  
  Object.keys(propValues).forEach(key => {
    const entry = propValues[key];
    if (entry?.adjustment !== undefined && 
        typeof entry.adjustment === 'number' && 
        key !== 'price' && 
        key !== 'price_sf') {
      netAdj += entry.adjustment;
    }
  });
  
  return netAdj;
}

/**
 * Calculate the base price per SF for a comparable property
 * In residual mode: (Sale Price - Land Value) / Building SF
 * In standard mode: Direct price per SF value
 */
export function calculateBasePriceSf(
  propValues: Record<string, ComparisonValue>,
  analysisMode: 'standard' | 'residual'
): number {
  if (analysisMode === 'residual') {
    const price = propValues['price']?.value;
    const land = propValues['land_value']?.value;
    const bldgSf = propValues['bldg_size_fact']?.value;
    
    if (typeof price === 'number' && 
        typeof land === 'number' && 
        typeof bldgSf === 'number' && 
        bldgSf > 0) {
      return (price - land) / bldgSf;
    }
    return 0;
  }
  
  // Standard mode
  const priceSf = propValues['price_sf']?.value;
  return typeof priceSf === 'number' ? priceSf : 0;
}

/**
 * Calculate the adjusted price per SF after applying net adjustments
 */
export function calculateAdjustedPriceSf(
  basePriceSf: number,
  netAdjustmentPercent: number
): number {
  return basePriceSf * (1 + netAdjustmentPercent);
}

/**
 * Calculate the indicated value from a comparable property
 */
export function calculateIndicatedValue(
  propValues: Record<string, ComparisonValue>,
  subjectBldgSf: number,
  analysisMode: 'standard' | 'residual',
  subjectLandValue?: number
): number | null {
  const netAdj = calculateNetAdjustment(propValues);
  const basePriceSf = calculateBasePriceSf(propValues, analysisMode);
  
  if (basePriceSf <= 0) return null;
  
  const adjustedPriceSf = calculateAdjustedPriceSf(basePriceSf, netAdj);
  let totalValue = subjectBldgSf * adjustedPriceSf;
  
  // In residual mode, add back the subject land value
  if (analysisMode === 'residual' && typeof subjectLandValue === 'number') {
    totalValue += subjectLandValue;
  }
  
  return Math.round(totalValue);
}

/**
 * Calculate the concluded value from all comparable properties
 * Returns the average of all indicated values
 */
export function calculateConcludedValue(
  values: PropertyValues,
  properties: Array<{ id: string; type: 'subject' | 'comp' }>,
  analysisMode: 'standard' | 'residual'
): number | null {
  const subjectValues = values['subject'];
  if (!subjectValues) return null;
  
  const subjectBldgSf = subjectValues['bldg_size_fact']?.value;
  if (typeof subjectBldgSf !== 'number' || subjectBldgSf <= 0) return null;
  
  const subjectLandValue = analysisMode === 'residual'
    ? (typeof subjectValues['subject_land_add_back']?.value === 'number' 
        ? subjectValues['subject_land_add_back'].value 
        : undefined)
    : undefined;
  
  const indicatedValues: number[] = [];
  
  properties.forEach(prop => {
    if (prop.type === 'subject') return;
    
    const propValues = values[prop.id];
    if (!propValues) return;
    
    const indicatedValue = calculateIndicatedValue(
      propValues,
      subjectBldgSf,
      analysisMode,
      subjectLandValue
    );
    
    if (indicatedValue !== null) {
      indicatedValues.push(indicatedValue);
    }
  });
  
  if (indicatedValues.length === 0) return null;
  
  const average = indicatedValues.reduce((a, b) => a + b, 0) / indicatedValues.length;
  return Math.round(average);
}

/**
 * Calculate the concluded value per square foot
 */
export function calculateConcludedValuePsf(
  concludedValue: number | null,
  subjectBldgSf: number
): number | null {
  if (concludedValue === null || subjectBldgSf <= 0) return null;
  return Math.round(concludedValue / subjectBldgSf);
}

/**
 * Determine the adjustment direction indicator
 * Returns 'superior', 'inferior', or 'similar' based on adjustment value
 */
export function getAdjustmentDirection(adjustment: number | undefined): 'superior' | 'inferior' | 'similar' {
  if (adjustment === undefined || adjustment === 0) return 'similar';
  return adjustment > 0 ? 'inferior' : 'superior';
}

/**
 * Format an adjustment value for display
 * Converts decimal to percentage and adds +/- prefix
 */
export function formatAdjustmentDisplay(adjustment: number | undefined): string {
  if (adjustment === undefined || adjustment === 0) return 'SIM';
  
  const percent = adjustment * 100;
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(1)}%`;
}
