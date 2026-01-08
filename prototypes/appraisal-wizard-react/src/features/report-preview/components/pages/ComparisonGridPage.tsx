import React from 'react';
import { MapPin } from 'lucide-react';
import type { MapData } from '../../../../types';
import { MARKER_COLORS } from '../../../../services/mapGenerationService';

interface ComparisonGridPageProps {
  approachType: 'sales' | 'income' | 'cost';
  title?: string;
  subtitle?: string;
  pageNumber?: number;
  scenarioId?: number;
  scenarioName?: string;
  data?: CompGridData;
  isEditing?: boolean;
  onCellClick?: (row: string, col: string) => void;
  /** Optional map data for display above the grid */
  mapData?: MapData;
}

interface CompGridData {
  subject: Record<string, string | number | null>;
  comparables: Array<{
    id: string;
    label: string;
    data: Record<string, string | number | null>;
    adjustments?: Record<string, number>;
  }>;
  adjustmentRows?: string[];
  totalAdjustmentRow?: boolean;
}

// Default data for demonstration
const DEFAULT_SALES_DATA: CompGridData = {
  subject: {
    address: '6907 Entryway Drive',
    salePrice: '-',
    pricePerSF: '-',
    propertyRights: 'Fee Simple',
    financing: '-',
    conditionsOfSale: '-',
    marketConditions: '-',
    location: 'Good',
    siteSize: '1.5 AC',
    buildingSize: '10,000 SF',
    yearBuilt: '2010',
    condition: 'Good',
  },
  comparables: [
    {
      id: 'comp-1',
      label: 'Sale 1',
      data: {
        address: '123 Industrial Way',
        salePrice: '$450,000',
        pricePerSF: '$125/SF',
        propertyRights: 'Fee Simple',
        financing: 'Cash',
        conditionsOfSale: 'Arms Length',
        marketConditions: '0%',
        location: 'Similar',
        siteSize: '1.2 AC',
        buildingSize: '9,500 SF',
        yearBuilt: '2008',
        condition: 'Good',
      },
      adjustments: {
        location: 0,
        siteSize: 2500,
        buildingSize: 5000,
        yearBuilt: -2500,
        condition: 0,
      },
    },
    {
      id: 'comp-2',
      label: 'Sale 2',
      data: {
        address: '456 Commerce Blvd',
        salePrice: '$425,000',
        pricePerSF: '$118/SF',
        propertyRights: 'Fee Simple',
        financing: 'Conventional',
        conditionsOfSale: 'Arms Length',
        marketConditions: '+2%',
        location: 'Superior',
        siteSize: '2.0 AC',
        buildingSize: '11,000 SF',
        yearBuilt: '2012',
        condition: 'Average',
      },
      adjustments: {
        location: -15000,
        siteSize: -5000,
        buildingSize: -10000,
        yearBuilt: 2500,
        condition: 5000,
      },
    },
    {
      id: 'comp-3',
      label: 'Sale 3',
      data: {
        address: '789 Business Park',
        salePrice: '$475,000',
        pricePerSF: '$132/SF',
        propertyRights: 'Fee Simple',
        financing: 'Cash',
        conditionsOfSale: 'Arms Length',
        marketConditions: '-1%',
        location: 'Inferior',
        siteSize: '1.0 AC',
        buildingSize: '8,500 SF',
        yearBuilt: '2015',
        condition: 'Excellent',
      },
      adjustments: {
        location: 20000,
        siteSize: 7500,
        buildingSize: 15000,
        yearBuilt: -7500,
        condition: -10000,
      },
    },
  ],
  adjustmentRows: ['location', 'siteSize', 'buildingSize', 'yearBuilt', 'condition'],
  totalAdjustmentRow: true,
};

const ROW_LABELS: Record<string, string> = {
  address: 'Property Address',
  salePrice: 'Sale Price',
  pricePerSF: 'Price/SF',
  propertyRights: 'Property Rights',
  financing: 'Financing',
  conditionsOfSale: 'Conditions of Sale',
  marketConditions: 'Market Conditions',
  location: 'Location',
  siteSize: 'Site Size',
  buildingSize: 'Building Size',
  yearBuilt: 'Year Built',
  condition: 'Condition',
  totalAdjustment: 'Net Adjustment',
  adjustedPrice: 'Adjusted Price',
};

export const ComparisonGridPage: React.FC<ComparisonGridPageProps> = ({
  approachType,
  title,
  pageNumber,
  scenarioName,
  data = DEFAULT_SALES_DATA,
  isEditing = false,
  onCellClick,
  mapData,
}) => {
  const formatValue = (value: string | number | null): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  };

  const formatAdjustment = (value: number | undefined): React.ReactNode => {
    if (value === undefined || value === 0) {
      return <span className="text-harken-gray-med">-</span>;
    }
    const formatted = Math.abs(value).toLocaleString();
    if (value > 0) {
      return <span className="text-accent-teal-mint">+${formatted}</span>;
    }
    return <span className="text-harken-error">-${formatted}</span>;
  };

  const calculateTotalAdjustment = (adjustments: Record<string, number> | undefined): number => {
    if (!adjustments) return 0;
    return Object.values(adjustments).reduce((sum, val) => sum + val, 0);
  };

  const calculateAdjustedPrice = (
    salePrice: string | number | null,
    adjustments: Record<string, number> | undefined
  ): string => {
    if (!salePrice || typeof salePrice !== 'string') return '-';
    const priceNum = parseInt(salePrice.replace(/[^0-9]/g, ''));
    if (isNaN(priceNum)) return '-';
    const total = calculateTotalAdjustment(adjustments);
    return `$${(priceNum + total).toLocaleString()}`;
  };

  // Build rows for the grid
  const dataRows = ['address', 'salePrice', 'pricePerSF', 'propertyRights', 'financing', 'conditionsOfSale', 'marketConditions'];
  const comparisonRows = ['location', 'siteSize', 'buildingSize', 'yearBuilt', 'condition'];

  return (
    <div className="w-full h-full bg-surface-1 flex flex-col">
      {/* Page header */}
      <div className="px-10 pt-8 pb-4 border-b border-light-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {title || `${approachType === 'sales' ? 'Sales Comparison' : approachType === 'income' ? 'Income' : 'Cost'} Approach`}
            </h2>
            {scenarioName && (
              <p className="text-sm text-harken-gray-med mt-1">{scenarioName}</p>
            )}
          </div>
          {pageNumber && (
            <span className="text-sm text-harken-gray-med">Page {pageNumber}</span>
          )}
        </div>
      </div>

      {/* Map Section - Display above grid if mapData is provided */}
      {mapData && mapData.imageUrl && (
        <div className="px-10 pt-4 pb-2">
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-surface-1">
            {/* Map Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-sm text-slate-700">{mapData.title}</span>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: MARKER_COLORS.subject }}
                  />
                  <span className="text-slate-500">Subject</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: approachType === 'sales' ? MARKER_COLORS['improved-sale'] : approachType === 'income' ? MARKER_COLORS.rental : MARKER_COLORS['land-sale'] }}
                  />
                  <span className="text-slate-500">Comparables</span>
                </div>
              </div>
            </div>
            {/* Map Image */}
            <div className="relative" style={{ height: '200px' }}>
              <img 
                src={mapData.imageUrl} 
                alt={mapData.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* Grid content */}
      <div className="flex-1 px-10 py-6 overflow-auto">
        <div className="border border-light-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="px-3 py-2 text-left font-semibold w-[180px]">Element of Comparison</th>
                <th className="px-3 py-2 text-center font-semibold bg-slate-700">Subject</th>
                {data.comparables.map(comp => (
                  <th key={comp.id} className="px-3 py-2 text-center font-semibold">
                    {comp.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Transaction Data Section */}
              <tr className="bg-slate-100">
                <td colSpan={2 + data.comparables.length} className="px-3 py-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Transaction Data
                </td>
              </tr>
              {dataRows.map((rowKey) => (
                <tr 
                  key={rowKey}
                  className={`border-b border-slate-100 ${isEditing ? 'hover:bg-slate-50 cursor-pointer' : ''}`}
                >
                  <td className="px-3 py-2 font-medium text-slate-700">
                    {ROW_LABELS[rowKey] || rowKey}
                  </td>
                  <td 
                    className="px-3 py-2 text-center bg-slate-50 text-slate-800"
                    onClick={() => isEditing && onCellClick?.(rowKey, 'subject')}
                  >
                    {formatValue(data.subject[rowKey])}
                  </td>
                  {data.comparables.map(comp => (
                    <td 
                      key={comp.id}
                      className="px-3 py-2 text-center text-slate-600"
                      onClick={() => isEditing && onCellClick?.(rowKey, comp.id)}
                    >
                      {formatValue(comp.data[rowKey])}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Physical Comparison Section */}
              <tr className="bg-slate-100">
                <td colSpan={2 + data.comparables.length} className="px-3 py-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Physical Adjustments
                </td>
              </tr>
              {comparisonRows.map((rowKey) => (
                <tr 
                  key={rowKey}
                  className={`border-b border-slate-100 ${isEditing ? 'hover:bg-slate-50 cursor-pointer' : ''}`}
                >
                  <td className="px-3 py-2 font-medium text-slate-700">
                    {ROW_LABELS[rowKey] || rowKey}
                  </td>
                  <td className="px-3 py-2 text-center bg-slate-50 text-slate-800">
                    {formatValue(data.subject[rowKey])}
                  </td>
                  {data.comparables.map(comp => (
                    <td key={comp.id} className="px-3 py-2 text-center">
                      <div className="text-slate-600 text-xs">
                        {formatValue(comp.data[rowKey])}
                      </div>
                      <div className="text-xs mt-0.5">
                        {formatAdjustment(comp.adjustments?.[rowKey])}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}

              {/* Total Adjustments */}
              {data.totalAdjustmentRow && (
                <>
                  <tr className="bg-slate-200 font-semibold">
                    <td className="px-3 py-2 text-slate-800">Net Adjustment</td>
                    <td className="px-3 py-2 text-center bg-slate-100">-</td>
                    {data.comparables.map(comp => {
                      const total = calculateTotalAdjustment(comp.adjustments);
                      return (
                        <td key={comp.id} className="px-3 py-2 text-center">
                          {formatAdjustment(total)}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="bg-slate-800 text-white font-semibold">
                    <td className="px-3 py-2">Adjusted Sale Price</td>
                    <td className="px-3 py-2 text-center bg-slate-700">-</td>
                    {data.comparables.map(comp => (
                      <td key={comp.id} className="px-3 py-2 text-center">
                        {calculateAdjustedPrice(comp.data.salePrice, comp.adjustments)}
                      </td>
                    ))}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Conclusion section */}
        <div className="mt-6 p-4 bg-harken-gray-light rounded-lg border border-light-border">
          <h4 className="font-semibold text-slate-800 mb-2">Value Indication</h4>
          <p className="text-sm text-harken-gray mb-3">
            Based on the analysis of the comparable sales and after making the appropriate adjustments, 
            the indicated value range is:
          </p>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs text-harken-gray-med uppercase mb-1">Low</div>
              <div className="text-lg font-semibold text-slate-800">
                $400,000
              </div>
            </div>
            <div className="flex-1 h-px bg-slate-300" />
            <div className="text-center">
              <div className="text-xs text-harken-gray-med uppercase mb-1">Indicated Value</div>
              <div className="text-2xl font-bold text-sky-600">
                $450,000
              </div>
            </div>
            <div className="flex-1 h-px bg-slate-300" />
            <div className="text-center">
              <div className="text-xs text-harken-gray-med uppercase mb-1">High</div>
              <div className="text-lg font-semibold text-slate-800">
                $490,000
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonGridPage;

