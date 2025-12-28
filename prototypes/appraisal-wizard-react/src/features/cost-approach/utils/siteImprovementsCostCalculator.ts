/**
 * Site Improvements Cost Calculator
 * 
 * Calculates depreciated site improvements value from the Site Improvements inventory.
 * Uses M&S Section 66 cost rates and age-life depreciation.
 */

import type { SiteImprovement } from '../../../types';

// =================================================================
// TYPES
// =================================================================

export interface SiteImprovementCostItem {
  id: string;
  typeName: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  replacementCostNew: number;
  effectiveAge: number;
  economicLife: number;
  depreciationPercent: number;
  depreciatedValue: number;
}

export interface SiteImprovementsCostSummary {
  items: SiteImprovementCostItem[];
  totalRCN: number;
  totalDepreciation: number;
  totalContributoryValue: number;
}

// =================================================================
// M&S SECTION 66 COST RATES
// =================================================================

// Site improvement costs per unit (from marshallSwiftService.ts, synchronized here)
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
  'basketball-court': { cost: 28000, unit: 'EA' },
  'playground': { cost: 35000, unit: 'EA' },
  'sports-field': { cost: 75000, unit: 'EA' },

  // Landscaping
  'landscaping-basic': { cost: 3.00, unit: 'SF' },
  'landscaping-professional': { cost: 8.00, unit: 'SF' },
  'landscaping-premium': { cost: 15.00, unit: 'SF' },
  'irrigation-system': { cost: 2.00, unit: 'SF' },
  'retaining-wall': { cost: 45.00, unit: 'LF' },

  // Signage
  'monument-sign': { cost: 8500, unit: 'EA' },
  'pylon-sign': { cost: 35000, unit: 'EA' },
  'freestanding-sign': { cost: 12000, unit: 'EA' },
  'building-mounted-sign': { cost: 4500, unit: 'EA' },

  // Utilities
  'septic-system': { cost: 12000, unit: 'EA' },
  'well-water': { cost: 8500, unit: 'EA' },
  'generator-backup': { cost: 25000, unit: 'EA' },
  'utility-hookups': { cost: 5000, unit: 'LS' },

  // Drainage
  'storm-drain': { cost: 55.00, unit: 'LF' },
  'catch-basin': { cost: 3500, unit: 'EA' },
  'detention-pond': { cost: 25000, unit: 'EA' },
  'french-drain': { cost: 25.00, unit: 'LF' },

  // Misc Site
  'dumpster-enclosure': { cost: 4500, unit: 'EA' },
  'loading-dock-external': { cost: 15000, unit: 'EA' },
  'canopy-carport': { cost: 6500, unit: 'EA' },
  'flagpole': { cost: 2500, unit: 'EA' },
  'bike-rack': { cost: 850, unit: 'EA' },
};

// Default cost for unknown types (per unit)
const DEFAULT_COST_PER_UNIT = 50;

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Get cost per unit for a site improvement type
 */
export function getCostPerUnit(typeId: string): number {
  const costData = SITE_IMPROVEMENT_COSTS[typeId];
  return costData?.cost ?? DEFAULT_COST_PER_UNIT;
}

/**
 * Calculate depreciation percentage using straight-line age-life method
 */
export function calculateDepreciationPercent(effectiveAge: number, economicLife: number): number {
  if (economicLife <= 0) return 0;
  const depr = effectiveAge / economicLife;
  return Math.min(Math.max(depr, 0), 0.90); // Cap at 90% depreciation
}

/**
 * Calculate depreciated value for a single site improvement
 */
export function calculateSiteImprovementValue(improvement: SiteImprovement): SiteImprovementCostItem {
  const costPerUnit = improvement.costPerUnit ?? getCostPerUnit(improvement.typeId);
  const replacementCostNew = costPerUnit * improvement.quantity;
  const depreciationPercent = improvement.depreciationPercent ?? 
    calculateDepreciationPercent(improvement.effectiveAge, improvement.economicLife);
  const depreciatedValue = replacementCostNew * (1 - depreciationPercent);

  return {
    id: improvement.id,
    typeName: improvement.typeName,
    quantity: improvement.quantity,
    unit: improvement.unit,
    costPerUnit,
    replacementCostNew,
    effectiveAge: improvement.effectiveAge,
    economicLife: improvement.economicLife,
    depreciationPercent,
    depreciatedValue,
  };
}

// =================================================================
// MAIN CALCULATOR FUNCTION
// =================================================================

/**
 * Calculate total site improvements cost summary
 */
export function calculateSiteImprovementsCost(improvements: SiteImprovement[]): SiteImprovementsCostSummary {
  if (!improvements || improvements.length === 0) {
    return {
      items: [],
      totalRCN: 0,
      totalDepreciation: 0,
      totalContributoryValue: 0,
    };
  }

  const items = improvements.map(calculateSiteImprovementValue);
  
  const totalRCN = items.reduce((sum, item) => sum + item.replacementCostNew, 0);
  const totalContributoryValue = items.reduce((sum, item) => sum + item.depreciatedValue, 0);
  const totalDepreciation = totalRCN - totalContributoryValue;

  return {
    items,
    totalRCN,
    totalDepreciation,
    totalContributoryValue,
  };
}

/**
 * Get just the total contributory value (for simple use cases)
 */
export function getTotalSiteImprovementsValue(improvements: SiteImprovement[]): number {
  const summary = calculateSiteImprovementsCost(improvements);
  return summary.totalContributoryValue;
}

/**
 * Format site improvements for display in cost grid
 */
export function formatSiteImprovementsForGrid(improvements: SiteImprovement[]): {
  label: string;
  rcn: number;
  depreciation: number;
  contributoryValue: number;
}[] {
  return improvements.map(imp => {
    const costItem = calculateSiteImprovementValue(imp);
    return {
      label: `${imp.typeName} (${imp.quantity.toLocaleString()} ${imp.unit})`,
      rcn: costItem.replacementCostNew,
      depreciation: costItem.replacementCostNew - costItem.depreciatedValue,
      contributoryValue: costItem.depreciatedValue,
    };
  });
}

