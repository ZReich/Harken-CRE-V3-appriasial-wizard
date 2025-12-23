import type { PhotoUploadSlot, PageDimensions, SpacingRules, SectionBoundary } from './types';

// =================================================================
// PHOTO UPLOAD CONFIGURATION
// =================================================================

export const PHOTO_SLOTS: PhotoUploadSlot[] = [
  { id: 'aerial', category: 'aerial', label: 'Aerial View', required: true, minCount: 1, maxCount: 1 },
  { id: 'exterior', category: 'exterior', label: 'Exterior Photos', required: true, minCount: 4, maxCount: 12 },
  { id: 'interior', category: 'interior', label: 'Interior Photos', required: false, minCount: 0, maxCount: 20 },
  { id: 'site', category: 'site', label: 'Site/Yard Photos', required: false, minCount: 0, maxCount: 8 },
  { id: 'street', category: 'street', label: 'Street/Access Views', required: true, minCount: 2, maxCount: 4 },
  { id: 'neighborhood', category: 'neighborhood', label: 'Neighborhood Photos', required: false, minCount: 0, maxCount: 6 },
];

// =================================================================
// PAGE LAYOUT CONSTANTS
// =================================================================

/** Standard US Letter page dimensions in points (72 points = 1 inch) */
export const PAGE_DIMENSIONS: PageDimensions = {
  width: 612,   // 8.5 inches
  height: 792,  // 11 inches
  margins: {
    top: 72,      // 1 inch - room for running header
    bottom: 54,   // 0.75 inch - room for page number
    left: 72,     // 1 inch
    right: 72,    // 1 inch
  },
  contentArea: {
    width: 468,   // 6.5 inches
    height: 666,  // 9.25 inches
  },
};

// =================================================================
// SPACING RULES
// =================================================================

export const SPACING_RULES: SpacingRules = {
  minSpacing: {
    betweenParagraphs: 12,      // 1 line
    afterHeading: 6,            // Half line
    beforeHeading: 18,          // 1.5 lines
    betweenTableRows: 2,
    betweenPhotos: 8,
    photoCaptionGap: 4,
    sectionDivider: 24,         // 2 lines before new section
  },
  maxLengths: {
    paragraphBeforeBreak: 800,  // Characters before suggesting split
    tableRowsPerPage: 25,       // Force page break after
    photosPerPage: 6,           // Grid limit
  },
};

// =================================================================
// SECTION BOUNDARIES
// =================================================================

export const SECTION_BOUNDARIES: Record<string, SectionBoundary> = {
  'letter-of-transmittal': {
    beforeSection: { pageBreakRequired: true, minSpaceRequired: 0, insertSectionHeader: false },
    afterSection: { preventOrphanContent: true, minContentOnPage: 144 },
  },
  'summary-of-appraisal': {
    beforeSection: { pageBreakRequired: true, minSpaceRequired: 0, insertSectionHeader: false },
    afterSection: { preventOrphanContent: true, minContentOnPage: 144 },
  },
  'site-analysis': {
    beforeSection: { pageBreakRequired: false, minSpaceRequired: 216, insertSectionHeader: true },
    afterSection: { preventOrphanContent: true, minContentOnPage: 108 },
  },
  'improvement-analysis': {
    beforeSection: { pageBreakRequired: false, minSpaceRequired: 216, insertSectionHeader: true },
    afterSection: { preventOrphanContent: true, minContentOnPage: 108 },
  },
  'highest-best-use': {
    beforeSection: { pageBreakRequired: true, minSpaceRequired: 0, insertSectionHeader: true },
    afterSection: { preventOrphanContent: true, minContentOnPage: 144 },
  },
  'cost-approach': {
    beforeSection: { pageBreakRequired: true, minSpaceRequired: 0, insertSectionHeader: true },
    afterSection: { preventOrphanContent: true, minContentOnPage: 144 },
  },
  'sales-comparison': {
    beforeSection: { pageBreakRequired: true, minSpaceRequired: 0, insertSectionHeader: true },
    afterSection: { preventOrphanContent: true, minContentOnPage: 144 },
  },
  'income-approach': {
    beforeSection: { pageBreakRequired: true, minSpaceRequired: 0, insertSectionHeader: true },
    afterSection: { preventOrphanContent: true, minContentOnPage: 144 },
  },
  'reconciliation': {
    beforeSection: { pageBreakRequired: true, minSpaceRequired: 0, insertSectionHeader: true },
    afterSection: { preventOrphanContent: true, minContentOnPage: 144 },
  },
  'certification': {
    beforeSection: { pageBreakRequired: true, minSpaceRequired: 0, insertSectionHeader: false },
    afterSection: { preventOrphanContent: true, minContentOnPage: 144 },
  },
  'addenda': {
    beforeSection: { pageBreakRequired: true, minSpaceRequired: 0, insertSectionHeader: true },
    afterSection: { preventOrphanContent: false, minContentOnPage: 0 },
  },
};

// =================================================================
// SPLIT RULES FOR CONTENT
// =================================================================

export const SPLIT_RULES = {
  paragraph: {
    canSplit: true,
    preferSplitAt: 'sentence-end' as const,
    fallbackSplitAt: 'line-end' as const,
    minLinesFirstPage: 3,
    minLinesSecondPage: 2,
  },
  heading: {
    canSplit: false,
    keepWithNext: true,
    minSpaceForNext: 72,
  },
  table: {
    canSplit: true,
    repeatHeaderOnSplit: true,
    minRowsFirstPage: 3,
    minRowsSecondPage: 2,
    neverSplitRow: true,
  },
  image: {
    canSplit: false,
    shrinkToFit: true,
    maxShrinkPercent: 75,
    moveToNextIfWontFit: true,
  },
  photoGrid: {
    canSplit: false,
    moveToNextIfWontFit: true,
  },
  list: {
    canSplit: true,
    preferSplitAt: 'list-item' as const,
    minItemsFirstPage: 2,
    minItemsSecondPage: 2,
  },
};

// =================================================================
// CONTINUATION STYLES
// =================================================================

export const CONTINUATION_STYLE = {
  textContinuation: {
    showIndicator: true,
    indicatorText: '(continued on next page)',
    indicatorPosition: 'bottom-right' as const,
    nextPageHeader: '(continued)',
  },
  tableContinuation: {
    showIndicator: true,
    indicatorText: '(table continues on next page)',
    repeatHeader: true,
    headerSuffix: ' (cont.)',
  },
  sectionContinuation: {
    repeatSectionTitle: false,
    showRunningHeader: true,
  },
};

// =================================================================
// REPORT SECTION DEFINITIONS
// =================================================================

export const BASE_REPORT_SECTIONS = [
  { id: 'cover', title: 'Cover Page', required: true },
  { id: 'letter', title: 'Letter of Transmittal', required: true },
  { id: 'toc', title: 'Table of Contents', required: true },
  { id: 'executive-summary', title: 'Summary of Appraisal', required: true },
  { id: 'property-summary', title: 'Property Summary', required: true },
  { id: 'area-analysis', title: 'General Area Analysis', required: true },
  { id: 'neighborhood', title: 'Neighborhood Analysis', required: true },
  { id: 'site-analysis', title: 'Site Analysis', required: true },
  { id: 'improvement-analysis', title: 'Improvement Analysis', required: false }, // Not for land
  { id: 'taxes', title: 'Tax Analysis', required: true },
  { id: 'ownership', title: 'Property Ownership', required: true },
  { id: 'highest-best-use', title: 'Highest and Best Use', required: true },
];

export const APPROACH_SECTIONS = {
  'Cost Approach': [
    { id: 'cost-approach', title: 'Cost Approach', required: true },
  ],
  'Sales Comparison': [
    { id: 'sales-comparison', title: 'Sales Comparison Approach', required: true },
  ],
  'Income Approach': [
    { id: 'income-approach', title: 'Income Approach', required: true },
  ],
};

export const CLOSING_SECTIONS = [
  { id: 'reconciliation', title: 'Reconciliation', required: true },
  { id: 'certification', title: 'Certification', required: true },
  { id: 'assumptions', title: 'Assumptions & Limiting Conditions', required: true },
  { id: 'qualifications', title: 'Appraiser Qualifications', required: true },
  { id: 'addenda', title: 'Addenda', required: true },
];

// =================================================================
// EDITOR DEFAULTS
// =================================================================

export const DEFAULT_EDITOR_STATE = {
  mode: 'view' as const,
  selectedElement: null,
  inlineEditor: null,
  zoom: 100,
  currentPage: 1,
  showGrid: false,
  showSpacingGuides: false,
};

export const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];

export const DEBOUNCE_DELAYS = {
  textEdit: 1000,
  autoSave: 30000,
  layoutValidation: 500,
};

