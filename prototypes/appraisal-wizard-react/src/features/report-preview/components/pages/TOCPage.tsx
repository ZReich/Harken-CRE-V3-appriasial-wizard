import React from 'react';
import type { TOCEntry } from '../../../../types';

interface TOCPageProps {
  entries: TOCEntry[];
  title?: string;
  pageNumber?: number;
  isEditing?: boolean;
  onEntryClick?: (entryId: string, pageNumber: number) => void;
}

/**
 * TOCPage - Table of Contents for Report Preview
 * 
 * Uses INLINE STYLES to force light mode appearance.
 * This ensures the printed document look is maintained
 * regardless of app dark mode settings.
 */
export const TOCPage: React.FC<TOCPageProps> = ({
  entries,
  title = 'Table of Contents',
  pageNumber,
  isEditing = false,
  onEntryClick,
}) => {
  // Inline style objects - these CANNOT be overridden by CSS
  const pageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle: React.CSSProperties = {
    padding: '48px 64px 32px 64px',
    borderBottom: '1px solid #e2e8f0',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e293b',
  };

  const pageNumStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#94a3b8',
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: '32px 64px',
    overflow: 'auto',
  };

  const entryStyle = (isLevel1: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'baseline',
    cursor: isEditing ? 'pointer' : 'default',
    padding: '4px 8px',
    marginLeft: '-8px',
    marginRight: '-8px',
    borderRadius: '4px',
  });

  const entryHoverStyle: React.CSSProperties = {
    backgroundColor: '#f1f5f9',
  };

  const entryTitleStyle = (isLevel1: boolean): React.CSSProperties => ({
    fontSize: '14px',
    fontWeight: isLevel1 ? 600 : 400,
    color: isLevel1 ? '#1e293b' : '#475569',
    flexShrink: 0,
  });

  const leaderStyle: React.CSSProperties = {
    flex: 1,
    margin: '0 12px',
    borderBottom: '1px dotted #cbd5e1',
    minWidth: '20px',
  };

  const pageNumberStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#64748b',
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  };

  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  const renderEntry = (entry: TOCEntry, _index: number) => {
    const isLevel1 = entry.level === 1;
    const indentStyle: React.CSSProperties = entry.level > 1 
      ? { marginLeft: `${(entry.level - 1) * 24}px` } 
      : {};

    const isHovered = hoveredId === entry.id;

    return (
      <React.Fragment key={entry.id}>
        <div 
          style={{
            ...entryStyle(isLevel1),
            ...indentStyle,
            ...(isEditing && isHovered ? entryHoverStyle : {}),
          }}
          onMouseEnter={() => setHoveredId(entry.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => onEntryClick?.(entry.id, entry.pageNumber)}
        >
          <span style={entryTitleStyle(isLevel1)}>
            {entry.title}
          </span>
          <span style={leaderStyle} />
          <span style={pageNumberStyle}>
            {entry.pageNumber}
          </span>
        </div>
        
        {entry.children && entry.children.length > 0 && (
          <div style={{ marginTop: '6px' }}>
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
    <div style={pageStyle}>
      {/* Page header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={titleStyle}>{title}</h2>
          {pageNumber && (
            <span style={pageNumStyle}>Page {pageNumber}</span>
          )}
        </div>
      </div>

      {/* TOC content */}
      <div style={contentStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {groupedEntries.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '48px 0' }}>
              <p style={{ fontSize: '14px' }}>Table of contents will be generated</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>based on report sections</p>
            </div>
          ) : (
            groupedEntries.map((entry, index) => (
              <div key={entry.id} style={{ padding: '4px 0' }}>
                {renderEntry(entry, index)}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Decorative line at bottom */}
      <div style={{ padding: '0 64px 32px 64px' }}>
        <div style={{ borderTop: '2px solid #e2e8f0' }} />
      </div>
    </div>
  );
};

export default TOCPage;
