/**
 * Cost Segregation Feature Module
 * 
 * Provides IRS-compliant cost segregation analysis functionality
 * including component classification, building systems valuation,
 * and depreciation schedule generation.
 */

// Components
export { CostSegOverview } from './components/CostSegOverview';
export { ComponentClassifier } from './components/ComponentClassifier';
export { BuildingSystems } from './components/BuildingSystems';
export { DepreciationSchedule } from './components/DepreciationSchedule';

// Re-export types from main types file
export type {
  CostSegAnalysis,
  CostSegComponent,
  CostSegConfig,
  CostSegState,
  BuildingSystemSummary,
  DepreciationClassSummary,
  DepreciationYearProjection,
} from '../../types';

// Re-export constants
export {
  DEPRECIATION_CLASSES,
  FIVE_YEAR_COMPONENTS,
  FIFTEEN_YEAR_COMPONENTS,
  THIRTY_NINE_YEAR_COMPONENTS,
  ALL_COMPONENT_CLASSIFICATIONS,
  BUILDING_SYSTEMS,
  OCCUPANCY_COMPONENT_ALLOCATIONS,
  getComponentClassification,
  getDefaultDepreciationClass,
  getComponentsByClass,
  getComponentsBySystem,
  getDepreciationClassInfo,
  getMACRSRate,
  getAccumulatedDepreciation,
  getRemainingBookValue,
  getOccupancyAllocation,
  calculateComponentCosts,
  calculateSiteImprovementCosts,
  calculateDepreciationClassSummary,
  type DepreciationClass,
  type ComponentCategory,
  type BuildingSystem,
  type ComponentClassification,
  type OccupancyComponentAllocation,
} from '../../constants/costSegregation';

// Re-export service functions
export {
  generateCostSegAnalysis,
  applyComponentOverride,
  resetAnalysisOverrides,
  getBonusDepreciationRate,
  formatCostSegCurrency,
  formatCostSegPercent,
  type GenerateCostSegInput,
} from '../../services/costSegregationService';

// Re-export hook
export { useCostSegAnalysis, type UseCostSegAnalysisReturn } from '../../hooks/useCostSegAnalysis';

