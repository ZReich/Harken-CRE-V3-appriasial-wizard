/**
 * Page Flow Engine
 * 
 * Handles intelligent content flow between pages, including:
 * - Split point detection
 * - Section boundary protection
 * - Content continuation indicators
 * - Automatic reflow on content changes
 */

import type { ContentBlock, ReportSection, ReportPage, PageLayout } from '../../../types';
import { PAGE_DIMENSIONS, SPACING_RULES, SPLIT_RULES } from '../constants';

// =================================================================
// TYPES
// =================================================================

export interface FlowResult {
  pages: ReportPage[];
  overflowBlocks: ContentBlock[];
  splitPoints: SplitPoint[];
  warnings: FlowWarning[];
}

export interface SplitPoint {
  blockId: string;
  splitIndex: number;
  type: 'text' | 'table' | 'list';
  firstPartHeight: number;
  secondPartHeight: number;
}

export interface FlowWarning {
  type: 'orphan' | 'widow' | 'forced-split' | 'section-break';
  blockId: string;
  message: string;
}

export interface MeasuredBlock extends ContentBlock {
  measuredHeight: number;
  estimatedLines?: number;
}

// =================================================================
// HEIGHT ESTIMATION
// =================================================================

/**
 * Estimate the height of a content block
 * In production, this would actually measure rendered content
 */
export function estimateBlockHeight(block: ContentBlock): number {
  const content = block.content as Record<string, unknown>;
  
  switch (block.type) {
    case 'heading':
      return 36; // ~0.5 inch
      
    case 'paragraph':
      const text = content?.text as string || '';
      const chars = typeof text === 'string' ? text.length : 200;
      const lines = Math.ceil(chars / 80); // ~80 chars per line
      return lines * 14 + 12; // 14pt line height + spacing
      
    case 'table':
      const rows = content?.rows as unknown[] || [];
      return 30 + (rows.length || 5) * 24; // Header + rows
      
    case 'image':
      return 200; // Default image height
      
    case 'photo-grid':
      const photos = content?.photos as unknown[] || [];
      const gridRows = Math.ceil((photos.length || 6) / 2);
      return gridRows * 180; // ~2.5 inches per row
      
    case 'list':
      const items = content?.items as unknown[] || [];
      return (items.length || 3) * 20 + 12;
      
    case 'chart':
      return 250;
      
    default:
      return 100;
  }
}

/**
 * Measure all blocks in a section
 */
export function measureBlocks(blocks: ContentBlock[]): MeasuredBlock[] {
  return blocks.map(block => ({
    ...block,
    measuredHeight: estimateBlockHeight(block),
  }));
}

// =================================================================
// SPLIT DETECTION
// =================================================================

/**
 * Find safe split point in text content
 */
export function findTextSplitPoint(
  text: string,
  availableHeight: number,
  lineHeight: number = 14
): { splitIndex: number; firstPartHeight: number } | null {
  const lines = Math.floor(availableHeight / lineHeight);
  const minLines = SPLIT_RULES.paragraph.minLinesFirstPage;
  
  if (lines < minLines) {
    return null; // Not enough space to split
  }
  
  // Find character index at line break
  const charsPerLine = 80;
  const targetChars = lines * charsPerLine;
  
  // Try to split at sentence end
  let splitIndex = targetChars;
  const lastPeriod = text.lastIndexOf('.', targetChars);
  if (lastPeriod > targetChars * 0.5) {
    splitIndex = lastPeriod + 1;
  } else {
    // Fall back to word boundary
    const lastSpace = text.lastIndexOf(' ', targetChars);
    if (lastSpace > 0) {
      splitIndex = lastSpace;
    }
  }
  
  return {
    splitIndex,
    firstPartHeight: Math.ceil((splitIndex / charsPerLine) * lineHeight),
  };
}

/**
 * Find safe split point in table
 */
export function findTableSplitPoint(
  _rowCount: number,
  availableHeight: number,
  rowHeight: number = 24,
  headerHeight: number = 30
): { splitIndex: number; firstPartHeight: number } | null {
  const availableRows = Math.floor((availableHeight - headerHeight) / rowHeight);
  const minRows = SPLIT_RULES.table.minRowsFirstPage;
  
  if (availableRows < minRows) {
    return null;
  }
  
  return {
    splitIndex: availableRows,
    firstPartHeight: headerHeight + availableRows * rowHeight,
  };
}

/**
 * Determine if a block can be split
 */
export function canBlockSplit(block: ContentBlock): boolean {
  switch (block.type) {
    case 'heading':
      return SPLIT_RULES.heading.canSplit;
    case 'paragraph':
      return SPLIT_RULES.paragraph.canSplit;
    case 'table':
      return SPLIT_RULES.table.canSplit;
    case 'image':
    case 'photo-grid':
      return SPLIT_RULES.image.canSplit;
    case 'list':
      return SPLIT_RULES.list.canSplit;
    default:
      return block.canSplit;
  }
}

// =================================================================
// PAGE FLOW ALGORITHM
// =================================================================

/**
 * Flow content blocks into pages
 */
export function flowContentToPages(
  section: ReportSection,
  startPageNumber: number = 1,
  layout: PageLayout = 'narrative'
): FlowResult {
  const pages: ReportPage[] = [];
  const warnings: FlowWarning[] = [];
  const splitPoints: SplitPoint[] = [];
  
  const contentHeight = PAGE_DIMENSIONS.contentArea.height;
  let currentPageContent: ContentBlock[] = [];
  let currentHeight = 0;
  let pageNumber = startPageNumber;
  
  // Get section boundary rules (available for future use)
  // const boundary = SECTION_BOUNDARIES[section.id] || {
  //   beforeSection: { pageBreakRequired: false, minSpaceRequired: 0, insertSectionHeader: false },
  //   afterSection: { preventOrphanContent: false, minContentOnPage: 0 },
  // };
  
  const measuredBlocks = measureBlocks(section.blocks);
  
  for (let i = 0; i < measuredBlocks.length; i++) {
    const block = measuredBlocks[i];
    const nextBlock = measuredBlocks[i + 1];
    
    // Check if block fits on current page
    const fitsOnPage = currentHeight + block.measuredHeight <= contentHeight;
    
    if (fitsOnPage) {
      // Check keepWithNext
      if (block.keepWithNext && nextBlock) {
        const bothFit = currentHeight + block.measuredHeight + nextBlock.measuredHeight <= contentHeight;
        if (!bothFit) {
          // Start new page to keep blocks together
          if (currentPageContent.length > 0) {
            pages.push(createPage(pageNumber++, layout, section.id, currentPageContent, i === 0));
            currentPageContent = [];
            currentHeight = 0;
          }
        }
      }
      
      currentPageContent.push(block);
      currentHeight += block.measuredHeight + SPACING_RULES.minSpacing.betweenParagraphs;
    } else {
      // Block doesn't fit - try to split or move to next page
      const availableSpace = contentHeight - currentHeight;
      
      if (canBlockSplit(block) && availableSpace > 100) {
        // Try to split the block
        const split = attemptBlockSplit(block, availableSpace);
        if (split) {
          currentPageContent.push(split.firstPart);
          pages.push(createPage(pageNumber++, layout, section.id, currentPageContent, i === 0));
          
          currentPageContent = [split.secondPart];
          currentHeight = split.secondPartHeight;
          
          splitPoints.push({
            blockId: block.id,
            splitIndex: split.splitIndex,
            type: block.type as 'text' | 'table' | 'list',
            firstPartHeight: split.firstPartHeight,
            secondPartHeight: split.secondPartHeight,
          });
          
          continue;
        }
      }
      
      // Can't split - move entire block to next page
      if (currentPageContent.length > 0) {
        // Check for orphan
        if (currentPageContent.length === 1 && currentPageContent[0].type === 'heading') {
          warnings.push({
            type: 'orphan',
            blockId: currentPageContent[0].id,
            message: 'Heading left alone at bottom of page',
          });
        }
        
        pages.push(createPage(pageNumber++, layout, section.id, currentPageContent, i === 0));
      }
      
      currentPageContent = [block];
      currentHeight = block.measuredHeight + SPACING_RULES.minSpacing.betweenParagraphs;
    }
  }
  
  // Add remaining content as final page
  if (currentPageContent.length > 0) {
    pages.push(createPage(pageNumber, layout, section.id, currentPageContent, measuredBlocks.length <= currentPageContent.length));
  }
  
  return {
    pages,
    overflowBlocks: [],
    splitPoints,
    warnings,
  };
}

/**
 * Attempt to split a block at available space
 */
function attemptBlockSplit(
  block: MeasuredBlock,
  availableSpace: number
): {
  firstPart: ContentBlock;
  secondPart: ContentBlock;
  splitIndex: number;
  firstPartHeight: number;
  secondPartHeight: number;
} | null {
  const content = block.content as Record<string, unknown>;
  
  switch (block.type) {
    case 'paragraph': {
      const text = content?.text as string || '';
      const split = findTextSplitPoint(text, availableSpace);
      if (!split) return null;
      
      return {
        firstPart: {
          ...block,
          id: `${block.id}-part1`,
          content: { ...content, text: text.slice(0, split.splitIndex) },
        },
        secondPart: {
          ...block,
          id: `${block.id}-part2`,
          content: { ...content, text: text.slice(split.splitIndex).trim() },
        },
        splitIndex: split.splitIndex,
        firstPartHeight: split.firstPartHeight,
        secondPartHeight: block.measuredHeight - split.firstPartHeight,
      };
    }
    
    case 'table': {
      const rows = content?.rows as unknown[] || [];
      const split = findTableSplitPoint(rows.length, availableSpace);
      if (!split) return null;
      
      return {
        firstPart: {
          ...block,
          id: `${block.id}-part1`,
          content: { ...content, rows: rows.slice(0, split.splitIndex), continued: true },
        },
        secondPart: {
          ...block,
          id: `${block.id}-part2`,
          content: { ...content, rows: rows.slice(split.splitIndex), continuation: true },
        },
        splitIndex: split.splitIndex,
        firstPartHeight: split.firstPartHeight,
        secondPartHeight: block.measuredHeight - split.firstPartHeight,
      };
    }
    
    default:
      return null;
  }
}

/**
 * Create a page object
 */
function createPage(
  pageNumber: number,
  layout: PageLayout,
  sectionId: string,
  content: ContentBlock[],
  isFirstPage: boolean
): ReportPage {
  return {
    id: `page-${sectionId}-${pageNumber}`,
    pageNumber,
    layout,
    sectionId,
    title: isFirstPage ? undefined : undefined, // Title only on first page of section
    content,
  };
}

// =================================================================
// REFLOW ON CHANGE
// =================================================================

/**
 * Reflow pages starting from a specific point
 */
export function reflowFromPoint(
  pages: ReportPage[],
  startPageIndex: number,
  _changedBlockId: string
): ReportPage[] {
  // Collect all blocks from startPageIndex onwards
  const blocksToReflow: ContentBlock[] = [];
  
  for (let i = startPageIndex; i < pages.length; i++) {
    blocksToReflow.push(...pages[i].content);
  }
  
  // Create a temporary section for reflowing
  const tempSection: ReportSection = {
    id: pages[startPageIndex].sectionId || 'reflow',
    title: '',
    type: 'required',
    startsOnNewPage: false,
    blocks: blocksToReflow,
    minPageBreakBefore: 0,
  };
  
  // Reflow the content
  const result = flowContentToPages(
    tempSection,
    pages[startPageIndex].pageNumber,
    pages[startPageIndex].layout
  );
  
  // Replace pages from startPageIndex with new flowed pages
  return [
    ...pages.slice(0, startPageIndex),
    ...result.pages,
  ];
}

export default {
  estimateBlockHeight,
  measureBlocks,
  findTextSplitPoint,
  findTableSplitPoint,
  canBlockSplit,
  flowContentToPages,
  reflowFromPoint,
};

