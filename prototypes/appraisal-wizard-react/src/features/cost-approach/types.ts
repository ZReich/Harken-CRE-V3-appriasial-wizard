// =================================================================
// COST APPROACH TYPES
// =================================================================

export type ValueScenario = 'As Is' | 'As Completed' | 'As Stabilized';

export interface Adjustment {
  id: string;
  name: string;
  value: number;
  type: 'percent' | 'dollar';
}

export interface LandComp {
  id: string;
  address: string;
  cityStateZip: string;
  dateSold: string;
  salePrice: number;
  landSf: number;
  zoning: string;
  imageUrl?: string;
  adjustments: Record<string, number>;
}

export interface Improvement {
  id: string;
  name: string;
  occupancy: string;
  class: string;
  quality: string;
  
  // Data Source (USPAP Requirement)
  sourceName?: string;
  sourceDate?: string;

  // Dates
  yearBuilt: number;
  yearRemodeled?: number;
  effectiveAge: number;
  economicLife: number;

  // Size & Cost
  areaSf: number;
  baseCostPsf: number;
  entrepreneurialIncentive: number;

  multipliers: {
    current: number;
    local: number;
    perimeter: number;
  };
  
  // Depreciation Breakdown
  depreciationPhysical: number;
  depreciationFunctional: number;
  depreciationExternal: number;
}

export type RowType = 'data' | 'adjustment';

export interface GridRow {
  id: string;
  label: string;
  type: RowType;
  section: 'transaction' | 'quantitative' | 'qualitative';
  field?: keyof LandComp;
  removable?: boolean;
}

export interface CostApproachState {
  landComps: LandComp[];
  landRows: GridRow[];
  subjectLandSf: number;
  landValueRaw: number;
  landValueRounded: number | null;
  
  improvements: Improvement[];
  siteImprovementsCost: number;
  
  scenario: ValueScenario;
  stabilizationAdjustment: number;
  finalIndicatedValue: number;
  isManualOverride: boolean;
  
  narrative: string;
}

export interface CostApproachTotals {
  landValue: number;
  mvsCostNewTotal: number;
  totalDepreciationAmount: number;
  mvsTotalWithSite: number;
  exactTotal: number;
  finalValue: number;
}

export interface ImprovementLineItem {
  adjustedRate: number;
  baseCostTotal: number;
  incentiveAmount: number;
  costNew: number;
  totalDepreciationPct: number;
  depreciatedCost: number;
  combinedMultiplier: number;
  remainingEconomicLife: number;
}




