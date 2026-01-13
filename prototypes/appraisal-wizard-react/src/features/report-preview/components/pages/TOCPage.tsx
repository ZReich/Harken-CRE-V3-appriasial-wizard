import React from 'react';
import type { TOCEntry } from '../../../../types';
import { ReportPageBase } from './ReportPageBase';

interface TOCPageProps {
  entries: TOCEntry[];
  title?: string;
  pageNumber?: number;
  isEditing?: boolean;
  onEntryClick?: (entryId: string, pageNumber: number) => void;
}

// Maximum entries per page before we would need pagination
const MAX_ENTRIES_PER_PAGE = 25;

/**
 * TOCPage - Table of Contents for Report Preview
 * 
 * Uses ReportPageBase for consistent layout with sidebar, header, and footer.
 * Limits entries to prevent overflow.
 */
export const TOCPage: React.FC<TOCPageProps> = ({
  entries,
  title = 'Table of Contents',
  pageNumber,
  isEditing = false,
  onEntryClick,
}) => {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  const renderEntry = (entry: TOCEntry, _index: number) => {
    const isLevel1 = entry.level === 1;
    const indentStyle = entry.level > 1 ? { marginLeft: `${(entry.level - 1) * 24}px` } : {};
    const isHovered = hoveredId === entry.id;

    return (
      <React.Fragment key={entry.id}>
        <div 
          className={`flex items-baseline py-2 px-3 -mx-3 rounded transition-colors ${
            isEditing && isHovered ? 'bg-slate-100' : ''
          } ${isEditing ? 'cursor-pointer' : ''}`}
          style={indentStyle}
          onMouseEnter={() => setHoveredId(entry.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => onEntryClick?.(entry.id, entry.pageNumber)}
        >
          <span className={`text-sm flex-shrink-0 ${
            isLevel1 ? 'font-semibold text-slate-800' : 'text-slate-600'
          }`}>
            {entry.title}
          </span>
          <span className="flex-1 mx-4 border-b border-dotted border-slate-300 min-w-[30px]" />
          <span className="text-sm text-slate-500 flex-shrink-0 tabular-nums font-medium">
            {entry.pageNumber}
          </span>
        </div>
        
        {entry.children && entry.children.length > 0 && (
          <div className="mt-0.5">
            {entry.children.map((child, childIndex) => renderEntry(child, childIndex))}
          </div>
        )}
      </React.Fragment>
    );
  };

  // Group entries by top-level sections
  const groupedEntries: TOCEntry[] = [];
  let currentGroup: TOCEntry | null = null;

  entries.forEach(entry => {
    if (entry.level === 1) {
      if (currentGroup) {
        groupedEntries.push(currentGroup);
      }
      currentGroup = { ...entry, children: [] };
    } else if (currentGroup) {
      currentGroup.children = currentGroup.children || [];
      currentGroup.children.push(entry);
    } else {
      groupedEntries.push(entry);
    }
  });

  if (currentGroup) {
    groupedEntries.push(currentGroup);
  }

  // Limit entries to prevent overflow
  const displayEntries = groupedEntries.slice(0, MAX_ENTRIES_PER_PAGE);
  const hasMore = groupedEntries.length > MAX_ENTRIES_PER_PAGE;

  return (
    <ReportPageBase
      title={title}
      sidebarLabel="TOC"
      pageNumber={pageNumber}
      sectionNumber={1}
      sectionTitle="CONTENTS"
      contentPadding="p-10"
    >
      <p className="text-sm text-slate-600 mb-6">
        The following sections are included in this appraisal report:
      </p>

      <div className="flex flex-col gap-1">
        {displayEntries.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            <p className="text-sm">Table of contents will be generated</p>
            <p className="text-xs mt-2">based on report sections</p>
          </div>
        ) : (
          displayEntries.map((entry, index) => (
            <div key={entry.id}>
              {renderEntry(entry, index)}
            </div>
          ))
        )}
        
        {hasMore && (
          <div className="text-center text-slate-500 text-xs mt-4 italic">
            + {groupedEntries.length - MAX_ENTRIES_PER_PAGE} more sections (continued on next page)
          </div>
        )}
      </div>
    </ReportPageBase>
  );
};

export default TOCPage;
