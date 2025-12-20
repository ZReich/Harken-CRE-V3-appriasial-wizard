
export type ValueScenario = 'As Is' | 'As Completed' | 'As Stabilized';

export interface Adjustment {
  id: string;
  name: string;
  value: number; // Percentage or Dollar amount
  type: 'percent' | 'dollar';
}

export interface Comp {
  id: string;
  address: string;
  cityStateZip: string;
  dateSold: string;
  salePrice: number;
  landSf: number;
  zoning: string;
  imageUrl?: string;
  adjustments: Record<string, number>; // key: category, value: percent adjustment
}

export interface Improvement {
  id: string;
  name: string; // e.g. "Main Building", "Garage"
  occupancy: string;
  class: string;
  quality: string;
  
  // Data Source (USPAP Requirement: Citation)
  sourceName?: string; // e.g. "MVS Sec 14 P 12"
  sourceDate?: string; // e.g. "Jan 2024"

  // Dates
  yearBuilt: number;
  yearRemodeled?: number;
  effectiveAge: number;
  economicLife: number;

  // Size & Cost
  areaSf: number;
  baseCostPsf: number;
  entrepreneurialIncentive: number; // Percent 0-1 (Profit)
  multipliers: {
    current: number;
    local: number;
    perimeter: number;
  };
  
  // Depreciation Breakdown
  depreciationPhysical: number; // Percent 0-1
  depreciationFunctional: number; // Percent 0-1
  depreciationExternal: number; // Percent 0-1
}

export interface AppState {
  landValue: number;
  improvementsValue: number;
  totalCostValue: number;
  currentScenario: ValueScenario;
}
