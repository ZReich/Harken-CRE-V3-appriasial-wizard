import type { TOCEntry, ReportPage } from '../../../types';

interface TOCGeneratorOptions {
  maxDepth?: number;
  showPageNumbers?: boolean;
  includeAddenda?: boolean;
}

/**
 * Generate Table of Contents entries from report pages
 */
export function generateTOC(
  pages: ReportPage[],
  options: TOCGeneratorOptions = {}
): TOCEntry[] {
  const { maxDepth = 3, includeAddenda = true } = options;
  
  const entries: TOCEntry[] = [];
  const sectionPageMap = new Map<string, number>();
  
  // Track which sections we've already added
  const addedSections = new Set<string>();
  
  pages.forEach((page, index) => {
    const pageNumber = page.pageNumber || index + 1;
    
    // Skip pages without section IDs
    if (!page.sectionId) return;
    
    // Skip TOC page itself
    if (page.sectionId === 'toc') return;
    
    // Skip if we've already added this section
    if (addedSections.has(page.sectionId)) return;
    
    // Skip addenda items if not included
    if (!includeAddenda && page.sectionId === 'addenda') return;
    
    // Determine level based on section ID pattern
    const level = getSectionLevel(page.sectionId);
    
    // Skip if exceeds max depth
    if (level > maxDepth) return;
    
    // Get title from page or generate from section ID
    const title = page.title || formatSectionTitle(page.sectionId);
    
    // Only add if we have a title
    if (title) {
      entries.push({
        id: page.sectionId,
        title,
        pageNumber,
        level,
      });
      
      addedSections.add(page.sectionId);
      sectionPageMap.set(page.sectionId, pageNumber);
    }
  });
  
  return entries;
}

/**
 * Nest TOC entries into hierarchical structure
 */
export function nestTOCEntries(flatEntries: TOCEntry[]): TOCEntry[] {
  const result: TOCEntry[] = [];
  let currentLevel1: TOCEntry | null = null;
  let currentLevel2: TOCEntry | null = null;
  
  flatEntries.forEach(entry => {
    const newEntry = { ...entry, children: [] };
    
    if (entry.level === 1) {
      result.push(newEntry);
      currentLevel1 = newEntry;
      currentLevel2 = null;
    } else if (entry.level === 2) {
      if (currentLevel1) {
        currentLevel1.children = currentLevel1.children || [];
        currentLevel1.children.push(newEntry);
        currentLevel2 = newEntry;
      } else {
        result.push(newEntry);
      }
    } else if (entry.level === 3) {
      if (currentLevel2) {
        currentLevel2.children = currentLevel2.children || [];
        currentLevel2.children.push(newEntry);
      } else if (currentLevel1) {
        currentLevel1.children = currentLevel1.children || [];
        currentLevel1.children.push(newEntry);
      } else {
        result.push(newEntry);
      }
    }
  });
  
  return result;
}

/**
 * Update page numbers in TOC entries after content changes
 */
export function updateTOCPageNumbers(
  entries: TOCEntry[],
  sectionPageMap: Record<string, number>
): TOCEntry[] {
  return entries.map(entry => ({
    ...entry,
    pageNumber: sectionPageMap[entry.id] ?? entry.pageNumber,
    children: entry.children 
      ? updateTOCPageNumbers(entry.children, sectionPageMap)
      : undefined,
  }));
}

/**
 * Calculate which page each section starts on
 */
export function calculateSectionPageNumbers(
  pages: ReportPage[]
): Record<string, number> {
  const sectionPageMap: Record<string, number> = {};
  
  pages.forEach((page, index) => {
    if (page.sectionId && !sectionPageMap[page.sectionId]) {
      sectionPageMap[page.sectionId] = page.pageNumber || index + 1;
    }
  });
  
  return sectionPageMap;
}

/**
 * Get section level from section ID
 * Level 1: Main sections (e.g., "site-analysis", "income-approach")
 * Level 2: Subsections (e.g., "photos", "maps")
 * Level 3: Sub-subsections (e.g., specific addenda items)
 */
function getSectionLevel(sectionId: string): number {
  // Addenda subsections
  if (['photos', 'maps', 'flood-map', 'zoning-map', 'plat-map'].includes(sectionId)) {
    return 2;
  }
  
  // Approach subsections (per scenario)
  if (sectionId.match(/^(cost|sales|income)-\d+$/)) {
    return 1; // Treat approach sections as top-level
  }
  
  // Comp details and other addenda items
  if (sectionId.startsWith('comp-') || sectionId.startsWith('exhibit-')) {
    return 3;
  }
  
  // Default to level 1
  return 1;
}

/**
 * Format section ID into display title
 */
function formatSectionTitle(sectionId: string): string {
  // Handle scenario-specific approaches
  const approachMatch = sectionId.match(/^(cost|sales|income)-(\d+)$/);
  if (approachMatch) {
    const approachNames: Record<string, string> = {
      'cost': 'Cost Approach',
      'sales': 'Sales Comparison Approach',
      'income': 'Income Approach',
    };
    return approachNames[approachMatch[1]] || sectionId;
  }
  
  // Standard sections
  const titleMap: Record<string, string> = {
    'cover': 'Cover Page',
    'letter': 'Letter of Transmittal',
    'toc': 'Table of Contents',
    'executive-summary': 'Summary of Appraisal',
    'purpose': 'Purpose of Appraisal',
    'area-analysis': 'General Area Analysis',
    'neighborhood': 'Neighborhood Analysis',
    'site-analysis': 'Site Analysis',
    'improvement-analysis': 'Improvement Analysis',
    'taxes': 'Tax Analysis',
    'ownership': 'Property Ownership',
    'highest-best-use': 'Highest and Best Use',
    'cost-approach': 'Cost Approach',
    'sales-comparison': 'Sales Comparison Approach',
    'income-approach': 'Income Approach',
    'reconciliation': 'Reconciliation',
    'certification': 'Certification',
    'qualifications': 'Appraiser Qualifications',
    'limiting-conditions': 'Assumptions & Limiting Conditions',
    'addenda': 'Addenda',
    'photos': 'Subject Property Photos',
    'maps': 'Maps',
    'flood-map': 'Flood Map',
    'zoning-map': 'Zoning Map',
    'plat-map': 'Plat Map',
  };
  
  if (titleMap[sectionId]) {
    return titleMap[sectionId];
  }
  
  // Fallback: convert kebab-case to Title Case
  return sectionId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Create TOC page content ready for rendering
 */
export function createTOCPageContent(entries: TOCEntry[]): {
  entries: TOCEntry[];
  estimatedPages: number;
} {
  const nestedEntries = nestTOCEntries(entries);
  
  // Estimate pages based on entry count
  // Roughly 30-40 entries per page
  const flatCount = countEntriesRecursive(nestedEntries);
  const estimatedPages = Math.max(1, Math.ceil(flatCount / 35));
  
  return {
    entries: nestedEntries,
    estimatedPages,
  };
}

function countEntriesRecursive(entries: TOCEntry[]): number {
  return entries.reduce((count, entry) => {
    return count + 1 + (entry.children ? countEntriesRecursive(entry.children) : 0);
  }, 0);
}

export default {
  generateTOC,
  nestTOCEntries,
  updateTOCPageNumbers,
  calculateSectionPageNumbers,
  createTOCPageContent,
};

