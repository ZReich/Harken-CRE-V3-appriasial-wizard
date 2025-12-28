/**
 * Cost Approach Utilities
 */

// Building cost mapping utilities
export {
  mapBuildingToCostFormat,
  getAllBuildingsFromParcels,
  getSelectedBuildingsAsCostFormat,
  calculateBuildingTotalSF,
  getPrimaryAreaType,
  calculateEffectiveAge,
  getPhysicalDepreciation,
  calculateWeightedCostPSF,
  calculateImprovementLineItem,
  type CostOverrides,
  type BuildingWithParcel,
} from './buildingCostMapper';

// Site improvements cost calculation utilities
export {
  calculateSiteImprovementsCost,
  getTotalSiteImprovementsValue,
  calculateSiteImprovementValue,
  getCostPerUnit,
  calculateDepreciationPercent,
  formatSiteImprovementsForGrid,
  type SiteImprovementCostItem,
  type SiteImprovementsCostSummary,
} from './siteImprovementsCostCalculator';

