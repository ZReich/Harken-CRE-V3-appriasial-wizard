import React from 'react';
import { MapPin } from 'lucide-react';
import type { MapData } from '../../../../types';
import { MARKER_COLORS } from '../../../../services/mapGenerationService';
import { ReportPageBase } from './ReportPageBase';
import { sampleAppraisalData } from '../../../review/data/sampleAppraisalData';

interface IncomeGridPageProps {
  title?: string;
  pageNumber?: number;
  scenarioId?: number;
  scenarioName?: string;
  data?: IncomeGridData;
  isEditing?: boolean;
  onCellClick?: (row: string, col: string) => void;
  /** Optional map data for rental comparables display */
  mapData?: MapData;
}

interface IncomeGridData {
  pgi?: number;
  vacancy?: number;
  egi?: number;
  expenses?: Record<string, number>;
  totalExpenses?: number;
  noi?: number;
  capRate?: number;
  indicatedValue?: number;
}

// Build default income data from sample appraisal
function getSampleIncomeData(): IncomeGridData {
  const income = sampleAppraisalData.incomeApproach;
  return {
    pgi: income.potentialGrossIncome,
    vacancy: Math.round(income.potentialGrossIncome * (income.vacancyRate / 100)),
    egi: income.effectiveGrossIncome,
    expenses: {
      propertyTaxes: Math.round(income.operatingExpenses * 0.45),
      insurance: Math.round(income.operatingExpenses * 0.17),
      utilities: Math.round(income.operatingExpenses * 0.13),
      repairs: Math.round(income.operatingExpenses * 0.25),
      management: Math.round(income.effectiveGrossIncome * 0.05),
      reserves: Math.round(income.operatingExpenses * 0.10),
    },
    totalExpenses: income.operatingExpenses,
    noi: income.netOperatingIncome,
    capRate: income.capRate,
    indicatedValue: income.valueConclusion,
  };
}

const DEFAULT_INCOME_DATA: IncomeGridData = getSampleIncomeData();

export const IncomeGridPage: React.FC<IncomeGridPageProps> = ({
  title = 'Income Approach',
  pageNumber,
  scenarioName,
  data = DEFAULT_INCOME_DATA,
  isEditing = false,
  onCellClick,
  mapData,
}) => {
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined) return '-';
    return `$${value.toLocaleString()}`;
  };

  const formatPercent = (value: number | undefined): string => {
    if (value === undefined) return '-';
    return `${value.toFixed(2)}%`;
  };

  return (
    <ReportPageBase
      title={title}
      sidebarLabel="INC"
      pageNumber={pageNumber}
      sectionNumber={6}
      sectionTitle="VALUATION"
      contentPadding="p-10"
    >
      {/* Map Section - Display rental comparables map if provided */}
      {mapData && mapData.imageUrl && (
        <div className="px-12 pt-4 pb-2">
          <div className="border border-light-border rounded-lg overflow-hidden bg-white">
            {/* Map Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-surface-2 border-b border-light-border">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent-teal-mint" />
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
                    style={{ backgroundColor: MARKER_COLORS.rental }}
                  />
                  <span className="text-slate-500">Rental Comparables</span>
                </div>
              </div>
            </div>
            {/* Map Image */}
            <div className="relative" style={{ height: '180px' }}>
              <img 
                src={mapData.imageUrl} 
                alt={mapData.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-12 py-6 overflow-auto">
        <div className="grid grid-cols-2 gap-8">
          {/* Pro Forma */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Operating Statement</h3>
            
            <div className="border border-light-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {/* Income Section */}
                  <tr className="bg-surface-3">
                    <td colSpan={2} className="px-4 py-2 font-semibold text-slate-600 uppercase text-xs tracking-wider">
                      Income
                    </td>
                  </tr>
                  <tr className="border-b border-light-border">
                    <td className="px-4 py-2 text-slate-700">Potential Gross Income</td>
                    <td 
                      className={`px-4 py-2 text-right font-medium text-slate-800 ${isEditing ? 'cursor-pointer hover:bg-surface-2' : ''}`}
                      onClick={() => isEditing && onCellClick?.('pgi', 'value')}
                    >
                      {formatCurrency(data.pgi)}
                    </td>
                  </tr>
                  <tr className="border-b border-light-border">
                    <td className="px-4 py-2 text-slate-700">Less: Vacancy & Collection Loss</td>
                    <td className="px-4 py-2 text-right font-medium text-harken-error">
                      ({formatCurrency(data.vacancy)})
                    </td>
                  </tr>
                  <tr className="border-b border-light-border bg-surface-2">
                    <td className="px-4 py-2 font-semibold text-slate-800">Effective Gross Income</td>
                    <td className="px-4 py-2 text-right font-bold text-slate-800">
                      {formatCurrency(data.egi)}
                    </td>
                  </tr>

                  {/* Expenses Section */}
                  <tr className="bg-surface-3">
                    <td colSpan={2} className="px-4 py-2 font-semibold text-slate-600 uppercase text-xs tracking-wider">
                      Operating Expenses
                    </td>
                  </tr>
                  {data.expenses && Object.entries(data.expenses).map(([key, value]) => (
                    <tr key={key} className="border-b border-light-border">
                      <td className="px-4 py-2 text-slate-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-600">
                        {formatCurrency(value)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-b border-light-border bg-harken-gray-light">
                    <td className="px-4 py-2 font-semibold text-slate-800">Total Expenses</td>
                    <td className="px-4 py-2 text-right font-bold text-harken-error">
                      ({formatCurrency(data.totalExpenses)})
                    </td>
                  </tr>

                  {/* NOI */}
                  <tr className="bg-slate-800 text-white">
                    <td className="px-4 py-3 font-bold">Net Operating Income</td>
                    <td className="px-4 py-3 text-right font-bold text-lg">
                      {formatCurrency(data.noi)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Capitalization */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Direct Capitalization</h3>
            
            <div className="border border-light-border rounded-lg p-6 bg-harken-gray-light">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-light-border">
                  <span className="text-harken-gray">Net Operating Income</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(data.noi)}</span>
                </div>
                
                <div className="flex justify-between items-center pb-4 border-b border-light-border">
                  <span className="text-harken-gray">Capitalization Rate</span>
                  <span className="font-semibold text-slate-800">{formatPercent(data.capRate)}</span>
                </div>
                
                <div className="pt-4">
                  <div className="text-center">
                    <div className="text-sm text-harken-gray-med mb-2">Value = NOI ÷ Cap Rate</div>
                    <div className="text-3xl font-bold text-sky-600">
                      {formatCurrency(data.indicatedValue)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cap Rate Support */}
            <div className="mt-6">
              <h4 className="font-semibold text-slate-800 mb-3">Capitalization Rate Support</h4>
              <div className="border border-light-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-surface-3">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Source</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600">Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-light-border">
                      <td className="px-3 py-2 text-slate-700">Comparable Sales</td>
                      <td className="px-3 py-2 text-center text-slate-600">7.5% - 9.0%</td>
                    </tr>
                    <tr className="border-b border-light-border">
                      <td className="px-3 py-2 text-slate-700">Investor Surveys</td>
                      <td className="px-3 py-2 text-center text-slate-600">8.0% - 9.5%</td>
                    </tr>
                    <tr className="border-b border-light-border">
                      <td className="px-3 py-2 text-slate-700">Band of Investment</td>
                      <td className="px-3 py-2 text-center text-slate-600">8.25%</td>
                    </tr>
                    <tr className="bg-surface-2">
                      <td className="px-3 py-2 font-semibold text-slate-800">Selected Rate</td>
                      <td className="px-3 py-2 text-center font-bold text-sky-600">{formatPercent(data.capRate)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ReportPageBase>
  );
};

export default IncomeGridPage;

