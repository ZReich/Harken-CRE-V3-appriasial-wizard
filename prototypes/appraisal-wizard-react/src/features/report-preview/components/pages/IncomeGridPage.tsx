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
  /** Optional: Methodology narrative shown above the income analysis */
  methodologyText?: string;
  /** Optional: Additional narrative/notes shown below */
  narrativeText?: string;
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
  methodologyText,
  narrativeText,
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

  const scenarioMult = (() => {
    const name = (scenarioName || '').toLowerCase();
    if (name.includes('completed')) return 1.15;
    if (name.includes('stabilized')) return 1.08;
    return 1.0;
  })();

  const rentComps = [
    {
      label: 'Rent Comp 1',
      address: `West End Industrial — ${sampleAppraisalData.property.city}`,
      sizeSf: Math.round(sampleAppraisalData.improvements.grossBuildingArea * 0.9),
      yearBuilt: sampleAppraisalData.improvements.yearBuilt - 3,
      rentPsf: (sampleAppraisalData.incomeApproach.marketRentPerSF - 0.75) * scenarioMult,
      notes: 'Slightly inferior clear height; minor positive location.',
    },
    {
      label: 'Rent Comp 2',
      address: `Shiloh Corridor — ${sampleAppraisalData.property.city}`,
      sizeSf: Math.round(sampleAppraisalData.improvements.grossBuildingArea * 1.05),
      yearBuilt: sampleAppraisalData.improvements.yearBuilt - 2,
      rentPsf: (sampleAppraisalData.incomeApproach.marketRentPerSF - 0.25) * scenarioMult,
      notes: 'Similar utility; supported lease structure.',
    },
    {
      label: 'Rent Comp 3',
      address: `Harnish Trade Center — ${sampleAppraisalData.property.city}`,
      sizeSf: Math.round(sampleAppraisalData.improvements.grossBuildingArea * 0.95),
      yearBuilt: sampleAppraisalData.improvements.yearBuilt - 1,
      rentPsf: (sampleAppraisalData.incomeApproach.marketRentPerSF + 0.5) * scenarioMult,
      notes: 'Slightly superior finish; minor downward adjustment applied.',
    },
  ];

  return (
    <ReportPageBase
      title={title}
      sidebarLabel="INC"
      pageNumber={pageNumber}
      sectionNumber={6}
      sectionTitle="VALUATION"
      contentPadding="p-10"
    >
      {/* Methodology */}
      {methodologyText && (
        <div className="px-12 pt-10">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
            Methodology
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {methodologyText}
          </p>
        </div>
      )}

      {/* Photo strip (subject + rental comps) */}
      <div className="px-12 pt-6 pb-2">
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-1">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Subject</div>
            <div className="w-full h-24 rounded-lg overflow-hidden border border-slate-200 bg-white">
              <img
                src={
                  sampleAppraisalData.photos.find((p) => p.category === 'cover')?.url ||
                  sampleAppraisalData.photos.find((p) => p.category === 'exterior')?.url ||
                  sampleAppraisalData.photos[0]?.url
                }
                alt="Subject"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="col-span-1">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Rent Comp {i + 1}</div>
              <div className="w-full h-24 rounded-lg overflow-hidden border border-slate-200 bg-white">
                <img
                  src={
                    sampleAppraisalData.photos.filter((p) => p.category === 'exterior')[i]?.url ||
                    sampleAppraisalData.photos.find((p) => p.category === 'exterior')?.url ||
                    sampleAppraisalData.photos[0]?.url
                  }
                  alt={`Rent comp ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rent Comparable Grid (this is the missing “grid view” justification) */}
      <div className="px-12 pt-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
          Rent Comparable Grid
        </h3>
        <div className="border border-light-border rounded-lg overflow-hidden bg-white">
          <table className="w-full text-xs">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="px-3 py-2 text-left font-semibold w-[140px]">Comparable</th>
                <th className="px-3 py-2 text-left font-semibold">Location</th>
                <th className="px-3 py-2 text-right font-semibold w-[110px]">Size (SF)</th>
                <th className="px-3 py-2 text-right font-semibold w-[90px]">Year</th>
                <th className="px-3 py-2 text-right font-semibold w-[110px]">Rent (PSF)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-surface-3">
                <td className="px-3 py-2 font-semibold text-slate-700 uppercase tracking-wider text-[10px]" colSpan={5}>
                  Subject
                </td>
              </tr>
              <tr className="border-t border-light-border">
                <td className="px-3 py-2 font-medium text-slate-700">Subject</td>
                <td className="px-3 py-2 text-slate-600">{sampleAppraisalData.property.fullAddress}</td>
                <td className="px-3 py-2 text-right text-slate-700">{sampleAppraisalData.improvements.grossBuildingArea.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-slate-700">{sampleAppraisalData.improvements.yearBuilt}</td>
                <td className="px-3 py-2 text-right font-semibold text-slate-800">
                  ${((sampleAppraisalData.incomeApproach.marketRentPerSF ?? 0) * scenarioMult).toFixed(2)}
                </td>
              </tr>
              <tr className="bg-surface-3">
                <td className="px-3 py-2 font-semibold text-slate-700 uppercase tracking-wider text-[10px]" colSpan={5}>
                  Rent Comparables
                </td>
              </tr>
              {rentComps.map((c, idx) => (
                <tr key={c.label} className={`border-t border-light-border ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                  <td className="px-3 py-2 font-medium text-slate-700">{c.label}</td>
                  <td className="px-3 py-2 text-slate-600">
                    <div className="font-medium text-slate-700">{c.address}</div>
                    <div className="text-[10px] text-slate-500">{c.notes}</div>
                  </td>
                  <td className="px-3 py-2 text-right text-slate-700">{c.sizeSf.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-slate-700">{c.yearBuilt}</td>
                  <td className="px-3 py-2 text-right font-semibold text-slate-800">${c.rentPsf.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="bg-slate-100 border-t border-light-border">
                <td className="px-3 py-2 font-semibold text-slate-700" colSpan={4}>Selected Market Rent (PSF)</td>
                <td className="px-3 py-2 text-right font-bold text-sky-600">
                  ${((sampleAppraisalData.incomeApproach.marketRentPerSF ?? 0) * scenarioMult).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

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

        {narrativeText && (
          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-800 mb-2">Narrative & Notes</h4>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{narrativeText}</p>
          </div>
        )}
      </div>
    </ReportPageBase>
  );
};

export default IncomeGridPage;

