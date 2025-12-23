/**
 * Spacing System Utility
 * 
 * Handles page safe zones, element spacing rules, and overflow detection
 * for the report preview system.
 */

import { PAGE_DIMENSIONS, SPACING_RULES } from '../constants';

// =================================================================
// TYPES
// =================================================================

export interface ElementBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PageSafeZone {
  top: number;
  right: number;
  bottom: number;
  left: number;
  contentWidth: number;
  contentHeight: number;
}

export interface SpacingValidation {
  isValid: boolean;
  violations: SpacingViolation[];
}

export interface SpacingViolation {
  type: 'margin' | 'overlap' | 'too-close' | 'overflow';
  elementId: string;
  targetId?: string;
  message: string;
  severity: 'error' | 'warning';
  suggestedFix?: () => void;
}

export interface OverflowInfo {
  hasOverflow: boolean;
  overflowAmount: number;
  direction: 'bottom' | 'right' | 'both';
  affectedElements: string[];
}

// =================================================================
// SAFE ZONES
// =================================================================

/**
 * Get safe zone boundaries for a standard page
 */
export function getPageSafeZone(): PageSafeZone {
  return {
    top: PAGE_DIMENSIONS.margins.top,
    right: PAGE_DIMENSIONS.width - PAGE_DIMENSIONS.margins.right,
    bottom: PAGE_DIMENSIONS.height - PAGE_DIMENSIONS.margins.bottom,
    left: PAGE_DIMENSIONS.margins.left,
    contentWidth: PAGE_DIMENSIONS.contentArea.width,
    contentHeight: PAGE_DIMENSIONS.contentArea.height,
  };
}

/**
 * Check if an element is within the safe zone
 */
export function isWithinSafeZone(element: ElementBounds): boolean {
  const safeZone = getPageSafeZone();
  
  return (
    element.x >= safeZone.left &&
    element.x + element.width <= safeZone.right &&
    element.y >= safeZone.top &&
    element.y + element.height <= safeZone.bottom
  );
}

/**
 * Calculate overlap amount with margins
 */
export function getMarginOverlap(element: ElementBounds): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  const safeZone = getPageSafeZone();
  
  return {
    top: Math.max(0, safeZone.top - element.y),
    right: Math.max(0, (element.x + element.width) - safeZone.right),
    bottom: Math.max(0, (element.y + element.height) - safeZone.bottom),
    left: Math.max(0, safeZone.left - element.x),
  };
}

// =================================================================
// SPACING VALIDATION
// =================================================================

/**
 * Get minimum spacing between two element types
 */
export function getMinSpacing(
  elementType: 'paragraph' | 'heading' | 'table' | 'image' | 'list' | 'section',
  adjacentType: 'paragraph' | 'heading' | 'table' | 'image' | 'list' | 'section'
): number {
  // Heading-specific spacing
  if (adjacentType === 'heading') {
    return SPACING_RULES.minSpacing.beforeHeading;
  }
  if (elementType === 'heading') {
    return SPACING_RULES.minSpacing.afterHeading;
  }
  
  // Section divider
  if (elementType === 'section' || adjacentType === 'section') {
    return SPACING_RULES.minSpacing.sectionDivider;
  }
  
  // Image/photo spacing
  if (elementType === 'image' || adjacentType === 'image') {
    return SPACING_RULES.minSpacing.betweenPhotos;
  }
  
  // Default paragraph spacing
  return SPACING_RULES.minSpacing.betweenParagraphs;
}

/**
 * Check if two elements are too close
 */
export function areElementsTooClose(
  element1: ElementBounds,
  element2: ElementBounds,
  elementType1: string,
  elementType2: string
): boolean {
  const minSpacing = getMinSpacing(
    elementType1 as 'paragraph',
    elementType2 as 'paragraph'
  );
  
  // Calculate vertical distance
  const verticalGap = element2.y - (element1.y + element1.height);
  
  return verticalGap >= 0 && verticalGap < minSpacing;
}

/**
 * Check for element overlap
 */
export function doElementsOverlap(
  element1: ElementBounds,
  element2: ElementBounds
): boolean {
  return !(
    element1.x + element1.width < element2.x ||
    element2.x + element2.width < element1.x ||
    element1.y + element1.height < element2.y ||
    element2.y + element2.height < element1.y
  );
}

/**
 * Validate spacing for all elements on a page
 */
export function validatePageSpacing(
  elements: (ElementBounds & { type: string })[]
): SpacingValidation {
  const violations: SpacingViolation[] = [];
  
  elements.forEach((element, index) => {
    // Check safe zone violations
    if (!isWithinSafeZone(element)) {
      const overlap = getMarginOverlap(element);
      const directions = [];
      
      if (overlap.top > 0) directions.push('top');
      if (overlap.right > 0) directions.push('right');
      if (overlap.bottom > 0) directions.push('bottom');
      if (overlap.left > 0) directions.push('left');
      
      violations.push({
        type: 'margin',
        elementId: element.id,
        message: `Element extends into ${directions.join(', ')} margin`,
        severity: 'error',
      });
    }
    
    // Check overlaps and spacing with other elements
    for (let j = index + 1; j < elements.length; j++) {
      const other = elements[j];
      
      // Check overlap
      if (doElementsOverlap(element, other)) {
        violations.push({
          type: 'overlap',
          elementId: element.id,
          targetId: other.id,
          message: `Element overlaps with another element`,
          severity: 'error',
        });
      }
      
      // Check spacing
      if (areElementsTooClose(element, other, element.type, other.type)) {
        violations.push({
          type: 'too-close',
          elementId: element.id,
          targetId: other.id,
          message: `Elements are too close together`,
          severity: 'warning',
        });
      }
    }
  });
  
  return {
    isValid: violations.filter(v => v.severity === 'error').length === 0,
    violations,
  };
}

// =================================================================
// OVERFLOW DETECTION
// =================================================================

/**
 * Detect if content overflows the page
 */
export function detectOverflow(
  elements: ElementBounds[],
  _pageHeight: number = PAGE_DIMENSIONS.height
): OverflowInfo {
  const safeZone = getPageSafeZone();
  const affectedElements: string[] = [];
  let maxBottom = 0;
  
  elements.forEach(element => {
    const elementBottom = element.y + element.height;
    if (elementBottom > safeZone.bottom) {
      affectedElements.push(element.id);
    }
    maxBottom = Math.max(maxBottom, elementBottom);
  });
  
  const overflowAmount = Math.max(0, maxBottom - safeZone.bottom);
  
  return {
    hasOverflow: overflowAmount > 0,
    overflowAmount,
    direction: 'bottom',
    affectedElements,
  };
}

/**
 * Calculate how much content needs to be moved to next page
 */
export function calculateContentSplit(
  elements: ElementBounds[],
  _availableHeight: number
): { fits: ElementBounds[]; overflow: ElementBounds[] } {
  const fits: ElementBounds[] = [];
  const overflow: ElementBounds[] = [];
  const safeZone = getPageSafeZone();
  
  let currentY = safeZone.top;
  
  elements.forEach(element => {
    const elementHeight = element.height;
    
    if (currentY + elementHeight <= safeZone.bottom) {
      fits.push(element);
      currentY += elementHeight + SPACING_RULES.minSpacing.betweenParagraphs;
    } else {
      overflow.push(element);
    }
  });
  
  return { fits, overflow };
}

// =================================================================
// AUTO-FIX SUGGESTIONS
// =================================================================

/**
 * Suggest fixes for spacing violations
 */
export function suggestSpacingFixes(
  _violations: SpacingViolation[],
  elements: ElementBounds[]
): { elementId: string; suggestedY: number }[] {
  const suggestions: { elementId: string; suggestedY: number }[] = [];
  
  // Sort elements by Y position
  const sortedElements = [...elements].sort((a, b) => a.y - b.y);
  const safeZone = getPageSafeZone();
  
  let currentY = safeZone.top;
  
  sortedElements.forEach(element => {
    if (element.y < currentY) {
      suggestions.push({
        elementId: element.id,
        suggestedY: currentY,
      });
    }
    currentY = Math.max(currentY, element.y) + element.height + SPACING_RULES.minSpacing.betweenParagraphs;
  });
  
  return suggestions;
}

/**
 * Auto-fix element positions to respect spacing rules
 */
export function autoFixSpacing(
  elements: (ElementBounds & { type: string })[]
): (ElementBounds & { type: string })[] {
  const safeZone = getPageSafeZone();
  const fixed = [...elements].sort((a, b) => a.y - b.y);
  
  let currentY = safeZone.top;
  
  fixed.forEach((element, index) => {
    // Ensure element starts at or after currentY
    if (element.y < currentY) {
      element.y = currentY;
    }
    
    // Ensure element is within horizontal safe zone
    if (element.x < safeZone.left) {
      element.x = safeZone.left;
    }
    if (element.x + element.width > safeZone.right) {
      element.width = safeZone.right - element.x;
    }
    
    // Calculate next Y position
    const spacing = index < fixed.length - 1
      ? getMinSpacing(element.type as 'paragraph', fixed[index + 1].type as 'paragraph')
      : 0;
    
    currentY = element.y + element.height + spacing;
  });
  
  return fixed;
}

export default {
  getPageSafeZone,
  isWithinSafeZone,
  getMarginOverlap,
  getMinSpacing,
  areElementsTooClose,
  doElementsOverlap,
  validatePageSpacing,
  detectOverflow,
  calculateContentSplit,
  suggestSpacingFixes,
  autoFixSpacing,
};

