import React from 'react';
import { MapPin } from 'lucide-react';
import type { MapData } from '../../../../types';
import { MARKER_COLORS } from '../../../../services/mapGenerationService';
import { ReportPageBase } from './ReportPageBase';
import { sampleAppraisalData } from '../../../review/data/sampleAppraisalData';

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

// Transform sample data into grid format
function getSampleGridData(): CompGridData {
  const sample = sampleAppraisalData;
  
  return {
    subject: {
      address: sample.property.fullAddress,
      salePrice: '-',
      pricePerSF: '-',
      propertyRights: 'Fee Simple',
      financing: '-',
      conditionsOfSale: '-',
      marketConditions: '-',
      location: 'Subject',
      siteSize: `${sample.site.landArea} AC`,
      buildingSize: `${sample.improvements.grossBuildingArea.toLocaleString()} SF`,
      yearBuilt: String(sample.improvements.yearBuilt),
      condition: sample.improvements.condition,
    },
    comparables: sample.comparables.map((comp, index) => ({
      id: comp.id,
      label: `Sale ${index + 1}`,
      data: {
        address: comp.address,
        salePrice: `$${comp.salePrice.toLocaleString()}`,
        pricePerSF: `$${comp.pricePerSF.toFixed(2)}/SF`,
        propertyRights: 'Fee Simple',
        financing: index % 2 === 0 ? 'Cash' : 'Conventional',
        conditionsOfSale: 'Arms Length',
        marketConditions: '0%',
        location: comp.adjustments.location === 0 ? 'Similar' : 
                  comp.adjustments.location > 0 ? 'Inferior' : 'Superior',
        siteSize: 'Similar',
        buildingSize: `${comp.buildingSize.toLocaleString()} SF`,
        yearBuilt: String(comp.yearBuilt),
        condition: 'Good',
      },
      adjustments: {
        location: Math.round(comp.salePrice * (comp.adjustments.location / 100)),
        siteSize: Math.round(comp.salePrice * (comp.adjustments.size / 100)),
        buildingSize: 0,
        yearBuilt: Math.round(comp.salePrice * (comp.adjustments.age / 100)),
        condition: Math.round(comp.salePrice * (comp.adjustments.condition / 100)),
      },
    })),
    adjustmentRows: ['location', 'siteSize', 'buildingSize', 'yearBuilt', 'condition'],
    totalAdjustmentRow: true,
  };
}

// Default data from sample appraisal
const DEFAULT_SALES_DATA: CompGridData = getSampleGridData();

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

  const getSidebarLabel = () => {
    if (approachType === 'sales') return 'SALES';
    if (approachType === 'income') return 'INCOME';
    return 'COST';
  };

  return (
    <ReportPageBase
      title={title || `${approachType === 'sales' ? 'Sales Comparison' : approachType === 'income' ? 'Income' : 'Cost'} Approach`}
      sidebarLabel={getSidebarLabel()}
      pageNumber={pageNumber}
      sectionNumber={6}
      sectionTitle="VALUATION"
      contentPadding="p-10"
    >
      {/* Map Section - Display above grid if mapData is provided */}
      {mapData && mapData.imageUrl && (
        <div className="px-10 pt-4 pb-2">
          <div className="border border-light-border rounded-lg overflow-hidden bg-white">
            {/* Map Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-surface-2 border-b border-light-border">
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
              <tr className="bg-surface-3">
                <td colSpan={2 + data.comparables.length} className="px-3 py-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Transaction Data
                </td>
              </tr>
              {dataRows.map((rowKey) => (
                <tr 
                  key={rowKey}
                  className={`border-b border-light-border ${isEditing ? 'hover:bg-surface-2 cursor-pointer' : ''}`}
                >
                  <td className="px-3 py-2 font-medium text-slate-700">
                    {ROW_LABELS[rowKey] || rowKey}
                  </td>
                  <td 
                    className="px-3 py-2 text-center bg-surface-2 text-slate-800"
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
              <tr className="bg-surface-3">
                <td colSpan={2 + data.comparables.length} className="px-3 py-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Physical Adjustments
                </td>
              </tr>
              {comparisonRows.map((rowKey) => (
                <tr 
                  key={rowKey}
                  className={`border-b border-light-border ${isEditing ? 'hover:bg-surface-2 cursor-pointer' : ''}`}
                >
                  <td className="px-3 py-2 font-medium text-slate-700">
                    {ROW_LABELS[rowKey] || rowKey}
                  </td>
                  <td className="px-3 py-2 text-center bg-surface-2 text-slate-800">
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
                  <tr className="bg-surface-4 font-semibold">
                    <td className="px-3 py-2 text-slate-800">Net Adjustment</td>
                    <td className="px-3 py-2 text-center bg-surface-3 text-slate-600">-</td>
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
                ${(sampleAppraisalData.valuation.salesComparisonValue * 0.95).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div className="flex-1 h-px bg-slate-300" />
            <div className="text-center">
              <div className="text-xs text-harken-gray-med uppercase mb-1">Indicated Value</div>
              <div className="text-2xl font-bold text-sky-600">
                ${sampleAppraisalData.valuation.salesComparisonValue.toLocaleString()}
              </div>
            </div>
            <div className="flex-1 h-px bg-slate-300" />
            <div className="text-center">
              <div className="text-xs text-harken-gray-med uppercase mb-1">High</div>
              <div className="text-lg font-semibold text-slate-800">
                ${(sampleAppraisalData.valuation.salesComparisonValue * 1.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ReportPageBase>
  );
};

export default ComparisonGridPage;

