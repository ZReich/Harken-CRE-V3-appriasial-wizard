/**
 * Marshall & Swift Cost Data Service
 * 
 * Abstraction layer for M&S cost data. Currently implements manual/static
 * lookup tables based on M&S methodology. When M&S API becomes available,
 * a new implementation can be swapped in without UI changes.
 * 
 * This service provides:
 * - Building cost rates by occupancy/quality/class
 * - Cost multipliers (current, local, perimeter)
 * - Depreciation tables
 * - Site improvement costs
 */

import {
  type ConstructionClass,
  type QualityGrade,
  getSiteImprovementType,
  QUALITY_GRADES,
} from '../constants/marshallSwift';

// =================================================================
// TYPES
// =================================================================

export interface CostRate {
  baseCostPerSF: number;
  minCost: number;
  maxCost: number;
  effectiveDate: string;
  source: string;
}

export interface Multipliers {
  current: number;      // Current cost multiplier (inflation adjustment)
  local: number;        // Local cost modifier by region
  perimeter: number;    // Perimeter/shape adjustment
  height: number;       // Story height adjustment
  sprinkler: number;    // Sprinkler additive
  hvac: number;         // HVAC additive
  elevator: number;     // Elevator additive
}

export interface DepreciationRow {
  age: number;
  frame: number;        // Class D wood frame
  masonryWood: number;  // Class C masonry/wood
  masonrySteel: number; // Class B masonry/steel
  fireproof: number;    // Class A fireproof
  metal: number;        // Class S metal
}

export interface SiteImprovementCostRate {
  costPerUnit: number;
  unit: 'SF' | 'LF' | 'EA' | 'LS';
  minCost: number;
  maxCost: number;
  effectiveDate: string;
  source: string;
}

// =================================================================
// SERVICE INTERFACE
// =================================================================

export interface CostDataService {
  // Building costs
  getBaseCostPerSF(
    occupancyCode: string,
    quality: QualityGrade,
    classType: ConstructionClass
  ): Promise<CostRate>;

  getMultipliers(
    stateCode: string,
    zipCode: string,
    effectiveDate: Date
  ): Promise<Multipliers>;

  getDepreciationTable(constructionClass: ConstructionClass): DepreciationRow[];

  getDepreciationPercent(
    constructionClass: ConstructionClass,
    effectiveAge: number
  ): number;

  // Site improvements (Section 66)
  getSiteImprovementCost(typeId: string): Promise<SiteImprovementCostRate>;

  getSiteImprovementEconomicLife(typeId: string): number;

  // Utility
  getEffectiveDate(): string;
  getDataSource(): string;
}

// =================================================================
// LOCAL COST MULTIPLIERS BY STATE
// =================================================================

const STATE_LOCAL_MULTIPLIERS: Record<string, number> = {
  'AL': 0.87, 'AK': 1.28, 'AZ': 0.93, 'AR': 0.85, 'CA': 1.18,
  'CO': 0.98, 'CT': 1.12, 'DE': 1.02, 'FL': 0.92, 'GA': 0.88,
  'HI': 1.35, 'ID': 0.92, 'IL': 1.05, 'IN': 0.94, 'IA': 0.93,
  'KS': 0.90, 'KY': 0.89, 'LA': 0.88, 'ME': 0.95, 'MD': 1.00,
  'MA': 1.15, 'MI': 0.98, 'MN': 1.02, 'MS': 0.84, 'MO': 0.95,
  'MT': 0.94, 'NE': 0.91, 'NV': 1.05, 'NH': 1.00, 'NJ': 1.14,
  'NM': 0.90, 'NY': 1.20, 'NC': 0.86, 'ND': 0.93, 'OH': 0.95,
  'OK': 0.86, 'OR': 1.02, 'PA': 1.01, 'RI': 1.08, 'SC': 0.85,
  'SD': 0.88, 'TN': 0.87, 'TX': 0.88, 'UT': 0.93, 'VT': 0.95,
  'VA': 0.93, 'WA': 1.05, 'WV': 0.92, 'WI': 0.99, 'WY': 0.93,
  'DC': 1.05,
};

// =================================================================
// BASE COST TABLES (Placeholder values - would come from M&S API)
// =================================================================

// Base costs per SF by occupancy type and quality
// These are representative ranges - actual M&S data would be more granular
const BASE_COSTS: Record<string, { low: number; avg: number; high: number }> = {
  // Residential
  'sfr-detached': { low: 95, avg: 145, high: 250 },
  'townhouse': { low: 90, avg: 135, high: 220 },
  'duplex': { low: 85, avg: 125, high: 195 },
  'triplex': { low: 85, avg: 125, high: 195 },
  'fourplex': { low: 85, avg: 125, high: 195 },
  'mobile-single': { low: 45, avg: 65, high: 85 },
  'mobile-double': { low: 50, avg: 70, high: 95 },
  'manufactured-hud': { low: 55, avg: 80, high: 110 },
  'adu-guest': { low: 100, avg: 150, high: 225 },

  // Office
  'office-lowrise': { low: 125, avg: 175, high: 275 },
  'office-midrise': { low: 150, avg: 210, high: 325 },
  'office-highrise': { low: 185, avg: 265, high: 400 },
  'medical-office': { low: 175, avg: 250, high: 375 },
  'dental-clinic': { low: 165, avg: 235, high: 350 },
  'hospital-general': { low: 350, avg: 475, high: 650 },
  'veterinary': { low: 145, avg: 200, high: 300 },
  'bank-branch': { low: 175, avg: 250, high: 375 },

  // Retail
  'retail-general': { low: 85, avg: 125, high: 200 },
  'department-store': { low: 95, avg: 140, high: 225 },
  'discount-bigbox': { low: 65, avg: 95, high: 145 },
  'strip-center': { low: 80, avg: 120, high: 185 },
  'regional-mall': { low: 125, avg: 185, high: 300 },
  'restaurant-sitdown': { low: 175, avg: 250, high: 400 },
  'restaurant-fastfood': { low: 150, avg: 210, high: 325 },
  'bar-tavern': { low: 145, avg: 200, high: 325 },
  'auto-dealership': { low: 115, avg: 165, high: 265 },
  'gas-station': { low: 135, avg: 185, high: 285 },
  'auto-repair': { low: 85, avg: 120, high: 180 },
  'car-wash': { low: 175, avg: 250, high: 375 },
  'parking-structure': { low: 55, avg: 75, high: 110 },

  // Industrial
  'warehouse-general': { low: 55, avg: 80, high: 125 },
  'distribution-center': { low: 65, avg: 95, high: 150 },
  'cold-storage': { low: 125, avg: 175, high: 275 },
  'mini-storage': { low: 45, avg: 65, high: 100 },
  'manufacturing-light': { low: 75, avg: 110, high: 175 },
  'manufacturing-heavy': { low: 95, avg: 140, high: 225 },
  'flex-rd': { low: 95, avg: 140, high: 225 },
  'loft-industrial': { low: 85, avg: 125, high: 200 },

  // Multi-family
  'apartment-lowrise': { low: 95, avg: 140, high: 225 },
  'apartment-midrise': { low: 125, avg: 180, high: 285 },
  'apartment-highrise': { low: 165, avg: 240, high: 375 },
  'assisted-living': { low: 175, avg: 250, high: 375 },
  'nursing-home': { low: 195, avg: 275, high: 400 },
  'hotel-fullservice': { low: 175, avg: 250, high: 400 },
  'hotel-limited': { low: 115, avg: 165, high: 265 },
  'motel': { low: 75, avg: 110, high: 175 },
  'extended-stay': { low: 125, avg: 180, high: 285 },
  'dormitory': { low: 135, avg: 190, high: 300 },

  // Institutional
  'school-elementary': { low: 165, avg: 235, high: 350 },
  'school-middle': { low: 175, avg: 250, high: 375 },
  'school-high': { low: 185, avg: 265, high: 400 },
  'college-university': { low: 225, avg: 325, high: 500 },
  'daycare': { low: 135, avg: 190, high: 300 },
  'church-sanctuary': { low: 145, avg: 210, high: 350 },
  'theater-cinema': { low: 165, avg: 235, high: 375 },
  'theater-live': { low: 225, avg: 325, high: 500 },
  'arena-stadium': { low: 275, avg: 400, high: 600 },
  'community-center': { low: 165, avg: 235, high: 375 },
  'fire-station': { low: 195, avg: 275, high: 425 },
  'police-station': { low: 225, avg: 325, high: 500 },
  'post-office': { low: 145, avg: 210, high: 325 },
  'correctional': { low: 275, avg: 400, high: 600 },

  // Agricultural
  'barn-general': { low: 25, avg: 40, high: 65 },
  'barn-dairy': { low: 35, avg: 55, high: 85 },
  'barn-horse': { low: 45, avg: 70, high: 115 },
  'pole-barn': { low: 18, avg: 28, high: 45 },
  'loafing-shed': { low: 12, avg: 18, high: 30 },
  'poultry-broiler': { low: 20, avg: 32, high: 50 },
  'poultry-layer': { low: 25, avg: 38, high: 60 },
  'greenhouse-glass': { low: 45, avg: 70, high: 110 },
  'greenhouse-poly': { low: 15, avg: 25, high: 40 },
  'silo': { low: 25, avg: 40, high: 65 },
  'grain-bin': { low: 8, avg: 12, high: 20 },
};

// =================================================================
// SITE IMPROVEMENT COST TABLE
// =================================================================

const SITE_IMPROVEMENT_COSTS: Record<string, { cost: number; unit: 'SF' | 'LF' | 'EA' | 'LS' }> = {
  // Paving
  'asphalt-paving': { cost: 4.50, unit: 'SF' },
  'concrete-paving': { cost: 8.00, unit: 'SF' },
  'gravel-surface': { cost: 1.50, unit: 'SF' },
  'heavy-duty-paving': { cost: 12.00, unit: 'SF' },
  'sidewalk': { cost: 7.00, unit: 'SF' },
  'curbing': { cost: 18.00, unit: 'LF' },
  'striping': { cost: 2500, unit: 'LS' },

  // Fencing
  'chain-link-fence': { cost: 22.00, unit: 'LF' },
  'wood-fence': { cost: 28.00, unit: 'LF' },
  'vinyl-fence': { cost: 35.00, unit: 'LF' },
  'ornamental-fence': { cost: 55.00, unit: 'LF' },
  'security-fence': { cost: 45.00, unit: 'LF' },
  'masonry-wall': { cost: 85.00, unit: 'LF' },
  'gate-manual': { cost: 1500, unit: 'EA' },
  'gate-electric': { cost: 8500, unit: 'EA' },
  'agricultural-fence': { cost: 4.50, unit: 'LF' },
  'cross-fence': { cost: 3.50, unit: 'LF' },

  // Lighting
  'pole-light': { cost: 3500, unit: 'EA' },
  'high-mast-light': { cost: 25000, unit: 'EA' },
  'bollard-light': { cost: 850, unit: 'EA' },
  'landscape-lighting': { cost: 5000, unit: 'LS' },

  // Recreation
  'pool-inground': { cost: 65000, unit: 'EA' },
  'pool-aboveground': { cost: 8500, unit: 'EA' },
  'spa-hot-tub': { cost: 12000, unit: 'EA' },
  'tennis-court': { cost: 45000, unit: 'EA' },
  'basketball-court': { cost: 35000, unit: 'EA' },
  'playground': { cost: 25000, unit: 'LS' },

  // Utilities
  'septic-system': { cost: 15000, unit: 'EA' },
  'water-well': { cost: 12000, unit: 'EA' },
  'water-tank': { cost: 8500, unit: 'EA' },
  'irrigation-system': { cost: 1.25, unit: 'SF' },
  'irrigation-pivot': { cost: 85000, unit: 'EA' },
  'fuel-storage': { cost: 25000, unit: 'EA' },
  'truck-scale': { cost: 75000, unit: 'EA' },
  'detention-pond': { cost: 45000, unit: 'LS' },

  // Signage
  'pylon-sign': { cost: 25000, unit: 'EA' },
  'monument-sign': { cost: 15000, unit: 'EA' },
  'building-sign': { cost: 8500, unit: 'EA' },

  // Landscaping
  'landscaping-basic': { cost: 2.50, unit: 'SF' },
  'landscaping-professional': { cost: 6.00, unit: 'SF' },
  'windbreak': { cost: 25.00, unit: 'LF' },

  // Structures
  'detached-garage': { cost: 65.00, unit: 'SF' },
  'carport': { cost: 35.00, unit: 'SF' },
  'storage-shed': { cost: 45.00, unit: 'SF' },
  'gazebo': { cost: 8500, unit: 'EA' },
  'deck': { cost: 35.00, unit: 'SF' },
  'patio': { cost: 12.00, unit: 'SF' },
  'trash-enclosure': { cost: 5500, unit: 'EA' },
  'guard-booth': { cost: 15000, unit: 'EA' },

  // Agricultural
  'corral': { cost: 8.00, unit: 'SF' },
  'feed-bunk': { cost: 45.00, unit: 'LF' },
  'water-trough': { cost: 1200, unit: 'EA' },
  'livestock-scale': { cost: 18000, unit: 'EA' },
};

// =================================================================
// DEPRECIATION TABLE
// =================================================================

const DEPRECIATION_TABLE: DepreciationRow[] = [
  { age: 1, frame: 1, masonryWood: 0, masonrySteel: 0, fireproof: 0, metal: 1 },
  { age: 2, frame: 2, masonryWood: 1, masonrySteel: 0, fireproof: 0, metal: 2 },
  { age: 3, frame: 3, masonryWood: 2, masonrySteel: 1, fireproof: 0, metal: 3 },
  { age: 4, frame: 4, masonryWood: 3, masonrySteel: 2, fireproof: 1, metal: 4 },
  { age: 5, frame: 6, masonryWood: 5, masonrySteel: 3, fireproof: 2, metal: 5 },
  { age: 8, frame: 12, masonryWood: 10, masonrySteel: 5, fireproof: 4, metal: 10 },
  { age: 10, frame: 20, masonryWood: 15, masonrySteel: 8, fireproof: 5, metal: 15 },
  { age: 15, frame: 25, masonryWood: 20, masonrySteel: 15, fireproof: 10, metal: 20 },
  { age: 20, frame: 30, masonryWood: 25, masonrySteel: 20, fireproof: 15, metal: 25 },
  { age: 25, frame: 35, masonryWood: 30, masonrySteel: 25, fireproof: 20, metal: 30 },
  { age: 30, frame: 40, masonryWood: 35, masonrySteel: 30, fireproof: 25, metal: 35 },
  { age: 35, frame: 45, masonryWood: 40, masonrySteel: 35, fireproof: 30, metal: 40 },
  { age: 40, frame: 50, masonryWood: 45, masonrySteel: 40, fireproof: 35, metal: 45 },
  { age: 45, frame: 55, masonryWood: 50, masonrySteel: 45, fireproof: 40, metal: 50 },
  { age: 50, frame: 60, masonryWood: 55, masonrySteel: 50, fireproof: 45, metal: 55 },
  { age: 55, frame: 65, masonryWood: 60, masonrySteel: 55, fireproof: 50, metal: 60 },
  { age: 60, frame: 70, masonryWood: 65, masonrySteel: 60, fireproof: 55, metal: 65 },
  { age: 70, frame: 80, masonryWood: 75, masonrySteel: 70, fireproof: 65, metal: 75 },
  { age: 80, frame: 85, masonryWood: 80, masonrySteel: 75, fireproof: 70, metal: 80 },
];

// =================================================================
// MANUAL IMPLEMENTATION
// =================================================================

class ManualCostDataService implements CostDataService {
  private effectiveDate: string = '2024-01';
  private dataSource: string = 'Manual Entry / M&S Methodology';

  async getBaseCostPerSF(
    occupancyCode: string,
    quality: QualityGrade,
    _classType: ConstructionClass
  ): Promise<CostRate> {
    const baseCosts = BASE_COSTS[occupancyCode] ?? { low: 100, avg: 150, high: 225 };
    const qualityMultiplier = QUALITY_GRADES.find(q => q.id === quality)?.multiplier ?? 1.0;

    // Apply quality multiplier to average cost
    const adjustedCost = baseCosts.avg * qualityMultiplier;

    return {
      baseCostPerSF: adjustedCost,
      minCost: baseCosts.low,
      maxCost: baseCosts.high,
      effectiveDate: this.effectiveDate,
      source: this.dataSource,
    };
  }

  async getMultipliers(
    stateCode: string,
    _zipCode: string,
    _effectiveDate: Date
  ): Promise<Multipliers> {
    const localMultiplier = STATE_LOCAL_MULTIPLIERS[stateCode.toUpperCase()] ?? 1.0;

    return {
      current: 1.0,        // Would be updated with current cost index
      local: localMultiplier,
      perimeter: 1.0,      // Default, user can adjust
      height: 1.0,         // Default, user can adjust
      sprinkler: 0,        // Additive per SF
      hvac: 0,             // Additive per SF
      elevator: 0,         // Additive per SF
    };
  }

  getDepreciationTable(_constructionClass: ConstructionClass): DepreciationRow[] {
    return DEPRECIATION_TABLE;
  }

  getDepreciationPercent(
    constructionClass: ConstructionClass,
    effectiveAge: number
  ): number {
    // Find the closest age row
    const sortedTable = [...DEPRECIATION_TABLE].sort(
      (a, b) => Math.abs(a.age - effectiveAge) - Math.abs(b.age - effectiveAge)
    );
    const closestRow = sortedTable[0];

    // Get depreciation based on construction class
    switch (constructionClass) {
      case 'A':
        return closestRow.fireproof / 100;
      case 'B':
        return closestRow.masonrySteel / 100;
      case 'C':
        return closestRow.masonryWood / 100;
      case 'D':
        return closestRow.frame / 100;
      case 'S':
        return closestRow.metal / 100;
      default:
        return closestRow.masonryWood / 100;
    }
  }

  async getSiteImprovementCost(typeId: string): Promise<SiteImprovementCostRate> {
    const costData = SITE_IMPROVEMENT_COSTS[typeId];
    const siteType = getSiteImprovementType(typeId);

    if (!costData) {
      return {
        costPerUnit: 0,
        unit: siteType?.defaultUnit ?? 'EA',
        minCost: 0,
        maxCost: 0,
        effectiveDate: this.effectiveDate,
        source: this.dataSource,
      };
    }

    return {
      costPerUnit: costData.cost,
      unit: costData.unit,
      minCost: costData.cost * 0.7,
      maxCost: costData.cost * 1.3,
      effectiveDate: this.effectiveDate,
      source: this.dataSource,
    };
  }

  getSiteImprovementEconomicLife(typeId: string): number {
    const siteType = getSiteImprovementType(typeId);
    return siteType?.defaultEconomicLife ?? 20;
  }

  getEffectiveDate(): string {
    return this.effectiveDate;
  }

  getDataSource(): string {
    return this.dataSource;
  }
}

// =================================================================
// SERVICE FACTORY
// =================================================================

/**
 * Factory function to get the cost data service.
 * Currently returns the manual implementation.
 * When M&S API is available, this can be swapped via feature flag.
 */
export function getCostDataService(): CostDataService {
  // In the future, this could check a feature flag:
  // if (featureFlags.useMSApi) {
  //   return new MSApiCostDataService();
  // }
  return new ManualCostDataService();
}

// Create a singleton instance for convenience
export const costDataService = getCostDataService();

// =================================================================
// UTILITY FUNCTIONS
// =================================================================

/**
 * Calculate replacement cost new for an improvement
 */
export async function calculateReplacementCostNew(
  occupancyCode: string,
  quality: QualityGrade,
  constructionClass: ConstructionClass,
  areaSF: number,
  stateCode: string,
  zipCode: string,
  entrepreneurialIncentive: number = 0.10
): Promise<{
  baseCost: number;
  adjustedCost: number;
  totalWithIncentive: number;
  breakdown: {
    baseCostPerSF: number;
    localMultiplier: number;
    qualityMultiplier: number;
    incentivePercent: number;
  };
}> {
  const service = getCostDataService();
  const costRate = await service.getBaseCostPerSF(occupancyCode, quality, constructionClass);
  const multipliers = await service.getMultipliers(stateCode, zipCode, new Date());

  const baseCost = costRate.baseCostPerSF * areaSF;
  const adjustedCost = baseCost * multipliers.local * multipliers.current;
  const incentiveAmount = adjustedCost * entrepreneurialIncentive;
  const totalWithIncentive = adjustedCost + incentiveAmount;

  return {
    baseCost,
    adjustedCost,
    totalWithIncentive,
    breakdown: {
      baseCostPerSF: costRate.baseCostPerSF,
      localMultiplier: multipliers.local,
      qualityMultiplier: QUALITY_GRADES.find(q => q.id === quality)?.multiplier ?? 1.0,
      incentivePercent: entrepreneurialIncentive,
    },
  };
}

/**
 * Calculate depreciated cost for an improvement
 */
export function calculateDepreciatedCost(
  replacementCostNew: number,
  constructionClass: ConstructionClass,
  effectiveAge: number,
  functionalObsolescence: number = 0,
  externalObsolescence: number = 0
): {
  physicalDepreciation: number;
  functionalObsolescence: number;
  externalObsolescence: number;
  totalDepreciation: number;
  depreciatedCost: number;
} {
  const service = getCostDataService();
  const physicalDepreciationPct = service.getDepreciationPercent(constructionClass, effectiveAge);
  
  const physicalDepreciation = replacementCostNew * physicalDepreciationPct;
  const funcObsAmount = replacementCostNew * functionalObsolescence;
  const extObsAmount = replacementCostNew * externalObsolescence;
  const totalDepreciation = physicalDepreciation + funcObsAmount + extObsAmount;
  const depreciatedCost = Math.max(0, replacementCostNew - totalDepreciation);

  return {
    physicalDepreciation,
    functionalObsolescence: funcObsAmount,
    externalObsolescence: extObsAmount,
    totalDepreciation,
    depreciatedCost,
  };
}

/**
 * Calculate site improvement contributory value
 */
export async function calculateSiteImprovementValue(
  typeId: string,
  quantity: number,
  effectiveAge: number,
  stateCode: string = 'MT'
): Promise<{
  replacementCostNew: number;
  depreciation: number;
  contributoryValue: number;
}> {
  const service = getCostDataService();
  const costRate = await service.getSiteImprovementCost(typeId);
  const economicLife = service.getSiteImprovementEconomicLife(typeId);
  const multipliers = await service.getMultipliers(stateCode, '', new Date());

  const baseCost = costRate.costPerUnit * quantity * multipliers.local;
  const depreciationPct = Math.min(1, effectiveAge / economicLife);
  const depreciation = baseCost * depreciationPct;
  const contributoryValue = baseCost - depreciation;

  return {
    replacementCostNew: baseCost,
    depreciation,
    contributoryValue: Math.max(0, contributoryValue),
  };
}

