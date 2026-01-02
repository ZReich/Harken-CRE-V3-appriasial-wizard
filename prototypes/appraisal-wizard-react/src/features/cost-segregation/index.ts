/**
 * Cost Segregation Feature Module
 * 
 * Provides IRS-compliant cost segregation analysis functionality
 * including component classification, building systems valuation,
 * depreciation schedule generation, and comprehensive guidance.
 */

// =================================================================
// MAIN COMPONENTS
// =================================================================

export { CostSegOverview } from './components/CostSegOverview';
export { ComponentClassifier } from './components/ComponentClassifier';
export { BuildingSystems } from './components/BuildingSystems';
export { DepreciationSchedule } from './components/DepreciationSchedule';
export { CostSegTab } from './components/CostSegTab';
export { CostSegReportEditor } from './components/CostSegReportEditor';
export { CostSegFullReportEditor } from './components/CostSegFullReportEditor';

// =================================================================
// GUIDANCE COMPONENTS
// =================================================================

export { BonusDepreciationGuidance } from './components/BonusDepreciationGuidance';
export { ClassificationGuidance } from './components/ClassificationGuidance';

// =================================================================
// REPORT PAGE COMPONENTS
// =================================================================

export {
  CostSegCoverPage,
  CostSegSummaryPage,
  CostSegMethodologyPage,
  CostSegComponentsPage,
  CostSegSchedulePage,
  CostSegBuildingSystemsPage,
  CostSegDisclaimerPage,
} from './components/pages';

// =================================================================
// HOOKS
// =================================================================

export { useCostSegReportState, type UseCostSegReportStateReturn, type ReportSection, type CostSegReportSettings } from './hooks/useCostSegReportState';

// =================================================================
// UTILITIES
// =================================================================

export { exportCostSegToPdf, type ExportOptions } from './utils/costSegPdfExporter';

// =================================================================
// RE-EXPORTS FROM SHARED LOCATIONS
// =================================================================

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

// Re-export CSSI-style constants
export {
  CSSI_COMPONENT_NAMES,
  MS_COST_SEG_ALLOCATIONS,
  LAND_IMPROVEMENT_CSSI_COMPONENTS,
  CSSI_BUILDING_SYSTEMS,
  COMPONENT_TO_CSSI_SYSTEM,
  getCSSIComponentName,
  getCSSIBuildingSystem,
  getMSCostSegAllocations,
  IRS_REFERENCES,
  COURT_CASE_REFERENCES,
  METHODOLOGY_TEXT,
  type CostSegAllocation,
  type CSSIBuildingSystem,
} from '../../constants/costSegCSSI';

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
