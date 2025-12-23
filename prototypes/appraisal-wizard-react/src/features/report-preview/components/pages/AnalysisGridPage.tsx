import React from 'react';
import type { ContentBlock } from '../../../../types';

interface AnalysisGridPageProps {
  content: ContentBlock[];
  title?: string;
  pageNumber?: number;
  sectionId?: string;
  isEditing?: boolean;
  onContentClick?: (blockId: string) => void;
  onCellClick?: (blockId: string, row: number, col: number) => void;
}

interface GridColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface GridRow {
  id: string;
  cells: Record<string, string | number | null>;
  isHeader?: boolean;
  isTotal?: boolean;
}

export const AnalysisGridPage: React.FC<AnalysisGridPageProps> = ({
  content,
  title,
  pageNumber,
  sectionId,
  isEditing = false,
  onContentClick,
  onCellClick,
}) => {
  // Extract grid data from content blocks
  const gridBlock = content.find(b => b.type === 'table');
  const narrativeBlocks = content.filter(b => b.type !== 'table');

  // Sample columns for comparison grid
  const defaultColumns: GridColumn[] = [
    { key: 'element', label: 'Element of Comparison', width: '20%', align: 'left' },
    { key: 'subject', label: 'Subject', width: '16%', align: 'center' },
    { key: 'comp1', label: 'Comp 1', width: '16%', align: 'center' },
    { key: 'comp2', label: 'Comp 2', width: '16%', align: 'center' },
    { key: 'comp3', label: 'Comp 3', width: '16%', align: 'center' },
    { key: 'comp4', label: 'Comp 4', width: '16%', align: 'center' },
  ];

  // Sample rows for demonstration
  const sampleRows: GridRow[] = [
    {
      id: 'sale-price',
      cells: { 
        element: 'Sale Price', 
        subject: '-', 
        comp1: '$450,000', 
        comp2: '$425,000', 
        comp3: '$475,000', 
        comp4: '$460,000' 
      },
    },
    {
      id: 'price-sf',
      cells: { 
        element: 'Price/SF', 
        subject: '-', 
        comp1: '$125/SF', 
        comp2: '$118/SF', 
        comp3: '$132/SF', 
        comp4: '$128/SF' 
      },
    },
    {
      id: 'property-rights',
      cells: { 
        element: 'Property Rights', 
        subject: 'Fee Simple', 
        comp1: 'Fee Simple', 
        comp2: 'Fee Simple', 
        comp3: 'Fee Simple', 
        comp4: 'Fee Simple' 
      },
    },
    {
      id: 'financing',
      cells: { 
        element: 'Financing', 
        subject: '-', 
        comp1: 'Cash', 
        comp2: 'Conventional', 
        comp3: 'Cash', 
        comp4: 'Cash' 
      },
    },
    {
      id: 'conditions-sale',
      cells: { 
        element: 'Conditions of Sale', 
        subject: '-', 
        comp1: 'Arms Length', 
        comp2: 'Arms Length', 
        comp3: 'Arms Length', 
        comp4: 'Arms Length' 
      },
    },
    {
      id: 'market-conditions',
      cells: { 
        element: 'Market Conditions', 
        subject: '-', 
        comp1: '0%', 
        comp2: '+2%', 
        comp3: '-1%', 
        comp4: '0%' 
      },
    },
    {
      id: 'location',
      cells: { 
        element: 'Location', 
        subject: 'Good', 
        comp1: 'Similar', 
        comp2: 'Superior', 
        comp3: 'Inferior', 
        comp4: 'Similar' 
      },
    },
    {
      id: 'site-size',
      cells: { 
        element: 'Site Size', 
        subject: '1.5 AC', 
        comp1: '1.2 AC', 
        comp2: '2.0 AC', 
        comp3: '1.0 AC', 
        comp4: '1.5 AC' 
      },
    },
    {
      id: 'adjusted-price',
      cells: { 
        element: 'Adjusted Price', 
        subject: '-', 
        comp1: '$455,000', 
        comp2: '$415,000', 
        comp3: '$490,000', 
        comp4: '$460,000' 
      },
      isTotal: true,
    },
  ];

  const renderGrid = (columns: GridColumn[], rows: GridRow[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-800 text-white">
            {columns.map((col) => (
              <th 
                key={col.key}
                className={`px-3 py-2.5 font-semibold text-${col.align || 'left'}`}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr 
              key={row.id}
              className={`
                border-b border-slate-200 
                ${row.isTotal ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'}
                ${isEditing ? 'cursor-pointer' : ''}
              `}
            >
              {columns.map((col, colIndex) => (
                <td 
                  key={col.key}
                  className={`px-3 py-2 text-${col.align || 'left'} ${
                    col.key === 'element' ? 'font-medium text-slate-700' : 'text-slate-600'
                  }`}
                  onClick={() => isEditing && onCellClick?.(row.id, rowIndex, colIndex)}
                >
                  {row.cells[col.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Page header */}
      {title && (
        <div className="px-12 pt-10 pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 
              className={`text-xl font-bold text-slate-800 ${
                isEditing ? 'cursor-pointer hover:bg-slate-50 rounded px-2 -mx-2' : ''
              }`}
              onClick={() => isEditing && onContentClick?.(`${sectionId}-title`)}
            >
              {title}
            </h2>
            {pageNumber && (
              <span className="text-sm text-slate-400">Page {pageNumber}</span>
            )}
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 px-12 py-6 overflow-auto">
        {/* Narrative content before grid */}
        {narrativeBlocks.length > 0 && (
          <div className="mb-6">
            {narrativeBlocks.map((block) => (
              <div 
                key={block.id}
                className={`text-sm text-slate-700 leading-relaxed mb-4 ${
                  isEditing ? 'cursor-pointer hover:bg-slate-50 rounded p-1 -m-1' : ''
                }`}
                onClick={() => isEditing && onContentClick?.(block.id)}
              >
                {typeof block.content === 'string' && <p>{block.content}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Comparison Grid */}
        <div 
          className={`rounded-lg border border-slate-200 overflow-hidden ${
            isEditing ? 'ring-2 ring-transparent hover:ring-sky-200' : ''
          }`}
          onClick={() => isEditing && gridBlock && onContentClick?.(gridBlock.id)}
        >
          {renderGrid(defaultColumns, sampleRows)}
        </div>

        {/* Grid legend/notes */}
        <div className="mt-4 text-xs text-slate-500">
          <p>Note: Adjustments are made to the comparable properties to account for differences from the subject property.</p>
        </div>
      </div>

      {/* Page number (if no title shown) */}
      {!title && pageNumber && (
        <div className="px-12 py-4 text-right">
          <span className="text-sm text-slate-400">Page {pageNumber}</span>
        </div>
      )}
    </div>
  );
};

export default AnalysisGridPage;

