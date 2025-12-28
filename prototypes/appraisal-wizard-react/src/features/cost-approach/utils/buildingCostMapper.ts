/**
 * Building Cost Mapper
 * 
 * Maps ImprovementBuilding (from Improvements Inventory) to cost calculation format.
 * This bridges the Subject Data building definitions to Cost Approach calculations.
 */

import type { ImprovementBuilding, ImprovementArea, ImprovementParcel } from '../../../types';
import type { Improvement } from '../types';
import { DEPRECIATION_TABLE_DATA } from '../constants';

// =================================================================
// TYPES
// =================================================================

export interface CostOverrides {
  baseCostPsf?: number;
  occupancy?: string;
  class?: string;
  quality?: string;
  effectiveAge?: number;
  economicLife?: number;
  entrepreneurialIncentive?: number;
  multipliers?: {
    current?: number;
    local?: number;
    perimeter?: number;
  };
  depreciationPhysical?: number;
  depreciationFunctional?: number;
  depreciationExternal?: number;
}

export interface BuildingWithParcel {
  building: ImprovementBuilding;
  parcelId: string;
  parcelNumber: string;
}

// =================================================================
// M&S COST TABLES (Simplified - would be more comprehensive in production)
// =================================================================

// Base cost per SF by occupancy type and quality (simplified M&S data)
const BASE_COST_TABLE: Record<string, Record<string, number>> = {
  'warehouse': { 'Low': 45, 'Fair': 55, 'Average': 65, 'Good': 80, 'Excellent': 100, 'Luxury': 125 },
  'office': { 'Low': 85, 'Fair': 100, 'Average': 120, 'Good': 150, 'Excellent': 185, 'Luxury': 250 },
  'retail': { 'Low': 75, 'Fair': 90, 'Average': 110, 'Good': 135, 'Excellent': 165, 'Luxury': 220 },
  'industrial': { 'Low': 40, 'Fair': 50, 'Average': 60, 'Good': 75, 'Excellent': 95, 'Luxury': 120 },
  'manufacturing': { 'Low': 50, 'Fair': 60, 'Average': 75, 'Good': 90, 'Excellent': 115, 'Luxury': 140 },
  'flex': { 'Low': 55, 'Fair': 70, 'Average': 85, 'Good': 105, 'Excellent': 130, 'Luxury': 160 },
  'storage': { 'Low': 35, 'Fair': 45, 'Average': 55, 'Good': 70, 'Excellent': 85, 'Luxury': 105 },
  'mezzanine': { 'Low': 30, 'Fair': 40, 'Average': 50, 'Good': 65, 'Excellent': 80, 'Luxury': 100 },
  'apartment': { 'Low': 80, 'Fair': 95, 'Average': 115, 'Good': 140, 'Excellent': 175, 'Luxury': 230 },
  'other': { 'Low': 50, 'Fair': 65, 'Average': 80, 'Good': 100, 'Excellent': 125, 'Luxury': 155 },
};

// Map area types to occupancy categories for M&S lookup
const AREA_TYPE_TO_OCCUPANCY: Record<string, string> = {
  'warehouse': 'Warehouse',
  'office': 'Office',
  'retail': 'Retail Store',
  'industrial': 'Industrial',
  'manufacturing': 'Industrial (Light)',
  'flex': 'Industrial (Light)',
  'storage': 'Warehouse',
  'mezzanine': 'Warehouse',
  'apartment': 'Apartment',
  'other': 'Industrial',
};

// Map construction type to M&S class
const CONSTRUCTION_TYPE_TO_CLASS: Record<string, string> = {
  'steel_frame': 'A - Fireproof Steel',
  'reinforced_concrete': 'B - Reinforced Concrete',
  'masonry': 'C - Masonry',
  'wood_frame': 'D - Wood Frame',
  'metal': 'S - Metal',
  'tilt_up': 'C - Masonry',
  'prefab_metal': 'S - Metal',
};

// Default economic life by construction class
const ECONOMIC_LIFE_BY_CLASS: Record<string, number> = {
  'A - Fireproof Steel': 55,
  'B - Reinforced Concrete': 50,
  'C - Masonry': 45,
  'D - Wood Frame': 40,
  'S - Metal': 40,
};

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Calculate total SF from building areas
 */
export function calculateBuildingTotalSF(building: ImprovementBuilding): number {
  return building.areas?.reduce((sum, area) => sum + (area.squareFootage || 0), 0) || 0;
}

/**
 * Get the primary area type (largest area) for a building
 */
export function getPrimaryAreaType(building: ImprovementBuilding): string {
  if (!building.areas || building.areas.length === 0) return 'other';
  
  const sortedAreas = [...building.areas].sort(
    (a, b) => (b.squareFootage || 0) - (a.squareFootage || 0)
  );
  
  return sortedAreas[0].type || 'other';
}

/**
 * Calculate effective age based on year built and condition
 */
export function calculateEffectiveAge(
  yearBuilt: number | null,
  condition?: string,
  yearRemodeled?: string
): number {
  const currentYear = new Date().getFullYear();
  
  if (!yearBuilt) return 10; // Default if unknown
  
  let actualAge = currentYear - yearBuilt;
  
  // Adjust for remodel
  if (yearRemodeled) {
    const remodelYear = parseInt(yearRemodeled);
    if (!isNaN(remodelYear)) {
      // Remodel reduces effective age by roughly half the time since remodel
      const yearsSinceRemodel = currentYear - remodelYear;
      actualAge = Math.max(yearsSinceRemodel, actualAge * 0.6);
    }
  }
  
  // Adjust for condition
  const conditionMultipliers: Record<string, number> = {
    'excellent': 0.6,
    'good': 0.8,
    'average': 1.0,
    'fair': 1.2,
    'poor': 1.5,
  };
  
  const multiplier = conditionMultipliers[condition?.toLowerCase() || 'average'] || 1.0;
  
  return Math.round(actualAge * multiplier);
}

/**
 * Get physical depreciation percentage from M&S tables
 */
export function getPhysicalDepreciation(effectiveAge: number, constructionClass: string): number {
  // Find closest age in depreciation table
  const closestRow = DEPRECIATION_TABLE_DATA.reduce((prev, curr) =>
    Math.abs(curr.age - effectiveAge) < Math.abs(prev.age - effectiveAge) ? curr : prev
  );
  
  // Get depreciation based on construction class
  if (constructionClass.includes('Steel') || constructionClass.includes('A -')) {
    return closestRow.masonrySteel / 100;
  } else if (constructionClass.includes('Masonry') || constructionClass.includes('B -') || constructionClass.includes('C -')) {
    return closestRow.masonryWood / 100;
  } else {
    return closestRow.frame / 100;
  }
}

/**
 * Calculate weighted average cost per SF based on area breakdown
 */
export function calculateWeightedCostPSF(
  areas: ImprovementArea[],
  quality: string
): number {
  if (!areas || areas.length === 0) return 80; // Default
  
  const totalSF = areas.reduce((sum, a) => sum + (a.squareFootage || 0), 0);
  if (totalSF === 0) return 80;
  
  let weightedCost = 0;
  
  areas.forEach(area => {
    const sf = area.squareFootage || 0;
    const areaType = area.type || 'other';
    const costTable = BASE_COST_TABLE[areaType] || BASE_COST_TABLE['other'];
    const cost = costTable[quality] || costTable['Average'];
    weightedCost += cost * sf;
  });
  
  return Math.round(weightedCost / totalSF * 100) / 100;
}

// =================================================================
// MAIN MAPPER FUNCTION
// =================================================================

/**
 * Map an ImprovementBuilding to the Improvement cost calculation format
 */
export function mapBuildingToCostFormat(
  building: ImprovementBuilding,
  parcelNumber: string,
  overrides?: CostOverrides
): Improvement {
  const totalSF = calculateBuildingTotalSF(building);
  const primaryAreaType = getPrimaryAreaType(building);
  
  // Determine construction class
  const constructionClass = overrides?.class || 
    CONSTRUCTION_TYPE_TO_CLASS[building.constructionType || ''] || 
    'C - Masonry';
  
  // Determine quality
  const quality = overrides?.quality || building.constructionQuality || 'Average';
  
  // Calculate effective age
  const effectiveAge = overrides?.effectiveAge ?? 
    building.effectiveAge ?? 
    calculateEffectiveAge(building.yearBuilt, building.condition, building.yearRemodeled);
  
  // Determine economic life
  const economicLife = overrides?.economicLife ?? 
    building.totalEconomicLife ?? 
    ECONOMIC_LIFE_BY_CLASS[constructionClass] ?? 
    45;
  
  // Calculate base cost per SF
  const baseCostPsf = overrides?.baseCostPsf ?? 
    calculateWeightedCostPSF(building.areas, quality);
  
  // Calculate physical depreciation
  const physicalDepr = overrides?.depreciationPhysical ?? 
    getPhysicalDepreciation(effectiveAge, constructionClass);
  
  // Determine occupancy from primary area type
  const occupancy = overrides?.occupancy || 
    AREA_TYPE_TO_OCCUPANCY[primaryAreaType] || 
    'Industrial';
  
  return {
    id: building.id,
    name: building.name || `Building on ${parcelNumber}`,
    occupancy,
    class: constructionClass,
    quality,
    sourceName: 'MVS Calculator',
    sourceDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    yearBuilt: building.yearBuilt || new Date().getFullYear(),
    yearRemodeled: building.yearRemodeled ? parseInt(building.yearRemodeled) : undefined,
    effectiveAge,
    economicLife,
    areaSf: totalSF,
    baseCostPsf,
    entrepreneurialIncentive: overrides?.entrepreneurialIncentive ?? 0.10, // Default 10%
    multipliers: {
      current: overrides?.multipliers?.current ?? 1.00,
      local: overrides?.multipliers?.local ?? 1.02, // Default slight local adjustment
      perimeter: overrides?.multipliers?.perimeter ?? 1.00,
    },
    depreciationPhysical: physicalDepr,
    depreciationFunctional: overrides?.depreciationFunctional ?? 0,
    depreciationExternal: overrides?.depreciationExternal ?? 0,
  };
}

/**
 * Get all buildings from parcels as a flat list with parcel context
 */
export function getAllBuildingsFromParcels(parcels: ImprovementParcel[]): BuildingWithParcel[] {
  const buildings: BuildingWithParcel[] = [];
  
  parcels.forEach((parcel, parcelIndex) => {
    parcel.buildings?.forEach(building => {
      buildings.push({
        building,
        parcelId: parcel.id,
        parcelNumber: parcel.parcelNumber || `Parcel ${parcelIndex + 1}`,
      });
    });
  });
  
  return buildings;
}

/**
 * Filter buildings by selected IDs and map to cost format
 */
export function getSelectedBuildingsAsCostFormat(
  parcels: ImprovementParcel[],
  selectedBuildingIds: string[],
  costOverrides?: Record<string, CostOverrides>
): Improvement[] {
  const allBuildings = getAllBuildingsFromParcels(parcels);
  
  return allBuildings
    .filter(b => selectedBuildingIds.includes(b.building.id))
    .map(b => mapBuildingToCostFormat(
      b.building, 
      b.parcelNumber,
      costOverrides?.[b.building.id]
    ));
}

/**
 * Calculate line item totals for a single improvement
 */
export function calculateImprovementLineItem(imp: Improvement) {
  const combinedMultiplier = imp.multipliers.current * imp.multipliers.local * imp.multipliers.perimeter;
  const adjustedRate = imp.baseCostPsf * combinedMultiplier;
  const baseCostTotal = imp.areaSf * adjustedRate;
  const incentiveAmount = baseCostTotal * (imp.entrepreneurialIncentive || 0);
  const costNew = baseCostTotal + incentiveAmount;
  const totalDepreciationPct = imp.depreciationPhysical + imp.depreciationFunctional + imp.depreciationExternal;
  const depreciatedCost = costNew * (1 - totalDepreciationPct);
  const remainingEconomicLife = Math.max(0, imp.economicLife - imp.effectiveAge);

  return {
    adjustedRate,
    baseCostTotal,
    incentiveAmount,
    costNew,
    totalDepreciationPct,
    depreciatedCost,
    combinedMultiplier,
    remainingEconomicLife,
  };
}

