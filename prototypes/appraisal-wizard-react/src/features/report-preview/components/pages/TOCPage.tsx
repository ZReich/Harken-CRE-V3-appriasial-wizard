import React from 'react';
import type { TOCEntry } from '../../../../types';

interface TOCPageProps {
  entries: TOCEntry[];
  title?: string;
  pageNumber?: number;
  isEditing?: boolean;
  onEntryClick?: (entryId: string, pageNumber: number) => void;
}

export const TOCPage: React.FC<TOCPageProps> = ({
  entries,
  title = 'Table of Contents',
  pageNumber,
  isEditing = false,
  onEntryClick,
}) => {
  const renderEntry = (entry: TOCEntry, _index: number) => {
    const indentClass = entry.level > 1 ? `ml-${(entry.level - 1) * 6}` : '';
    const textClass = entry.level === 1 
      ? 'font-semibold text-slate-800' 
      : 'text-slate-600';

    return (
      <React.Fragment key={entry.id}>
        <div 
          className={`flex items-baseline group ${
            isEditing ? 'cursor-pointer hover:bg-slate-50 rounded px-2 -mx-2' : ''
          } ${indentClass}`}
          onClick={() => onEntryClick?.(entry.id, entry.pageNumber)}
        >
          <span className={`text-sm ${textClass} flex-shrink-0`}>
            {entry.title}
          </span>
          <span className="flex-1 mx-3 border-b border-dotted border-slate-300 min-w-[20px]" />
          <span className="text-sm text-slate-500 flex-shrink-0 tabular-nums">
            {entry.pageNumber}
          </span>
        </div>
        
        {entry.children && entry.children.length > 0 && (
          <div className="mt-1.5">
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

  return (
    <div className="w-full h-full bg-surface-1 flex flex-col">
      {/* Page header */}
      <div className="px-16 pt-12 pb-8 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          {pageNumber && (
            <span className="text-sm text-slate-400">Page {pageNumber}</span>
          )}
        </div>
      </div>

      {/* TOC content */}
      <div className="flex-1 px-16 py-8 overflow-auto">
        <div className="space-y-3">
          {groupedEntries.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <p className="text-sm">Table of contents will be generated</p>
              <p className="text-xs mt-1">based on report sections</p>
            </div>
          ) : (
            groupedEntries.map((entry, index) => (
              <div key={entry.id} className="py-1">
                {renderEntry(entry, index)}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Decorative line at bottom */}
      <div className="px-16 pb-8">
        <div className="border-t-2 border-slate-200" />
      </div>
    </div>
  );
};

export default TOCPage;

