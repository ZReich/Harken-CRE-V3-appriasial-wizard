import React from 'react';
import type { TOCEntry } from '../../../../types';
import { ReportPageBase } from './ReportPageBase';

interface TOCPageProps {
  entries: TOCEntry[];
  title?: string;
  pageNumber?: number;
  pageIndex?: number; // Which page of the TOC (0, 1, 2...)
  totalTocPages?: number;
  isEditing?: boolean;
  onEntryClick?: (entryId: string, pageNumber: number) => void;
}

// Maximum lines per page (each entry + children counts as lines)
const MAX_LINES_PER_PAGE = 22;

// Count total lines including nested children
function countEntryLines(entry: TOCEntry): number {
  let count = 1; // The entry itself
  if (entry.children) {
    count += entry.children.length;
  }
  return count;
}

/**
 * TOCPage - Table of Contents for Report Preview
 * 
 * Uses ReportPageBase for consistent layout with sidebar, header, and footer.
 * Limits entries to prevent overflow and supports pagination.
 */
export const TOCPage: React.FC<TOCPageProps> = ({
  entries,
  title = 'Table of Contents',
  pageNumber,
  pageIndex = 0,
  totalTocPages = 1,
  isEditing = false,
  onEntryClick,
}) => {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  const renderEntry = (entry: TOCEntry, _index: number, compact: boolean = false) => {
    const isLevel1 = entry.level === 1;
    const indentStyle = entry.level > 1 ? { marginLeft: `${(entry.level - 1) * 20}px` } : {};
    const isHovered = hoveredId === entry.id;

    return (
      <React.Fragment key={entry.id}>
        <div 
          className={`flex items-baseline ${compact ? 'py-1' : 'py-1.5'} px-2 -mx-2 rounded transition-colors ${
            isEditing && isHovered ? 'bg-slate-100' : ''
          } ${isEditing ? 'cursor-pointer' : ''}`}
          style={indentStyle}
          onMouseEnter={() => setHoveredId(entry.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => onEntryClick?.(entry.id, entry.pageNumber)}
        >
          <span className={`${compact ? 'text-xs' : 'text-sm'} flex-shrink-0 ${
            isLevel1 ? 'font-semibold text-slate-800' : 'text-slate-600'
          }`}>
            {entry.title}
          </span>
          <span className="flex-1 mx-3 border-b border-dotted border-slate-300 min-w-[20px]" />
          <span className={`${compact ? 'text-xs' : 'text-sm'} text-slate-500 flex-shrink-0 tabular-nums font-medium`}>
            {entry.pageNumber}
          </span>
        </div>
        
        {entry.children && entry.children.length > 0 && (
          <div>
            {entry.children.map((child, childIndex) => renderEntry(child, childIndex, compact))}
          </div>
        )}
      </React.Fragment>
    );
  };

  // Flatten entries for easier pagination calculation
  const flatEntries: TOCEntry[] = [];
  entries.forEach(entry => {
    flatEntries.push(entry);
    if (entry.children) {
      entry.children.forEach(child => flatEntries.push(child));
    }
  });

  // Calculate which entries to show on this page
  let startIndex = 0;
  let lineCount = 0;
  
  // Skip entries for previous pages
  for (let p = 0; p < pageIndex; p++) {
    let pageLinesCount = 0;
    while (startIndex < flatEntries.length && pageLinesCount < MAX_LINES_PER_PAGE) {
      pageLinesCount++;
      startIndex++;
    }
  }

  // Collect entries for this page
  const pageEntries: TOCEntry[] = [];
  let currentIndex = startIndex;
  lineCount = 0;
  
  while (currentIndex < flatEntries.length && lineCount < MAX_LINES_PER_PAGE) {
    pageEntries.push(flatEntries[currentIndex]);
    lineCount++;
    currentIndex++;
  }

  const hasMore = currentIndex < flatEntries.length;
  const isFirstPage = pageIndex === 0;
  const useCompactStyle = flatEntries.length > 25; // Use compact styling if many entries

  return (
    <ReportPageBase
      title={isFirstPage ? title : `${title} (Continued)`}
      sidebarLabel="TOC"
      pageNumber={pageNumber}
      sectionNumber={1}
      sectionTitle="CONTENTS"
      contentPadding="p-10"
    >
      {isFirstPage && (
        <p className="text-xs text-slate-600 mb-4">
          The following sections are included in this appraisal report:
        </p>
      )}

      <div className="flex flex-col">
        {pageEntries.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            <p className="text-sm">Table of contents will be generated</p>
            <p className="text-xs mt-2">based on report sections</p>
          </div>
        ) : (
          pageEntries.map((entry, index) => (
            <div key={entry.id}>
              {renderEntry(entry, index, useCompactStyle)}
            </div>
          ))
        )}
        
        {hasMore && (
          <div className="text-center text-slate-500 text-xs mt-4 pt-2 border-t border-slate-200 italic">
            Continued on next page...
          </div>
        )}
      </div>
    </ReportPageBase>
  );
};

export default TOCPage;
