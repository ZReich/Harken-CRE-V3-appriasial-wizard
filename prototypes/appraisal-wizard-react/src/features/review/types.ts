// =================================================================
// REVIEW PAGE TYPES
// =================================================================

export type ReviewTabId = 'hbu' | 'swot' | 'risk-rating' | 'cost-seg' | 'market-analysis' | 'reconciliation' | 'checklist' | 'preview';

export interface ReviewTab {
  id: ReviewTabId;
  label: string;
  icon: 'hbu' | 'chart' | 'checklist' | 'document';
}

// =================================================================
// RECONCILIATION TYPES
// =================================================================

export interface ScenarioReconciliation {
  scenarioId: number;
  weights: {
    [approachName: string]: number; // e.g., { 'Sales Comparison': 40, 'Income Approach': 60 }
  };
  comments: string;
}

export interface ReconciliationData {
  scenarioReconciliations: ScenarioReconciliation[];
  exposurePeriod: number | null;
  marketingTime: number | null;
  exposureRationale: string;
  certifications: string[];
}

export interface ApproachValue {
  approachName: string;
  scenarioId: number;
  value: number | null;
  isApplicable: boolean;
}

// =================================================================
// REPORT EDITOR TYPES
// =================================================================

export interface ReportSection {
  id: string;
  label: string;
  type: 'cover' | 'section' | 'toc' | 'letter' | 'summary-table' | 'narrative' | 'analysis-grid' | 'photo-grid' | 'map' | 'document' | 'addenda-header' | 'risk-rating' | 'demographics' | 'economic-context' | 'swot';
  sectionNumber?: string;
  enabled: boolean;
  expanded: boolean;
  fields: ReportField[];
  // Dynamic: only show if approach is selected
  requiresApproach?: string;
}

export interface ReportField {
  id: string;
  label: string;
  enabled: boolean;
}

export interface EditableElement {
  id: string;
  type: 'text' | 'image' | 'section';
  pageId: string;
  fieldId: string;
  content: string;
  styles: ElementStyles;
}

export interface ElementStyles {
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  marginTop?: number;
  marginBottom?: number;
}

export interface TextBlock {
  id: string;
  pageId: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  styles: ElementStyles;
  hasBorder: boolean;
}

// =================================================================
// PROPERTY PANEL TYPES
// =================================================================

export type PropertyTabId = 'design' | 'content' | 'advanced';

export interface PropertyTab {
  id: PropertyTabId;
  label: string;
}

// =================================================================
// CERTIFICATION TYPES
// =================================================================

export interface Certification {
  id: string;
  text: string;
}

export const DEFAULT_CERTIFICATIONS: Certification[] = [
  {
    id: 'cert_1',
    text: 'I certify that the statements of fact contained in this report are true and correct',
  },
  {
    id: 'cert_2',
    text: 'I certify that the analyses, opinions, and conclusions are limited only by the assumptions and limiting conditions stated in this report',
  },
  {
    id: 'cert_3',
    text: 'I certify that I have no present or prospective interest in the property',
  },
  {
    id: 'cert_4',
    text: 'I certify that I have performed no services regarding the property within the three-year period immediately preceding acceptance of this assignment',
  },
];

