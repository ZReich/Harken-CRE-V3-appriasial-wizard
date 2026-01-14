import { describe, it, expect } from 'vitest';
import { BASE_REPORT_SECTIONS } from '../constants';

/**
 * Tests for TOC pagination logic
 * These test the pure calculation logic used by TOCPage and hiddenSections
 */

const ENTRIES_PER_TOC_PAGE = 20;

// Helper to calculate required TOC pages
function calculateRequiredTocPages(contentSectionCount: number): number {
  return Math.max(1, Math.ceil(contentSectionCount / ENTRIES_PER_TOC_PAGE));
}

// Helper to determine which TOC pages should be hidden
function getHiddenTocPages(contentSectionCount: number): string[] {
  const hidden: string[] = [];
  const requiredPages = calculateRequiredTocPages(contentSectionCount);
  
  if (requiredPages < 2) {
    hidden.push('toc-2');
  }
  if (requiredPages < 3) {
    hidden.push('toc-3');
  }
  
  return hidden;
}

// Helper to slice entries for a specific TOC page
function getEntriesForPage(
  totalEntries: number, 
  pageIndex: number
): { start: number; end: number; count: number } {
  const start = pageIndex * ENTRIES_PER_TOC_PAGE;
  const end = Math.min(start + ENTRIES_PER_TOC_PAGE, totalEntries);
  const count = Math.max(0, end - start);
  return { start, end, count };
}

describe('TOC Pagination Logic', () => {
  describe('calculateRequiredTocPages', () => {
    it('should return 1 page for 0 sections', () => {
      expect(calculateRequiredTocPages(0)).toBe(1);
    });

    it('should return 1 page for 1-20 sections', () => {
      expect(calculateRequiredTocPages(1)).toBe(1);
      expect(calculateRequiredTocPages(10)).toBe(1);
      expect(calculateRequiredTocPages(20)).toBe(1);
    });

    it('should return 2 pages for 21-40 sections', () => {
      expect(calculateRequiredTocPages(21)).toBe(2);
      expect(calculateRequiredTocPages(30)).toBe(2);
      expect(calculateRequiredTocPages(40)).toBe(2);
    });

    it('should return 3 pages for 41-60 sections', () => {
      expect(calculateRequiredTocPages(41)).toBe(3);
      expect(calculateRequiredTocPages(50)).toBe(3);
      expect(calculateRequiredTocPages(60)).toBe(3);
    });
  });

  describe('getHiddenTocPages', () => {
    it('should hide toc-2 and toc-3 for minimal reports (≤20 sections)', () => {
      const hidden = getHiddenTocPages(10);
      expect(hidden).toContain('toc-2');
      expect(hidden).toContain('toc-3');
      expect(hidden.length).toBe(2);
    });

    it('should hide only toc-3 for standard reports (21-40 sections)', () => {
      const hidden = getHiddenTocPages(25);
      expect(hidden).not.toContain('toc-2');
      expect(hidden).toContain('toc-3');
      expect(hidden.length).toBe(1);
    });

    it('should hide nothing for large reports (41+ sections)', () => {
      const hidden = getHiddenTocPages(45);
      expect(hidden).not.toContain('toc-2');
      expect(hidden).not.toContain('toc-3');
      expect(hidden.length).toBe(0);
    });

    it('should handle boundary case of exactly 20 sections', () => {
      const hidden = getHiddenTocPages(20);
      expect(hidden).toContain('toc-2');
      expect(hidden).toContain('toc-3');
    });

    it('should handle boundary case of exactly 40 sections', () => {
      const hidden = getHiddenTocPages(40);
      expect(hidden).not.toContain('toc-2');
      expect(hidden).toContain('toc-3');
    });
  });

  describe('getEntriesForPage', () => {
    it('should return first 20 entries for page 0', () => {
      const result = getEntriesForPage(30, 0);
      expect(result.start).toBe(0);
      expect(result.end).toBe(20);
      expect(result.count).toBe(20);
    });

    it('should return remaining entries for page 1', () => {
      const result = getEntriesForPage(30, 1);
      expect(result.start).toBe(20);
      expect(result.end).toBe(30);
      expect(result.count).toBe(10);
    });

    it('should return 0 entries for empty page', () => {
      const result = getEntriesForPage(15, 1);
      expect(result.count).toBe(0);
    });

    it('should handle exactly 20 entries on page 0', () => {
      const result = getEntriesForPage(20, 0);
      expect(result.count).toBe(20);
    });

    it('should handle page 2 for large reports', () => {
      const result = getEntriesForPage(50, 2);
      expect(result.start).toBe(40);
      expect(result.end).toBe(50);
      expect(result.count).toBe(10);
    });
  });
});

describe('TOC Constants Configuration', () => {
  it('should have toc section in BASE_REPORT_SECTIONS', () => {
    const tocSection = BASE_REPORT_SECTIONS.find(s => s.id === 'toc');
    expect(tocSection).toBeDefined();
    expect(tocSection?.type).toBe('toc');
    expect(tocSection?.enabled).toBe(true);
  });

  it('should have toc-2 section in BASE_REPORT_SECTIONS', () => {
    const toc2Section = BASE_REPORT_SECTIONS.find(s => s.id === 'toc-2');
    expect(toc2Section).toBeDefined();
    expect(toc2Section?.type).toBe('toc');
    expect(toc2Section?.parentSectionId).toBe('toc');
  });

  it('should have toc-3 section in BASE_REPORT_SECTIONS', () => {
    const toc3Section = BASE_REPORT_SECTIONS.find(s => s.id === 'toc-3');
    expect(toc3Section).toBeDefined();
    expect(toc3Section?.type).toBe('toc');
    expect(toc3Section?.parentSectionId).toBe('toc');
  });

  it('should have TOC sections in correct order', () => {
    const tocIndex = BASE_REPORT_SECTIONS.findIndex(s => s.id === 'toc');
    const toc2Index = BASE_REPORT_SECTIONS.findIndex(s => s.id === 'toc-2');
    const toc3Index = BASE_REPORT_SECTIONS.findIndex(s => s.id === 'toc-3');
    
    expect(tocIndex).toBeLessThan(toc2Index);
    expect(toc2Index).toBeLessThan(toc3Index);
  });
});

describe('TOC Entry Page Number Calculation', () => {
  // Simulates the page number calculation logic in TOCPage
  function calculatePageNumbers(
    enabledSections: Array<{ id: string; enabled: boolean }>
  ): Map<string, number> {
    const pageNumberMap = new Map<string, number>();
    
    enabledSections
      .filter(s => s.enabled)
      .forEach((section, index) => {
        pageNumberMap.set(section.id, index + 1);
      });
    
    return pageNumberMap;
  }

  it('should assign sequential page numbers starting from 1', () => {
    const sections = [
      { id: 'cover', enabled: true },
      { id: 'toc', enabled: true },
      { id: 'letter', enabled: true },
      { id: 'executive-summary', enabled: true },
    ];
    
    const pageNumbers = calculatePageNumbers(sections);
    
    expect(pageNumbers.get('cover')).toBe(1);
    expect(pageNumbers.get('toc')).toBe(2);
    expect(pageNumbers.get('letter')).toBe(3);
    expect(pageNumbers.get('executive-summary')).toBe(4);
  });

  it('should skip disabled sections in numbering', () => {
    const sections = [
      { id: 'cover', enabled: true },
      { id: 'toc', enabled: true },
      { id: 'letter', enabled: false }, // disabled
      { id: 'executive-summary', enabled: true },
    ];
    
    const pageNumbers = calculatePageNumbers(sections);
    
    expect(pageNumbers.get('cover')).toBe(1);
    expect(pageNumbers.get('toc')).toBe(2);
    expect(pageNumbers.has('letter')).toBe(false);
    expect(pageNumbers.get('executive-summary')).toBe(3);
  });

  it('should handle reordering correctly', () => {
    // Simulate user dragging executive-summary before letter
    const sections = [
      { id: 'cover', enabled: true },
      { id: 'toc', enabled: true },
      { id: 'executive-summary', enabled: true }, // moved up
      { id: 'letter', enabled: true }, // moved down
    ];
    
    const pageNumbers = calculatePageNumbers(sections);
    
    expect(pageNumbers.get('executive-summary')).toBe(3);
    expect(pageNumbers.get('letter')).toBe(4);
  });
});

describe('Dynamic Page Numbering on Reorder', () => {
  // Simulates the full TOC entry generation with page numbers
  function generateTocEntries(
    sections: Array<{ id: string; label: string; enabled: boolean }>
  ): Array<{ id: string; title: string; page: number }> {
    const tocExcludedIds = new Set(['cover', 'toc', 'toc-2', 'toc-3']);
    const enabledSections = sections.filter(s => s.enabled);
    
    // Build page number map
    const pageNumberMap = new Map<string, number>();
    enabledSections.forEach((section, index) => {
      pageNumberMap.set(section.id, index + 1);
    });
    
    // Build TOC entries
    return enabledSections
      .filter(s => !tocExcludedIds.has(s.id))
      .map(section => ({
        id: section.id,
        title: section.label,
        page: pageNumberMap.get(section.id) || 0,
      }));
  }

  it('should update all page numbers when a section is moved up', () => {
    // Before reorder
    const before = [
      { id: 'cover', label: 'Cover', enabled: true },
      { id: 'toc', label: 'TOC', enabled: true },
      { id: 'letter', label: 'Letter', enabled: true },
      { id: 'executive-summary', label: 'Executive Summary', enabled: true },
      { id: 'property', label: 'Property Description', enabled: true },
    ];
    
    const entriesBefore = generateTocEntries(before);
    expect(entriesBefore.find(e => e.id === 'letter')?.page).toBe(3);
    expect(entriesBefore.find(e => e.id === 'executive-summary')?.page).toBe(4);
    expect(entriesBefore.find(e => e.id === 'property')?.page).toBe(5);
    
    // After moving property up to position 3
    const after = [
      { id: 'cover', label: 'Cover', enabled: true },
      { id: 'toc', label: 'TOC', enabled: true },
      { id: 'property', label: 'Property Description', enabled: true }, // moved up
      { id: 'letter', label: 'Letter', enabled: true },
      { id: 'executive-summary', label: 'Executive Summary', enabled: true },
    ];
    
    const entriesAfter = generateTocEntries(after);
    expect(entriesAfter.find(e => e.id === 'property')?.page).toBe(3);
    expect(entriesAfter.find(e => e.id === 'letter')?.page).toBe(4);
    expect(entriesAfter.find(e => e.id === 'executive-summary')?.page).toBe(5);
  });

  it('should recalculate page numbers when a section is disabled', () => {
    const sections = [
      { id: 'cover', label: 'Cover', enabled: true },
      { id: 'toc', label: 'TOC', enabled: true },
      { id: 'letter', label: 'Letter', enabled: true },
      { id: 'executive-summary', label: 'Executive Summary', enabled: false }, // disabled
      { id: 'property', label: 'Property Description', enabled: true },
    ];
    
    const entries = generateTocEntries(sections);
    
    // executive-summary should not appear in TOC
    expect(entries.find(e => e.id === 'executive-summary')).toBeUndefined();
    
    // property should now be page 4 (not 5)
    expect(entries.find(e => e.id === 'property')?.page).toBe(4);
  });

  it('should maintain correct order in TOC entries after complex reorder', () => {
    const sections = [
      { id: 'cover', label: 'Cover', enabled: true },
      { id: 'toc', label: 'TOC', enabled: true },
      { id: 'reconciliation', label: 'Reconciliation', enabled: true }, // moved to top
      { id: 'executive-summary', label: 'Executive Summary', enabled: true },
      { id: 'letter', label: 'Letter', enabled: true },
      { id: 'property', label: 'Property Description', enabled: true },
    ];
    
    const entries = generateTocEntries(sections);
    
    // Verify order and page numbers
    expect(entries[0].id).toBe('reconciliation');
    expect(entries[0].page).toBe(3);
    
    expect(entries[1].id).toBe('executive-summary');
    expect(entries[1].page).toBe(4);
    
    expect(entries[2].id).toBe('letter');
    expect(entries[2].page).toBe(5);
    
    expect(entries[3].id).toBe('property');
    expect(entries[3].page).toBe(6);
  });
});
