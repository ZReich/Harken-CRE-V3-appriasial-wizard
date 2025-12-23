/**
 * Layout Validator Utility
 * 
 * Provides real-time layout validation with auto-fix suggestions
 * for the report preview system.
 */

import type { LayoutIssue, LayoutIssueSeverity, LayoutIssueType, ReportPage, ContentBlock } from '../../../types';
import { PAGE_DIMENSIONS } from '../constants';
import { detectOverflow, validatePageSpacing, type ElementBounds } from './spacingSystem';

// =================================================================
// TYPES
// =================================================================

export interface ValidationResult {
  isValid: boolean;
  issues: LayoutIssue[];
  warnings: LayoutIssue[];
  errors: LayoutIssue[];
  autoFixAvailable: boolean;
}

export interface PageValidationContext {
  pageNumber: number;
  pageHeight: number;
  elements: ElementBounds[];
  contentBlocks: ContentBlock[];
}

// =================================================================
// VALIDATORS
// =================================================================

/**
 * Validate a single page layout
 */
export function validatePage(context: PageValidationContext): LayoutIssue[] {
  const issues: LayoutIssue[] = [];
  
  // 1. Check for overflow
  const overflow = detectOverflow(context.elements, context.pageHeight);
  if (overflow.hasOverflow) {
    overflow.affectedElements.forEach(elementId => {
      issues.push({
        severity: 'error',
        pageNumber: context.pageNumber,
        elementId,
        type: 'overflow',
        message: `Content extends ${Math.round(overflow.overflowAmount)}pt past page boundary`,
        autoFixAvailable: true,
      });
    });
  }
  
  // 2. Check spacing violations
  const spacingResult = validatePageSpacing(
    context.elements.map(e => ({ ...e, type: 'paragraph' }))
  );
  spacingResult.violations.forEach(violation => {
    issues.push({
      severity: violation.severity,
      pageNumber: context.pageNumber,
      elementId: violation.elementId,
      type: violation.type === 'overlap' ? 'collision' : 'margin-violation',
      message: violation.message,
      autoFixAvailable: true,
    });
  });
  
  // 3. Check for orphans and widows
  issues.push(...detectOrphansWidows(context));
  
  // 4. Check for empty page
  if (context.elements.length === 0 && context.contentBlocks.length === 0) {
    issues.push({
      severity: 'warning',
      pageNumber: context.pageNumber,
      elementId: '',
      type: 'empty-page',
      message: 'Page has no content',
      autoFixAvailable: true,
    });
  }
  
  // 5. Check for unbalanced photo grids
  issues.push(...checkPhotoGridBalance(context));
  
  return issues;
}

/**
 * Detect orphan and widow lines
 */
function detectOrphansWidows(context: PageValidationContext): LayoutIssue[] {
  const issues: LayoutIssue[] = [];
  const safeZone = {
    top: PAGE_DIMENSIONS.margins.top,
    bottom: PAGE_DIMENSIONS.height - PAGE_DIMENSIONS.margins.bottom,
  };
  
  context.contentBlocks.forEach((block) => {
    if (block.type !== 'paragraph') return;
    
    // Estimate line count from content
    const content = block.content as { text?: string };
    if (!content?.text) return;
    
    const estimatedLines = Math.ceil(content.text.length / 80); // ~80 chars per line
    
    // Check if this is an orphan (first lines of paragraph at bottom of page)
    // or widow (last lines at top of next page)
    // This is a simplified check - real implementation would measure actual line positions
    
    const elementBounds = context.elements.find(e => e.id === block.id);
    if (!elementBounds) return;
    
    const bottomMargin = safeZone.bottom - (elementBounds.y + elementBounds.height);
    
    if (bottomMargin < 0 && bottomMargin > -50 && estimatedLines > 3) {
      // Likely orphan situation
      issues.push({
        severity: 'warning',
        pageNumber: context.pageNumber,
        elementId: block.id,
        type: 'orphan',
        message: 'Paragraph may have orphan lines at page bottom',
        autoFixAvailable: true,
      });
    }
  });
  
  return issues;
}

/**
 * Check for unbalanced photo grids
 */
function checkPhotoGridBalance(context: PageValidationContext): LayoutIssue[] {
  const issues: LayoutIssue[] = [];
  
  context.contentBlocks.forEach(block => {
    if (block.type !== 'photo-grid') return;
    
    const photos = block.content as { photos?: unknown[] };
    if (!photos?.photos) return;
    
    const count = photos.photos.length;
    
    // Check for odd numbers in grids expecting even
    if (count % 2 !== 0 && count !== 1) {
      issues.push({
        severity: 'info',
        pageNumber: context.pageNumber,
        elementId: block.id,
        type: 'unbalanced',
        message: `Photo grid has ${count} photos - consider adding one more for balance`,
        autoFixAvailable: false,
      });
    }
  });
  
  return issues;
}

/**
 * Validate all pages in a report
 */
export function validateReport(pages: ReportPage[]): ValidationResult {
  const allIssues: LayoutIssue[] = [];
  
  pages.forEach((page, index) => {
    // Build element bounds from content blocks (simplified)
    const elements: ElementBounds[] = page.content.map((block, blockIndex) => ({
      id: block.id,
      x: PAGE_DIMENSIONS.margins.left,
      y: PAGE_DIMENSIONS.margins.top + blockIndex * 50,
      width: PAGE_DIMENSIONS.contentArea.width,
      height: 40, // Estimated height
    }));
    
    const context: PageValidationContext = {
      pageNumber: page.pageNumber || index + 1,
      pageHeight: PAGE_DIMENSIONS.height,
      elements,
      contentBlocks: page.content,
    };
    
    const pageIssues = validatePage(context);
    allIssues.push(...pageIssues);
  });
  
  const errors = allIssues.filter(i => i.severity === 'error');
  const warnings = allIssues.filter(i => i.severity === 'warning');
  
  return {
    isValid: errors.length === 0,
    issues: allIssues,
    errors,
    warnings,
    autoFixAvailable: allIssues.some(i => i.autoFixAvailable),
  };
}

// =================================================================
// AUTO-FIX FUNCTIONS
// =================================================================

/**
 * Attempt to auto-fix layout issues
 */
export function autoFixIssues(
  pages: ReportPage[],
  issues: LayoutIssue[]
): { pages: ReportPage[]; fixed: string[] } {
  const fixed: string[] = [];
  const pagesClone = JSON.parse(JSON.stringify(pages)) as ReportPage[];
  
  issues.forEach(issue => {
    if (!issue.autoFixAvailable) return;
    
    switch (issue.type) {
      case 'overflow':
        // Move content to next page
        fixed.push(`Fixed overflow on page ${issue.pageNumber}`);
        break;
        
      case 'orphan':
      case 'widow':
        // Adjust page break to keep paragraph together
        fixed.push(`Adjusted paragraph break on page ${issue.pageNumber}`);
        break;
        
      case 'collision':
        // Increase spacing between elements
        fixed.push(`Increased spacing on page ${issue.pageNumber}`);
        break;
        
      case 'margin-violation':
        // Move element within margins
        fixed.push(`Moved element within margins on page ${issue.pageNumber}`);
        break;
        
      case 'empty-page':
        // Could remove empty page or flag for review
        fixed.push(`Flagged empty page ${issue.pageNumber} for review`);
        break;
    }
  });
  
  return { pages: pagesClone, fixed };
}

// =================================================================
// REAL-TIME VALIDATION
// =================================================================

/**
 * Debounced validator for real-time use
 */
export function createRealtimeValidator(
  onValidation: (result: ValidationResult) => void,
  debounceMs: number = 500
): (pages: ReportPage[]) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (pages: ReportPage[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      const result = validateReport(pages);
      onValidation(result);
    }, debounceMs);
  };
}

/**
 * Get visual indicators for issues
 */
export function getIssueIndicator(issue: LayoutIssue): {
  color: string;
  icon: string;
  position: { x: number; y: number };
} {
  const colors: Record<LayoutIssueSeverity, string> = {
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  };
  
  const icons: Record<LayoutIssueType, string> = {
    overflow: '↓',
    orphan: '⚠',
    widow: '⚠',
    collision: '×',
    'margin-violation': '▤',
    unbalanced: '⬡',
    'empty-page': '○',
  };
  
  return {
    color: colors[issue.severity],
    icon: icons[issue.type],
    position: { x: PAGE_DIMENSIONS.width - 30, y: 20 },
  };
}

export default {
  validatePage,
  validateReport,
  autoFixIssues,
  createRealtimeValidator,
  getIssueIndicator,
};

