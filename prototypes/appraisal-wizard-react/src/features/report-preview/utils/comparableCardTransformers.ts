/**
 * Comparable Card Data Transformers
 * ==================================
 * 
 * Utility functions to transform wizard data structures into
 * ComparableCardData for rendering in the report preview.
 * 
 * Supports:
 * - Land sales comparables (LandSaleComp → ComparableCardData)
 * - Improved sales comparables (SalesCompProperty → ComparableCardData)
 * - Rent comparables (RentComp → ComparableCardData)
 */

import type { 
  LandSaleComp, 
  SalesCompProperty, 
  SalesComparisonData,
  RentComp 
} from '../../../types';
import type { 
  ComparableCardData, 
  ComparableCardsPageData 
} from '../../review/types';

// =================================================================
// LAND COMPARABLE TRANSFORMERS
// =================================================================

/**
 * Transforms a LandSaleComp into a ComparableCardData
 */
export function transformLandComparable(comp: LandSaleComp): ComparableCardData {
  // Calculate net adjustment from individual adjustments
  const adjustmentValues = Object.values(comp.adjustments || {});
  const netAdjustment = adjustmentValues.reduce((sum, adj) => sum + (adj / 100), 0);
  
  return {
    id: comp.id,
    type: 'land',
    address: comp.address,
    saleDate: comp.saleDate,
    salePrice: comp.salePrice,
    pricePerUnit: comp.pricePerAcre,
    unitLabel: 'Acre',
    size: comp.acreage,
    sizeLabel: 'Acres',
    propertyType: `Zoning: ${comp.zoning || 'N/A'}`,
    netAdjustment,
    adjustedValue: comp.adjustedPricePerAcre * comp.acreage,
  };
}

/**
 * Transforms all land comparables into page data
 */
export function transformLandComparables(
  landComps: LandSaleComp[],
  scenarioId: number,
  scenarioName: string
): ComparableCardsPageData {
  return {
    approachType: 'land',
    scenarioId,
    scenarioName,
    comparables: landComps.map(transformLandComparable),
  };
}

// =================================================================
// IMPROVED SALES COMPARABLE TRANSFORMERS
// =================================================================

/**
 * Extracts building SF from values record
 */
function extractBuildingSf(
  propId: string, 
  values: SalesComparisonData['values']
): number | undefined {
  const propValues = values[propId];
  if (!propValues) return undefined;
  
  // Try common field names for building size
  const sizeFields = ['buildingSF', 'building_sf', 'gba', 'gla', 'nra'];
  for (const field of sizeFields) {
    const val = propValues[field]?.value;
    if (typeof val === 'number' && val > 0) return val;
    if (typeof val === 'string') {
      const parsed = parseFloat(val.replace(/,/g, ''));
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  return undefined;
}

/**
 * Calculates net adjustment percentage from values record
 */
function calculateNetAdjustment(
  propId: string,
  values: SalesComparisonData['values']
): number | undefined {
  const propValues = values[propId];
  if (!propValues) return undefined;
  
  let totalAdjustment = 0;
  
  // Sum all percentage adjustments
  Object.values(propValues).forEach(val => {
    if (val.adjustment !== undefined && val.unit === 'percent') {
      totalAdjustment += val.adjustment;
    }
  });
  
  return totalAdjustment !== 0 ? totalAdjustment / 100 : undefined;
}

/**
 * Calculates price per SF
 */
function calculatePricePerSf(
  salePrice: number | undefined,
  buildingSf: number | undefined
): number | undefined {
  if (!salePrice || !buildingSf || buildingSf === 0) return undefined;
  return salePrice / buildingSf;
}

/**
 * Transforms a SalesCompProperty into a ComparableCardData
 */
export function transformSalesComparable(
  comp: SalesCompProperty,
  values: SalesComparisonData['values']
): ComparableCardData {
  const buildingSf = extractBuildingSf(comp.id, values);
  const pricePerSf = calculatePricePerSf(comp.salePrice, buildingSf);
  const netAdjustment = calculateNetAdjustment(comp.id, values);
  
  // Calculate adjusted value
  let adjustedValue: number | undefined;
  if (comp.salePrice && netAdjustment !== undefined) {
    adjustedValue = comp.salePrice * (1 + netAdjustment);
  }
  
  return {
    id: comp.id,
    type: 'improved',
    address: comp.address,
    photoUrl: comp.image || undefined,
    saleDate: comp.saleDate,
    salePrice: comp.salePrice,
    pricePerUnit: pricePerSf,
    unitLabel: 'SF',
    size: buildingSf,
    sizeLabel: 'SF',
    propertyType: comp.name || undefined,
    netAdjustment,
    adjustedValue,
  };
}

/**
 * Transforms all sales comparables into page data
 */
export function transformSalesComparables(
  data: SalesComparisonData,
  scenarioId: number,
  scenarioName: string
): ComparableCardsPageData {
  // Filter to only include comps (not subject)
  const comps = data.properties.filter(p => p.type === 'comp');
  
  return {
    approachType: 'sales',
    scenarioId,
    scenarioName,
    comparables: comps.map(comp => transformSalesComparable(comp, data.values)),
  };
}

// =================================================================
// RENT COMPARABLE TRANSFORMERS
// =================================================================

/**
 * Transforms a RentComp into a ComparableCardData
 */
export function transformRentComparable(comp: RentComp): ComparableCardData {
  // Calculate net adjustment from individual adjustments
  const adjustmentValues = Object.values(comp.adjustments || {});
  const netAdjustment = adjustmentValues.reduce((sum, adj) => sum + (adj / 100), 0);
  
  // Determine if commercial or residential based on available fields
  const isCommercial = comp.rentPerSF !== undefined;
  
  return {
    id: comp.id,
    type: 'rent',
    address: comp.address,
    saleDate: comp.saleDate, // Often lease start date for rent comps
    pricePerUnit: isCommercial ? comp.rentPerSF : comp.rentPerMonth,
    unitLabel: isCommercial ? 'SF/Year' : 'Month',
    size: isCommercial ? comp.buildingSF : comp.unitSF,
    sizeLabel: 'SF',
    propertyType: isCommercial 
      ? `${comp.leaseType || 'N/A'} Lease`
      : comp.bedrooms 
        ? `${comp.bedrooms}BR / ${comp.bathrooms || 1}BA`
        : undefined,
    netAdjustment: netAdjustment !== 0 ? netAdjustment : undefined,
    adjustedValue: comp.adjustedRent,
  };
}

/**
 * Transforms all rent comparables into page data
 */
export function transformRentComparables(
  rentComps: RentComp[],
  scenarioId: number,
  scenarioName: string
): ComparableCardsPageData {
  return {
    approachType: 'rent',
    scenarioId,
    scenarioName,
    comparables: rentComps.map(transformRentComparable),
  };
}

// =================================================================
// UTILITY FUNCTIONS
// =================================================================

/**
 * Calculates the number of pages needed for a set of comparables
 */
export function calculatePageCount(comparableCount: number, cardsPerPage = 3): number {
  if (comparableCount === 0) return 1;
  return Math.ceil(comparableCount / cardsPerPage);
}

/**
 * Gets comparables for a specific page
 */
export function getComparablesForPage(
  comparables: ComparableCardData[],
  pageNumber: number,
  cardsPerPage = 3
): ComparableCardData[] {
  const startIdx = (pageNumber - 1) * cardsPerPage;
  return comparables.slice(startIdx, startIdx + cardsPerPage);
}
