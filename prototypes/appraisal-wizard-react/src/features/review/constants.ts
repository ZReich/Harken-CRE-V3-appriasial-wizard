import type { ReviewTab, ReportSection } from './types';

// =================================================================
// REVIEW TABS
// =================================================================

export const REVIEW_TABS: ReviewTab[] = [
  { id: 'checklist', label: 'Completion Checklist', icon: 'checklist' },
  { id: 'reconciliation', label: 'Value Reconciliation', icon: 'chart' },
  { id: 'preview', label: 'Report Preview', icon: 'document' },
];

// =================================================================
// APPROACH NAMES (must match what's stored in scenarios)
// =================================================================

export const APPROACH_NAMES = {
  SALES: 'Sales Comparison',
  INCOME: 'Income Approach',
  COST: 'Cost Approach',
} as const;

export const ALL_APPROACHES = [
  APPROACH_NAMES.SALES,
  APPROACH_NAMES.INCOME,
  APPROACH_NAMES.COST,
];

// =================================================================
// APPROACH COLORS
// =================================================================

export const APPROACH_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  [APPROACH_NAMES.SALES]: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  [APPROACH_NAMES.INCOME]: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
  },
  [APPROACH_NAMES.COST]: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
  },
};

// =================================================================
// BASE REPORT SECTIONS (always present)
// =================================================================

export const BASE_REPORT_SECTIONS: ReportSection[] = [
  {
    id: 'cover',
    label: 'Cover Page',
    type: 'cover',
    enabled: true,
    expanded: false,
    fields: [
      { id: 'cover_title', label: 'Property Title', enabled: true },
      { id: 'cover_address', label: 'Property Address', enabled: true },
      { id: 'cover_image', label: 'Cover Photo', enabled: true },
      { id: 'cover_footer', label: 'Footer Bar', enabled: true },
    ],
  },
  {
    id: 'loe',
    label: 'Letter of Engagement',
    type: 'section',
    enabled: true,
    expanded: false,
    fields: [{ id: 'loe_letter', label: 'Full Engagement Letter', enabled: true }],
  },
  {
    id: 'toc',
    label: 'Table of Contents',
    type: 'toc',
    enabled: true,
    expanded: false,
    fields: [{ id: 'toc_auto', label: 'Auto-generated TOC', enabled: true }],
  },
  {
    id: 'exec_summary',
    label: 'Section 01: Executive Summary',
    type: 'section',
    sectionNumber: '01',
    enabled: true,
    expanded: false,
    fields: [
      { id: 'exec_inspection_date', label: 'Date of Inspection/Effective Date', enabled: true },
      { id: 'exec_inspector', label: 'Inspector Name', enabled: true },
      { id: 'exec_intended_users', label: 'Intended User(s)', enabled: true },
      { id: 'exec_intended_use', label: 'Intended Use', enabled: true },
      { id: 'exec_client', label: 'Client Information', enabled: true },
      { id: 'exec_market_value', label: 'Final Market Value', enabled: true },
    ],
  },
  {
    id: 'property_summary',
    label: 'Section 02: Property Summary',
    type: 'section',
    sectionNumber: '02',
    enabled: true,
    expanded: false,
    fields: [
      { id: 'prop_overview', label: 'Overview', enabled: true },
      { id: 'prop_address', label: 'Address Details', enabled: true },
      { id: 'prop_site_specs', label: 'Site Specifications', enabled: true },
      { id: 'prop_construction', label: 'Construction Components', enabled: true },
    ],
  },
];

// =================================================================
// APPROACH-SPECIFIC SECTIONS
// =================================================================

export const APPROACH_REPORT_SECTIONS: Record<string, ReportSection> = {
  [APPROACH_NAMES.SALES]: {
    id: 'sales_comparison',
    label: 'Section 03: Sales Comparison Approach',
    type: 'section',
    sectionNumber: '03',
    enabled: true,
    expanded: false,
    requiresApproach: APPROACH_NAMES.SALES,
    fields: [
      { id: 'sales_methodology', label: 'Methodology', enabled: true },
      { id: 'sales_comps', label: 'Comparable Sales', enabled: true },
      { id: 'sales_adjustments', label: 'Adjustments Grid', enabled: true },
      { id: 'sales_conclusion', label: 'Value Conclusion', enabled: true },
    ],
  },
  [APPROACH_NAMES.INCOME]: {
    id: 'income_approach',
    label: 'Section 04: Income Approach',
    type: 'section',
    sectionNumber: '04',
    enabled: true,
    expanded: false,
    requiresApproach: APPROACH_NAMES.INCOME,
    fields: [
      { id: 'income_methodology', label: 'Methodology', enabled: true },
      { id: 'income_proforma', label: 'Pro Forma Analysis', enabled: true },
      { id: 'income_cap_rate', label: 'Capitalization Rate', enabled: true },
      { id: 'income_dcf', label: 'DCF Analysis', enabled: true },
      { id: 'income_conclusion', label: 'Value Conclusion', enabled: true },
    ],
  },
  [APPROACH_NAMES.COST]: {
    id: 'cost_approach',
    label: 'Section 05: Cost Approach',
    type: 'section',
    sectionNumber: '05',
    enabled: true,
    expanded: false,
    requiresApproach: APPROACH_NAMES.COST,
    fields: [
      { id: 'cost_methodology', label: 'Methodology', enabled: true },
      { id: 'cost_land_value', label: 'Land Valuation', enabled: true },
      { id: 'cost_improvements', label: 'Improvement Costs', enabled: true },
      { id: 'cost_depreciation', label: 'Depreciation', enabled: true },
      { id: 'cost_conclusion', label: 'Value Conclusion', enabled: true },
    ],
  },
};

// =================================================================
// CLOSING SECTIONS (always present)
// =================================================================

export const CLOSING_REPORT_SECTIONS: ReportSection[] = [
  {
    id: 'reconciliation',
    label: 'Section 06: Reconciliation',
    type: 'section',
    sectionNumber: '06',
    enabled: true,
    expanded: false,
    fields: [
      { id: 'recon_summary', label: 'Value Summary', enabled: true },
      { id: 'recon_weights', label: 'Approach Weights', enabled: true },
      { id: 'recon_conclusion', label: 'Final Conclusion', enabled: true },
    ],
  },
  {
    id: 'assumptions',
    label: 'Section 07: Assumptions & Limiting Conditions',
    type: 'section',
    sectionNumber: '07',
    enabled: true,
    expanded: false,
    fields: [{ id: 'assumptions_list', label: 'Assumptions & Limiting Conditions', enabled: true }],
  },
  {
    id: 'certification',
    label: 'Section 08: Certification',
    type: 'section',
    sectionNumber: '08',
    enabled: true,
    expanded: false,
    fields: [{ id: 'cert_statement', label: 'Certification Statement', enabled: true }],
  },
  {
    id: 'exhibits',
    label: 'Section 09: Exhibits',
    type: 'section',
    sectionNumber: '09',
    enabled: true,
    expanded: false,
    fields: [{ id: 'exhibits_list', label: 'Exhibits & Supporting Documents', enabled: true }],
  },
];

