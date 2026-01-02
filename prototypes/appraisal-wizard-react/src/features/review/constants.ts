import type { ReviewTab, ReportSection } from './types';

// =================================================================
// REVIEW TABS
// =================================================================
// Order: HBU → Reconciliation → Checklist → Preview
// This follows the logical appraisal workflow:
// 1. Establish Highest & Best Use (foundational analysis)
// 2. Reconcile value indications (core conclusion)
// 3. Verify completion (quality control gate)
// 4. Preview and finalize (submit)

export const REVIEW_TABS: ReviewTab[] = [
  { id: 'hbu', label: 'Highest & Best Use', icon: 'hbu' },
  { id: 'reconciliation', label: 'Value Reconciliation', icon: 'chart' },
  { id: 'checklist', label: 'Completion Checklist', icon: 'checklist' },
  { id: 'preview', label: 'Report Preview', icon: 'document' },
];

// =================================================================
// APPROACH NAMES (must match what's stored in scenarios)
// =================================================================

export const APPROACH_NAMES = {
  SALES: 'Sales Comparison',
  INCOME: 'Income Approach',
  COST: 'Cost Approach',
  MULTI_FAMILY: 'Multi-Family Approach',
  LAND: 'Land Valuation',
} as const;

export const ALL_APPROACHES = [
  APPROACH_NAMES.SALES,
  APPROACH_NAMES.INCOME,
  APPROACH_NAMES.COST,
  APPROACH_NAMES.MULTI_FAMILY,
  APPROACH_NAMES.LAND,
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
  [APPROACH_NAMES.MULTI_FAMILY]: {
    bg: 'bg-violet-50',
    text: 'text-violet-600',
    border: 'border-violet-200',
  },
  [APPROACH_NAMES.LAND]: {
    bg: 'bg-lime-50',
    text: 'text-lime-600',
    border: 'border-lime-200',
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
    id: 'letter',
    label: 'Letter of Transmittal',
    type: 'letter',
    enabled: true,
    expanded: false,
    fields: [
      { id: 'letter_client', label: 'Client Information', enabled: true },
      { id: 'letter_body', label: 'Letter Body', enabled: true },
      { id: 'letter_value', label: 'Value Conclusion', enabled: true },
      { id: 'letter_signature', label: 'Appraiser Signature', enabled: true },
    ],
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
    id: 'executive-summary',
    label: 'Executive Summary',
    type: 'summary-table',
    sectionNumber: '01',
    enabled: true,
    expanded: false,
    fields: [
      { id: 'exec_property', label: 'Property Identification', enabled: true },
      { id: 'exec_values', label: 'Value Conclusions', enabled: true },
      { id: 'exec_dates', label: 'Key Dates', enabled: true },
    ],
  },
  {
    id: 'risk-rating',
    label: 'Investment Risk Analysis',
    type: 'risk-rating',
    sectionNumber: '01A',
    enabled: true,
    expanded: false,
    fields: [
      { id: 'risk_grade', label: 'Overall Grade', enabled: true },
      { id: 'risk_dimensions', label: 'Risk Dimensions', enabled: true },
      { id: 'risk_disclosure', label: 'USPAP Disclosure', enabled: true },
    ],
  },
  {
    id: 'property-description',
    label: 'Property Description',
    type: 'narrative',
    sectionNumber: '02',
    enabled: true,
    expanded: false,
    fields: [
      { id: 'prop_site', label: 'Site Description', enabled: true },
      { id: 'prop_improvements', label: 'Improvements', enabled: true },
      { id: 'prop_photos', label: 'Property Photos', enabled: true },
    ],
  },
  {
    id: 'demographics',
    label: 'Neighborhood Demographics',
    type: 'demographics',
    sectionNumber: '02A',
    enabled: true,
    expanded: false,
    fields: [
      { id: 'demo_population', label: 'Population & Households', enabled: true },
      { id: 'demo_income', label: 'Income Statistics', enabled: true },
      { id: 'demo_employment', label: 'Employment Data', enabled: true },
    ],
  },
  {
    id: 'economic-context',
    label: 'Economic Context',
    type: 'economic-context',
    sectionNumber: '02B',
    enabled: true,
    expanded: false,
    fields: [
      { id: 'econ_rates', label: 'Interest Rates', enabled: true },
      { id: 'econ_indicators', label: 'Economic Indicators', enabled: true },
    ],
  },
  {
    id: 'market-analysis',
    label: 'Market Analysis',
    type: 'narrative',
    sectionNumber: '02C',
    enabled: true,
    expanded: false,
    fields: [
      { id: 'market_cycle', label: 'Market Cycle Stage', enabled: true },
      { id: 'market_supply_demand', label: 'Supply & Demand', enabled: true },
      { id: 'market_trends', label: 'Market Trends', enabled: true },
    ],
  },
  {
    id: 'hbu',
    label: 'Highest & Best Use',
    type: 'narrative',
    sectionNumber: '03',
    enabled: true,
    expanded: false,
    fields: [
      { id: 'hbu_vacant', label: 'As Vacant Analysis', enabled: true },
      { id: 'hbu_improved', label: 'As Improved Analysis', enabled: true },
    ],
  },
  {
    id: 'swot',
    label: 'SWOT Analysis',
    type: 'swot',
    sectionNumber: '03A',
    enabled: true,
    expanded: false,
    fields: [
      { id: 'swot_strengths', label: 'Strengths', enabled: true },
      { id: 'swot_weaknesses', label: 'Weaknesses', enabled: true },
      { id: 'swot_opportunities', label: 'Opportunities', enabled: true },
      { id: 'swot_threats', label: 'Threats', enabled: true },
    ],
  },
];

// =================================================================
// APPROACH-SPECIFIC SECTIONS
// =================================================================

export const APPROACH_REPORT_SECTIONS: Record<string, ReportSection> = {
  [APPROACH_NAMES.SALES]: {
    id: 'sales-comparison',
    label: 'Sales Comparison Approach',
    type: 'analysis-grid',
    sectionNumber: '04',
    enabled: true,
    expanded: false,
    requiresApproach: APPROACH_NAMES.SALES,
    fields: [
      { id: 'sales_methodology', label: 'Methodology', enabled: true },
      { id: 'sales_grid', label: 'Comparison Grid', enabled: true },
      { id: 'sales_photos', label: 'Comparable Photos', enabled: true },
      { id: 'sales_conclusion', label: 'Value Conclusion', enabled: true },
    ],
  },
  [APPROACH_NAMES.INCOME]: {
    id: 'income-approach',
    label: 'Income Approach',
    type: 'analysis-grid',
    sectionNumber: '05',
    enabled: true,
    expanded: false,
    requiresApproach: APPROACH_NAMES.INCOME,
    fields: [
      { id: 'income_methodology', label: 'Methodology', enabled: true },
      { id: 'income_analysis', label: 'Income Analysis', enabled: true },
      { id: 'income_conclusion', label: 'Value Conclusion', enabled: true },
    ],
  },
  [APPROACH_NAMES.COST]: {
    id: 'cost-approach',
    label: 'Cost Approach',
    type: 'analysis-grid',
    sectionNumber: '06',
    enabled: true,
    expanded: false,
    requiresApproach: APPROACH_NAMES.COST,
    fields: [
      { id: 'cost_land', label: 'Land Valuation', enabled: true },
      { id: 'cost_analysis', label: 'Cost Analysis', enabled: true },
      { id: 'cost_depreciation', label: 'Depreciation', enabled: true },
      { id: 'cost_conclusion', label: 'Value Conclusion', enabled: true },
    ],
  },
  [APPROACH_NAMES.MULTI_FAMILY]: {
    id: 'multi-family-approach',
    label: 'Multi-Family Approach',
    type: 'analysis-grid',
    sectionNumber: '07',
    enabled: true,
    expanded: false,
    requiresApproach: APPROACH_NAMES.MULTI_FAMILY,
    fields: [
      { id: 'mf_methodology', label: 'Methodology', enabled: true },
      { id: 'mf_rental_comps', label: 'Rental Comparables', enabled: true },
      { id: 'mf_adjustments', label: 'Adjustments Grid', enabled: true },
      { id: 'mf_conclusion', label: 'Value Conclusion', enabled: true },
    ],
  },
  [APPROACH_NAMES.LAND]: {
    id: 'land-valuation',
    label: 'Land Valuation',
    type: 'analysis-grid',
    sectionNumber: '08',
    enabled: true,
    expanded: false,
    requiresApproach: APPROACH_NAMES.LAND,
    fields: [
      { id: 'land_methodology', label: 'Methodology', enabled: true },
      { id: 'land_comps', label: 'Land Comparables', enabled: true },
      { id: 'land_conclusion', label: 'Value Conclusion', enabled: true },
    ],
  },
};

// =================================================================
// CLOSING SECTIONS (always present)
// =================================================================

export const CLOSING_REPORT_SECTIONS: ReportSection[] = [
  {
    id: 'reconciliation',
    label: 'Reconciliation of Value',
    type: 'narrative',
    sectionNumber: '07',
    enabled: true,
    expanded: false,
    fields: [
      { id: 'recon_approaches', label: 'Value Indications', enabled: true },
      { id: 'recon_narrative', label: 'Reconciliation Narrative', enabled: true },
      { id: 'recon_final', label: 'Final Value Conclusion', enabled: true },
    ],
  },
  {
    id: 'assumptions',
    label: 'Assumptions & Limiting Conditions',
    type: 'narrative',
    sectionNumber: '08',
    enabled: true,
    expanded: false,
    fields: [
      { id: 'assumptions_general', label: 'General Assumptions', enabled: true },
      { id: 'assumptions_limiting', label: 'Limiting Conditions', enabled: true },
    ],
  },
  {
    id: 'certification',
    label: 'Appraiser Certification',
    type: 'narrative',
    sectionNumber: '09',
    enabled: true,
    expanded: false,
    fields: [
      { id: 'cert_statement', label: 'Certification Statement', enabled: true },
      { id: 'cert_signature', label: 'Appraiser Signature', enabled: true },
    ],
  },
  {
    id: 'exhibits',
    label: 'Photo Exhibits',
    type: 'photo-grid',
    sectionNumber: '10',
    enabled: true,
    expanded: false,
    fields: [
      { id: 'exhibits_subject', label: 'Subject Property Photos', enabled: true },
      { id: 'exhibits_aerials', label: 'Aerial Photos', enabled: true },
      { id: 'exhibits_maps', label: 'Location Maps', enabled: true },
    ],
  },
];

