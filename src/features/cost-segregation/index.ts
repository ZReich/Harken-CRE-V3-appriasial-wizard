/**
 * Cost Segregation Feature
 * 
 * Standalone add-on report for IRS-compliant cost segregation analysis.
 */

// Types
export * from './types';

// Constants
export * from './constants';

// Services
export { 
  generateCostSegAnalysis, 
  hasCostApproachData,
  applyComponentOverride,
  updateTaxRate,
} from './services/costSegService';

// Hooks
export { useCostSegAnalysis } from './hooks/useCostSegAnalysis';
export { useCostSegReportState } from './hooks/useCostSegReportState';

// Components
export { CostSegTab } from './components/CostSegTab';
export { CostSegOverview } from './components/CostSegOverview';
export { ComponentClassifier } from './components/ComponentClassifier';
export { DepreciationSchedule } from './components/DepreciationSchedule';
export { CostSegReportEditor } from './components/CostSegReportEditor';

// Report Pages
export * from './components/pages';

// PDF Generator
export { generateCostSegPdf, generateCostSegPdfBlob, generateCostSegPdfDataUrl } from './utils/costSegPdfExporter';

