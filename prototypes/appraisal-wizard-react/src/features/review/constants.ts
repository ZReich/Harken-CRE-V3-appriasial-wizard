import type { ReviewTab, ReportSection, ScenarioType } from './types';
import { SCENARIO_COLORS } from './types';

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
    // Inline photo placement - allow photos within the property description
    allowInlinePhotos: true,
    photoSlots: [
      { id: 'prop_exterior_main', position: 'header', aspectRatio: '16/9', label: 'Primary Exterior', categoryFilter: 'exterior' },
      { id: 'prop_exterior_secondary', position: 'inline', aspectRatio: '4/3', label: 'Secondary Exterior', categoryFilter: 'exterior' },
      { id: 'prop_interior_1', position: 'inline', aspectRatio: '4/3', label: 'Interior Photo 1', categoryFilter: 'interior' },
      { id: 'prop_interior_2', position: 'inline', aspectRatio: '4/3', label: 'Interior Photo 2', categoryFilter: 'interior' },
    ],
  },
  {
    id: 'demographics-overview',
    label: 'Neighborhood Demographics',
    type: 'demographics-overview',
    sectionNumber: '02A',
    enabled: true,
    expanded: false,
    fields: [
      { id: 'demo_map', label: 'Radius Ring Map', enabled: true },
      { id: 'demo_highlights', label: 'Key Highlights', enabled: true },
    ],
  },
  {
    id: 'demographics-detail',
    label: 'Demographics Detail',
    type: 'demographics-detail',
    sectionNumber: '02A-2',
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
    // Optional inline photo for HBU context
    allowInlinePhotos: true,
    photoSlots: [
      { id: 'hbu_context_photo', position: 'footer', aspectRatio: '16/9', label: 'Context Photo' },
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
      { id: 'sales_photos', label: 'Comparable Photos', enabled: true, allowPhoto: true },
      { id: 'sales_conclusion', label: 'Value Conclusion', enabled: true },
    ],
    // Inline photos for comparable properties
    allowInlinePhotos: true,
    photoSlots: [
      { id: 'sales_comp_1', position: 'inline', aspectRatio: '4/3', label: 'Comparable 1' },
      { id: 'sales_comp_2', position: 'inline', aspectRatio: '4/3', label: 'Comparable 2' },
      { id: 'sales_comp_3', position: 'inline', aspectRatio: '4/3', label: 'Comparable 3' },
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
  {
    id: 'addenda',
    label: 'Addenda - Supporting Documents',
    type: 'addenda-list',
    sectionNumber: '11',
    enabled: true,
    expanded: false,
    fields: [
      { id: 'addenda_documents', label: 'Uploaded Documents', enabled: true },
    ],
  },
];

// =================================================================
// SCENARIO SECTION TEMPLATES
// =================================================================
// These templates are cloned for each active scenario (As Is, As Completed, As Stabilized)

/**
 * Creates a scenario header section for the sidebar
 */
export function createScenarioHeader(scenarioId: number, scenarioName: ScenarioType): ReportSection {
  return {
    id: `scenario-header-${scenarioId}`,
    label: `${scenarioName.toUpperCase()} VALUATION`,
    type: 'section',
    enabled: true,
    expanded: true,
    fields: [],
    isScenarioHeader: true,
    scenarioId,
    scenarioName,
    scenarioColor: SCENARIO_COLORS[scenarioName],
  };
}

/**
 * Template for Land Valuation sections within a scenario
 */
export const LAND_VALUATION_TEMPLATE: Omit<ReportSection, 'id' | 'scenarioId' | 'scenarioName'> = {
  label: 'Land Valuation',
  type: 'analysis-grid',
  sectionNumber: 'L',
  enabled: true,
  expanded: false,
  fields: [
    { id: 'land_methodology', label: 'Methodology', enabled: true },
    { id: 'land_grid', label: 'Adjustment Grid', enabled: true },
    { id: 'land_conclusion', label: 'Land Value Conclusion', enabled: true },
  ],
  requiresApproach: APPROACH_NAMES.LAND,
};

/**
 * Template for Sales Comparison sections within a scenario
 */
export const SALES_COMPARISON_TEMPLATE: Omit<ReportSection, 'id' | 'scenarioId' | 'scenarioName'> = {
  label: 'Sales Comparison Approach',
  type: 'analysis-grid',
  sectionNumber: 'S',
  enabled: true,
  expanded: false,
  fields: [
    { id: 'sales_methodology', label: 'Methodology', enabled: true },
    { id: 'sales_grid', label: 'Adjustment Grid', enabled: true },
    { id: 'sales_conclusion', label: 'Sales Value Conclusion', enabled: true },
  ],
  requiresApproach: APPROACH_NAMES.SALES,
  allowInlinePhotos: true,
  photoSlots: [
    { id: 'sales_comp_1', position: 'inline', aspectRatio: '4/3', label: 'Comparable 1' },
    { id: 'sales_comp_2', position: 'inline', aspectRatio: '4/3', label: 'Comparable 2' },
    { id: 'sales_comp_3', position: 'inline', aspectRatio: '4/3', label: 'Comparable 3' },
  ],
};

/**
 * Template for Income Approach sections within a scenario
 */
export const INCOME_APPROACH_TEMPLATE: Omit<ReportSection, 'id' | 'scenarioId' | 'scenarioName'> = {
  label: 'Income Approach',
  type: 'analysis-grid',
  sectionNumber: 'I',
  enabled: true,
  expanded: false,
  fields: [
    { id: 'income_methodology', label: 'Methodology', enabled: true },
    { id: 'income_rent_grid', label: 'Rent Comparable Grid', enabled: true },
    { id: 'income_proforma', label: 'Pro-Forma Analysis', enabled: true },
    { id: 'income_dcf', label: 'DCF Projections', enabled: true },
    { id: 'income_conclusion', label: 'Income Value Conclusion', enabled: true },
  ],
  requiresApproach: APPROACH_NAMES.INCOME,
};

/**
 * Template for Cost Approach sections within a scenario
 */
export const COST_APPROACH_TEMPLATE: Omit<ReportSection, 'id' | 'scenarioId' | 'scenarioName'> = {
  label: 'Cost Approach',
  type: 'analysis-grid',
  sectionNumber: 'C',
  enabled: true,
  expanded: false,
  fields: [
    { id: 'cost_land', label: 'Land Value', enabled: true },
    { id: 'cost_replacement', label: 'Replacement Cost', enabled: true },
    { id: 'cost_depreciation', label: 'Depreciation', enabled: true },
    { id: 'cost_conclusion', label: 'Cost Value Conclusion', enabled: true },
  ],
  requiresApproach: APPROACH_NAMES.COST,
};

/**
 * Template for Scenario Reconciliation section
 */
export const SCENARIO_RECONCILIATION_TEMPLATE: Omit<ReportSection, 'id' | 'scenarioId' | 'scenarioName'> = {
  label: 'Scenario Reconciliation',
  type: 'scenario-reconciliation',
  enabled: true,
  expanded: false,
  fields: [
    { id: 'recon_weights', label: 'Approach Weighting', enabled: true },
    { id: 'recon_conclusion', label: 'Scenario Value Conclusion', enabled: true },
  ],
};

// =================================================================
// COMPARABLE PAGE TEMPLATES
// =================================================================

/**
 * Template for comparable summary cards page (3 comps per page - ROVE style)
 */
export const COMPARABLE_CARDS_PAGE_TEMPLATE: Omit<ReportSection, 'id' | 'scenarioId' | 'scenarioName' | 'comparableType'> = {
  label: 'Comparable Summary',
  type: 'comparable-cards',
  enabled: true,
  expanded: false,
  fields: [
    { id: 'card_photo', label: 'Photo Thumbnail', enabled: true },
    { id: 'card_address', label: 'Address', enabled: true },
    { id: 'card_metrics', label: 'Key Metrics', enabled: true },
    { id: 'card_narrative', label: 'Brief Description', enabled: true },
  ],
};

/**
 * Template for individual comparable detail page (optional - institutional mode)
 */
export const COMPARABLE_DETAIL_PAGE_TEMPLATE: Omit<ReportSection, 'id' | 'scenarioId' | 'comparableId' | 'comparableType'> = {
  label: 'Comparable Detail',
  type: 'comparable-detail',
  enabled: true,
  expanded: false,
  fields: [
    { id: 'detail_photo', label: 'Large Photo', enabled: true },
    { id: 'detail_address', label: 'Full Address', enabled: true },
    { id: 'detail_transaction', label: 'Transaction Data', enabled: true },
    { id: 'detail_property', label: 'Property Details', enabled: true },
    { id: 'detail_narrative', label: 'Extended Comments', enabled: true },
  ],
  allowInlinePhotos: true,
  photoSlots: [
    { id: 'comp_main', position: 'header', aspectRatio: '16/9', label: 'Main Photo' },
    { id: 'comp_secondary', position: 'inline', aspectRatio: '4/3', label: 'Additional Photo' },
  ],
};

/**
 * Template for comparable location map page
 */
export const COMPARABLE_MAP_PAGE_TEMPLATE: Omit<ReportSection, 'id' | 'scenarioId' | 'mapImageUrl' | 'comparableType'> = {
  label: 'Comparable Location Map',
  type: 'comparable-map',
  enabled: true,
  expanded: false,
  fields: [
    { id: 'map_image', label: 'Map Image', enabled: true },
    { id: 'map_legend', label: 'Legend', enabled: true },
  ],
};

// =================================================================
// LEASE & DCF TEMPLATES
// =================================================================

/**
 * Template for lease abstraction page
 */
export const LEASE_ABSTRACTION_TEMPLATE: Omit<ReportSection, 'id' | 'leaseId'> = {
  label: 'Lease Abstraction',
  type: 'lease-abstraction',
  enabled: true,
  expanded: false,
  fields: [
    { id: 'lease_tenant', label: 'Tenant Information', enabled: true },
    { id: 'lease_premises', label: 'Premises Details', enabled: true },
    { id: 'lease_rent', label: 'Rent Schedule', enabled: true },
    { id: 'lease_escalations', label: 'Escalations', enabled: true },
    { id: 'lease_options', label: 'Options & TI', enabled: true },
  ],
};

/**
 * Template for DCF projection page
 */
export const DCF_PROJECTION_TEMPLATE: Omit<ReportSection, 'id' | 'scenarioId' | 'scenarioName'> = {
  label: 'DCF Analysis',
  type: 'dcf-projection',
  enabled: true,
  expanded: false,
  fields: [
    { id: 'dcf_assumptions', label: 'Assumptions', enabled: true },
    { id: 'dcf_projections', label: '10-Year Projections', enabled: true },
    { id: 'dcf_reversion', label: 'Reversion Calculation', enabled: true },
    { id: 'dcf_pv', label: 'Present Value Summary', enabled: true },
    { id: 'dcf_sensitivity', label: 'Sensitivity Matrix', enabled: true },
  ],
};

// =================================================================
// EXHIBIT TEMPLATES
// =================================================================

/**
 * Template for zoning exhibit page
 */
export const ZONING_EXHIBIT_TEMPLATE: ReportSection = {
  id: 'zoning-exhibit',
  label: 'Zoning Analysis',
  type: 'zoning-exhibit',
  enabled: true,
  expanded: false,
  fields: [
    { id: 'zoning_designation', label: 'Zoning Designation', enabled: true },
    { id: 'zoning_uses', label: 'Permitted Uses', enabled: true },
    { id: 'zoning_bulk', label: 'Bulk Regulations', enabled: true },
    { id: 'zoning_conformance', label: 'Conformance Status', enabled: true },
  ],
};

/**
 * Template for environmental exhibit page
 */
export const ENVIRONMENTAL_EXHIBIT_TEMPLATE: ReportSection = {
  id: 'environmental-exhibit',
  label: 'Environmental Summary',
  type: 'environmental-exhibit',
  enabled: true,
  expanded: false,
  fields: [
    { id: 'env_status', label: 'Environmental Status', enabled: true },
    { id: 'env_phase1', label: 'Phase I/II References', enabled: true },
    { id: 'env_flood', label: 'Flood Zone', enabled: true },
    { id: 'env_hazards', label: 'Hazard Disclosures', enabled: true },
  ],
};

// =================================================================
// SECTION GENERATION UTILITIES
// =================================================================

/**
 * Creates a complete set of sections for a scenario
 */
export function createScenarioSections(
  scenarioId: number,
  scenarioName: ScenarioType,
  enabledApproaches: string[]
): ReportSection[] {
  const sections: ReportSection[] = [];
  const color = SCENARIO_COLORS[scenarioName];
  
  // Scenario header
  sections.push(createScenarioHeader(scenarioId, scenarioName));
  
  // Land Valuation (if applicable)
  if (enabledApproaches.includes(APPROACH_NAMES.LAND)) {
    sections.push({
      ...LAND_VALUATION_TEMPLATE,
      id: `land-valuation-${scenarioId}`,
      scenarioId,
      scenarioName,
      scenarioColor: color,
    });
    
    // Land comparable cards page
    sections.push({
      ...COMPARABLE_CARDS_PAGE_TEMPLATE,
      id: `land-cards-${scenarioId}`,
      label: 'Land Comparable Summary',
      scenarioId,
      scenarioName,
      comparableType: 'land',
      parentSectionId: `land-valuation-${scenarioId}`,
    });
    
    // Land location map
    sections.push({
      ...COMPARABLE_MAP_PAGE_TEMPLATE,
      id: `land-map-${scenarioId}`,
      label: 'Land Sales Location Map',
      scenarioId,
      comparableType: 'land',
      parentSectionId: `land-valuation-${scenarioId}`,
    });
  }
  
  // Sales Comparison (if applicable)
  if (enabledApproaches.includes(APPROACH_NAMES.SALES)) {
    sections.push({
      ...SALES_COMPARISON_TEMPLATE,
      id: `sales-comparison-${scenarioId}`,
      scenarioId,
      scenarioName,
      scenarioColor: color,
    });
    
    // Sales comparable cards page
    sections.push({
      ...COMPARABLE_CARDS_PAGE_TEMPLATE,
      id: `sales-cards-${scenarioId}`,
      label: 'Sales Comparable Summary',
      scenarioId,
      scenarioName,
      comparableType: 'improved',
      parentSectionId: `sales-comparison-${scenarioId}`,
    });
    
    // Sales location map
    sections.push({
      ...COMPARABLE_MAP_PAGE_TEMPLATE,
      id: `sales-map-${scenarioId}`,
      label: 'Sales Comp Location Map',
      scenarioId,
      comparableType: 'improved',
      parentSectionId: `sales-comparison-${scenarioId}`,
    });
  }
  
  // Income Approach (if applicable)
  if (enabledApproaches.includes(APPROACH_NAMES.INCOME)) {
    sections.push({
      ...INCOME_APPROACH_TEMPLATE,
      id: `income-approach-${scenarioId}`,
      scenarioId,
      scenarioName,
      scenarioColor: color,
    });
    
    // Rent comparable cards page
    sections.push({
      ...COMPARABLE_CARDS_PAGE_TEMPLATE,
      id: `rent-cards-${scenarioId}`,
      label: 'Rent Comparable Summary',
      scenarioId,
      scenarioName,
      comparableType: 'rent',
      parentSectionId: `income-approach-${scenarioId}`,
    });
    
    // Rent location map
    sections.push({
      ...COMPARABLE_MAP_PAGE_TEMPLATE,
      id: `rent-map-${scenarioId}`,
      label: 'Rent Comp Location Map',
      scenarioId,
      comparableType: 'rent',
      parentSectionId: `income-approach-${scenarioId}`,
    });
    
    // DCF projection pages (added under income approach)
    sections.push({
      ...DCF_PROJECTION_TEMPLATE,
      id: `dcf-${scenarioId}`,
      scenarioId,
      scenarioName,
      parentSectionId: `income-approach-${scenarioId}`,
    });
  }
  
  // Cost Approach (if applicable)
  if (enabledApproaches.includes(APPROACH_NAMES.COST)) {
    sections.push({
      ...COST_APPROACH_TEMPLATE,
      id: `cost-approach-${scenarioId}`,
      scenarioId,
      scenarioName,
      scenarioColor: color,
    });
  }
  
  // Scenario reconciliation
  sections.push({
    ...SCENARIO_RECONCILIATION_TEMPLATE,
    id: `reconciliation-${scenarioId}`,
    label: `${scenarioName} Reconciliation`,
    scenarioId,
    scenarioName,
    scenarioColor: color,
  });
  
  return sections;
}

/**
 * Creates lease abstraction sections for all tenants
 */
export function createLeaseAbstractionSections(
  tenants: Array<{ id: string; name: string }>,
  parentSectionId: string
): ReportSection[] {
  return tenants.map((tenant) => ({
    ...LEASE_ABSTRACTION_TEMPLATE,
    id: `lease-${tenant.id}`,
    label: `Lease: ${tenant.name}`,
    leaseId: tenant.id,
    parentSectionId,
  }));
}
