import React, { useMemo } from 'react';
import type { ContentBlock } from '../../../../types';
import { renderReportContent } from '../../../../utils/htmlRenderer';
import { ReportPageBase } from './ReportPageBase';
import { sampleAppraisalData } from '../../../review/data/sampleAppraisalData';

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

// Helper to format currency for compact display
const formatCompact = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return `$${Math.round(value / 1000)}K`;
};

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

  // Build columns dynamically based on number of comps
  const comps = sampleAppraisalData.comparables;
  const defaultColumns: GridColumn[] = useMemo(() => [
    { key: 'element', label: 'Element', width: '25%', align: 'left' },
    { key: 'subject', label: 'Subject', width: '15%', align: 'center' },
    ...comps.map((_, i) => ({
      key: `comp${i + 1}`,
      label: `Sale ${i + 1}`,
      width: `${60 / comps.length}%`,
      align: 'center' as const,
    })),
  ], [comps]);

  // Build rows from sample data
  const sampleRows: GridRow[] = useMemo(() => {
    const sample = sampleAppraisalData;
    const subject = sample.property;
    const improvements = sample.improvements;
    const site = sample.site;
    
    // Build comp cells dynamically
    const buildCompCells = (getValue: (comp: typeof comps[0], index: number) => string | number | null) => {
      const cells: Record<string, string | number | null> = {};
      comps.forEach((comp, i) => {
        cells[`comp${i + 1}`] = getValue(comp, i);
      });
      return cells;
    };
    
    return [
      { 
        id: 'sale-price', 
        cells: { 
          element: 'Sale Price', 
          subject: '-',
          ...buildCompCells(comp => formatCompact(comp.salePrice)),
        } 
      },
      { 
        id: 'price-sf', 
        cells: { 
          element: 'Price/SF', 
          subject: '-',
          ...buildCompCells(comp => `$${comp.pricePerSF.toFixed(0)}`),
        } 
      },
      { 
        id: 'property-rights', 
        cells: { 
          element: 'Prop. Rights', 
          subject: 'Fee Simple',
          ...buildCompCells(() => 'Fee Simple'),
        } 
      },
      { 
        id: 'financing', 
        cells: { 
          element: 'Financing', 
          subject: '-',
          ...buildCompCells((_, i) => i % 2 === 0 ? 'Cash' : 'Conv.'),
        } 
      },
      { 
        id: 'conditions-sale', 
        cells: { 
          element: 'Cond. of Sale', 
          subject: '-',
          ...buildCompCells(() => "Arm's Len."),
        } 
      },
      { 
        id: 'market-conditions', 
        cells: { 
          element: 'Mkt. Cond.', 
          subject: '-',
          ...buildCompCells(() => '0%'),
        } 
      },
      { 
        id: 'location', 
        cells: { 
          element: 'Location', 
          subject: subject.propertySubtype || 'Good',
          ...buildCompCells(comp => comp.adjustments.location === 0 ? 'Similar' : 
            comp.adjustments.location > 0 ? 'Inferior' : 'Superior'),
        } 
      },
      { 
        id: 'site-size', 
        cells: { 
          element: 'Site Size', 
          subject: `${site.landArea} AC`,
          ...buildCompCells(() => 'Similar'),
        } 
      },
      { 
        id: 'building-size', 
        cells: { 
          element: 'Building Size', 
          subject: `${improvements.grossBuildingArea.toLocaleString()} SF`,
          ...buildCompCells(comp => `${comp.buildingSize.toLocaleString()} SF`),
        } 
      },
      { 
        id: 'year-built', 
        cells: { 
          element: 'Year Built', 
          subject: String(improvements.yearBuilt),
          ...buildCompCells(comp => String(comp.yearBuilt)),
        } 
      },
      { 
        id: 'adjusted-price', 
        cells: { 
          element: 'Adj. Price/SF', 
          subject: '-',
          ...buildCompCells(comp => `$${comp.adjustedPricePerSF.toFixed(0)}`),
        }, 
        isTotal: true 
      },
    ];
  }, [comps]);

  const renderGrid = (columns: GridColumn[], rows: GridRow[]) => (
    <div className="overflow-hidden rounded border border-slate-200">
      <table className="w-full text-[10px] border-collapse">
        <thead>
          <tr className="bg-slate-800 text-white">
            {columns.map((col) => (
              <th 
                key={col.key}
                className={`px-2 py-1.5 font-semibold text-${col.align || 'left'}`}
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
                ${row.isTotal ? 'bg-slate-100 font-semibold' : rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                ${isEditing ? 'cursor-pointer hover:bg-sky-50' : ''}
              `}
            >
              {columns.map((col, colIndex) => (
                <td 
                  key={col.key}
                  className={`px-2 py-1 text-${col.align || 'left'} ${
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

  // Get sidebar label from sectionId
  const getSidebarLabel = () => {
    if (!sectionId) return 'ANALYSIS';
    const labelMap: Record<string, string> = {
      'sales-comparison': 'SALES',
      'income-approach': 'INCOME',
      'cost-approach': 'COST',
    };
    return labelMap[sectionId] || 'ANALYSIS';
  };

  return (
    <ReportPageBase
      title={title || 'Analysis Grid'}
      sidebarLabel={getSidebarLabel()}
      pageNumber={pageNumber}
      sectionNumber={6}
      sectionTitle="VALUATION"
      contentPadding="p-10"
    >
      {/* Narrative content before grid */}
      {narrativeBlocks.length > 0 && (
        <div className="mb-3">
          {narrativeBlocks.map((block) => (
            <div 
              key={block.id}
              className={`text-xs text-slate-700 leading-relaxed mb-2 ${
                isEditing ? 'cursor-pointer hover:bg-slate-50 rounded p-1 -m-1' : ''
              }`}
              onClick={() => isEditing && onContentClick?.(block.id)}
              dangerouslySetInnerHTML={
                typeof block.content === 'string' 
                  ? { __html: renderReportContent(block.content) }
                  : undefined
              }
            >
              {typeof block.content !== 'string' && null}
            </div>
          ))}
        </div>
      )}

      {/* Comparison Grid */}
      <div 
        className={`${isEditing ? 'ring-2 ring-transparent hover:ring-sky-200 rounded' : ''}`}
        onClick={() => isEditing && gridBlock && onContentClick?.(gridBlock.id)}
      >
        {renderGrid(defaultColumns, sampleRows)}
      </div>

      {/* Grid legend/notes */}
      <div className="mt-3 text-[9px] text-slate-500">
        <p>Note: Adjustments are made to comparable properties to account for differences from the subject.</p>
      </div>
    </ReportPageBase>
  );
};

export default AnalysisGridPage;
