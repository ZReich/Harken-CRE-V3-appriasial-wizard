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

type QualitativeAdj = 'Superior' | 'Similar' | 'Inferior' | '-';

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

// --- Wizard-matching Rent Comparable grid (static report version) ---
const LABEL_COL_WIDTH = 140;
const SUBJECT_COL_WIDTH = 170;
const COMP_COL_WIDTH = 160;

function getAdjChipClasses(value: QualitativeAdj): string {
  switch (value) {
    case 'Superior':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Inferior':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'Similar':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-500 border-slate-200';
  }
}

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

  const selectedMarketRentPsf = (sampleAppraisalData.incomeApproach.marketRentPerSF ?? 0) * scenarioMult;

  const subject = {
    addressLine: sampleAppraisalData.property.address,
    cityState: `${sampleAppraisalData.property.city}, ${sampleAppraisalData.property.state}`,
    hbuUse: sampleAppraisalData.property.propertyType,
    sizeSfBldg: sampleAppraisalData.improvements.grossBuildingArea,
    condition: sampleAppraisalData.improvements.condition,
    nnnRentPerSf: selectedMarketRentPsf,
    imageUrl:
      sampleAppraisalData.photos.find((p) => p.category === 'cover')?.url ||
      sampleAppraisalData.photos.find((p) => p.category === 'exterior')?.url ||
      sampleAppraisalData.photos[0]?.url,
  };

  const rentComps = [
    {
      id: 'rent-comp-1',
      leaseDate: sampleAppraisalData.assignment.effectiveDate,
      addressLine: `West End Industrial`,
      cityState: `${sampleAppraisalData.property.city}, ${sampleAppraisalData.property.state}`,
      hbuUse: 'Light Industrial',
      sizeSfBldg: Math.round(sampleAppraisalData.improvements.grossBuildingArea * 0.9),
      condition: 'Good',
      nnnRentPerSf: (sampleAppraisalData.incomeApproach.marketRentPerSF - 0.75) * scenarioMult,
      imageUrl: sampleAppraisalData.photos.filter((p) => p.category === 'exterior')[0]?.url || subject.imageUrl,
      adjustments: {
        locationAdj: 'Inferior' as QualitativeAdj,
        hbuUseAdj: '-' as QualitativeAdj,
        sizeSfBldgAdj: 'Inferior' as QualitativeAdj,
        conditionAdj: 'Similar' as QualitativeAdj,
        overallComparability: 'Inferior' as QualitativeAdj,
      },
    },
    {
      id: 'rent-comp-2',
      leaseDate: sampleAppraisalData.assignment.effectiveDate,
      addressLine: `Shiloh Corridor`,
      cityState: `${sampleAppraisalData.property.city}, ${sampleAppraisalData.property.state}`,
      hbuUse: 'Light Industrial',
      sizeSfBldg: Math.round(sampleAppraisalData.improvements.grossBuildingArea * 1.05),
      condition: 'Good+',
      nnnRentPerSf: (sampleAppraisalData.incomeApproach.marketRentPerSF - 0.25) * scenarioMult,
      imageUrl: sampleAppraisalData.photos.filter((p) => p.category === 'exterior')[1]?.url || subject.imageUrl,
      adjustments: {
        locationAdj: 'Similar' as QualitativeAdj,
        hbuUseAdj: '-' as QualitativeAdj,
        sizeSfBldgAdj: 'Superior' as QualitativeAdj,
        conditionAdj: 'Similar' as QualitativeAdj,
        overallComparability: 'Similar' as QualitativeAdj,
      },
    },
    {
      id: 'rent-comp-3',
      leaseDate: sampleAppraisalData.assignment.effectiveDate,
      addressLine: `Harnish Trade Center`,
      cityState: `${sampleAppraisalData.property.city}, ${sampleAppraisalData.property.state}`,
      hbuUse: 'Light Industrial',
      sizeSfBldg: Math.round(sampleAppraisalData.improvements.grossBuildingArea * 0.95),
      condition: 'Very Good',
      nnnRentPerSf: (sampleAppraisalData.incomeApproach.marketRentPerSF + 0.5) * scenarioMult,
      imageUrl: sampleAppraisalData.photos.filter((p) => p.category === 'exterior')[2]?.url || subject.imageUrl,
      adjustments: {
        locationAdj: 'Superior' as QualitativeAdj,
        hbuUseAdj: '-' as QualitativeAdj,
        sizeSfBldgAdj: 'Similar' as QualitativeAdj,
        conditionAdj: 'Superior' as QualitativeAdj,
        overallComparability: 'Superior' as QualitativeAdj,
      },
    },
  ];

  const transactionRows = [
    { id: 'address', label: 'Address:' },
    { id: 'cityState', label: 'City:' },
    { id: 'hbuUse', label: 'H & B Use:' },
    { id: 'sizeSfBldg', label: 'Size/SF Bldg.:' },
    { id: 'condition', label: 'Condition:' },
    { id: 'nnnRentPerSf', label: 'NNN Rent $/SF:' },
  ];

  const qualitativeRows: Array<{ id: keyof typeof rentComps[number]['adjustments']; label: string }> = [
    { id: 'locationAdj', label: 'Location:' },
    { id: 'hbuUseAdj', label: 'H & B Use:' },
    { id: 'sizeSfBldgAdj', label: 'Size/SF Bldg.:' },
    { id: 'conditionAdj', label: 'Condition:' },
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

      {/* Rent Comparable Grid (wizard-matching layout: photos in column headers + transaction/qualitative sections) */}
      <div className="px-12 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Rent Comparable Grid
          </h3>
          {scenarioName && (
            <div className="text-xs text-slate-500">
              Scenario: <span className="font-semibold text-slate-700">{scenarioName}</span>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-light-border bg-white overflow-hidden">
          <div className="overflow-hidden">
            <div
              className="grid relative"
              style={{
                gridTemplateColumns: `${LABEL_COL_WIDTH}px ${SUBJECT_COL_WIDTH}px repeat(${rentComps.length}, ${COMP_COL_WIDTH}px)`,
              }}
            >
              {/* Header: Element label */}
              <div
                className="bg-white border-b border-light-border flex items-end"
                style={{ width: LABEL_COL_WIDTH, height: 120 }}
              >
                <div className="p-2 pl-3">
                  <div className="font-bold text-slate-400 text-xs uppercase tracking-wider">Element</div>
                </div>
              </div>

              {/* Header: Subject */}
              <div
                className="border-b-2 border-sky-600 flex flex-col bg-white"
                style={{ width: SUBJECT_COL_WIDTH, height: 120 }}
              >
                <div className="relative h-16 w-full overflow-hidden">
                  <img src={subject.imageUrl} alt="Subject Property" className="w-full h-full object-cover" />
                  <div className="absolute top-1.5 left-1.5 bg-sky-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                    SUBJECT
                  </div>
                </div>
                <div className="p-2 flex-1 flex flex-col gap-0.5 bg-sky-50 border-r border-light-border">
                  <h3 className="font-bold text-slate-800 text-xs leading-tight line-clamp-1" title={subject.addressLine}>
                    {subject.addressLine}
                  </h3>
                  <div className="flex items-start gap-1 text-[10px] text-slate-500">
                    <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-sky-600" />
                    <span className="line-clamp-1 leading-tight">{subject.cityState}</span>
                  </div>
                </div>
              </div>

              {/* Header: comps with photos */}
              {rentComps.map((comp) => (
                <div key={comp.id} className="border-b border-light-border flex flex-col bg-white" style={{ height: 120 }}>
                  <div className="relative h-16 w-full overflow-hidden">
                    <img src={comp.imageUrl} alt={comp.addressLine} className="w-full h-full object-cover" />
                    <div className="absolute top-1.5 right-1.5 bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded shadow-sm">
                      {comp.leaseDate}
                    </div>
                  </div>
                  <div className="p-2 flex-1 flex flex-col gap-0.5 bg-white border-r border-light-border">
                    <h3 className="font-bold text-slate-800 text-xs leading-tight line-clamp-1" title={comp.addressLine}>
                      {comp.addressLine}
                    </h3>
                    <div className="flex items-start gap-1 text-[10px] text-slate-500">
                      <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-slate-400" />
                      <span className="line-clamp-1 leading-tight">{comp.cityState}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Transaction section separator */}
              <div className="col-span-full bg-slate-50 border-y border-light-border px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-600">
                Transaction Data
              </div>

              {/* Transaction rows */}
              {transactionRows.map((row) => (
                <React.Fragment key={row.id}>
                  <div className="border-r border-b border-light-border flex items-center px-2 py-1.5 bg-white" style={{ width: LABEL_COL_WIDTH }}>
                    <span className="text-xs font-medium text-slate-600 truncate">{row.label}</span>
                  </div>
                  <div className="border-r border-b border-light-border p-2 flex items-center justify-center text-xs bg-sky-50" style={{ width: SUBJECT_COL_WIDTH }}>
                    <span className="font-medium text-slate-700">
                      {row.id === 'address' ? subject.addressLine :
                       row.id === 'cityState' ? subject.cityState :
                       row.id === 'hbuUse' ? subject.hbuUse :
                       row.id === 'sizeSfBldg' ? subject.sizeSfBldg.toLocaleString() :
                       row.id === 'condition' ? subject.condition :
                       row.id === 'nnnRentPerSf' ? `$${subject.nnnRentPerSf.toFixed(2)}` : '-'}
                    </span>
                  </div>
                  {rentComps.map((comp) => (
                    <div key={`${row.id}-${comp.id}`} className="border-r border-b border-light-border p-2 flex items-center justify-center text-xs bg-white">
                      <span className="font-medium text-slate-700">
                        {row.id === 'address' ? comp.addressLine :
                         row.id === 'cityState' ? comp.cityState :
                         row.id === 'hbuUse' ? comp.hbuUse :
                         row.id === 'sizeSfBldg' ? comp.sizeSfBldg.toLocaleString() :
                         row.id === 'condition' ? comp.condition :
                         row.id === 'nnnRentPerSf' ? `$${comp.nnnRentPerSf.toFixed(2)}` : '-'}
                      </span>
                    </div>
                  ))}
                </React.Fragment>
              ))}

              {/* Qualitative section separator */}
              <div className="col-span-full bg-slate-50 border-y border-light-border px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-600 mt-3">
                Qualitative Adjustments
              </div>

              {qualitativeRows.map((row) => (
                <React.Fragment key={row.id}>
                  <div className="border-r border-b border-light-border flex items-center px-2 py-1.5 bg-white" style={{ width: LABEL_COL_WIDTH }}>
                    <span className="text-xs font-medium text-slate-600 truncate">{row.label}</span>
                  </div>
                  <div className="border-r border-b border-light-border p-2 flex items-center justify-center text-xs bg-sky-50" style={{ width: SUBJECT_COL_WIDTH }}>
                    <span className="font-medium text-slate-700">—</span>
                  </div>
                  {rentComps.map((comp) => (
                    <div key={`${row.id}-${comp.id}`} className="border-r border-b border-light-border p-2 flex items-center justify-center text-xs bg-white">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getAdjChipClasses(comp.adjustments[row.id])}`}>
                        {comp.adjustments[row.id]}
                      </span>
                    </div>
                  ))}
                </React.Fragment>
              ))}

              {/* Overall comparability footer */}
              <div className="border-b border-sky-600 bg-sky-600 p-3 flex items-center" style={{ width: LABEL_COL_WIDTH }}>
                <span className="text-xs font-bold text-white uppercase tracking-wide">Overall</span>
              </div>
              <div className="border-b border-light-border bg-sky-50 p-3" style={{ width: SUBJECT_COL_WIDTH }} />
              {rentComps.map((comp) => (
                <div key={`overall-${comp.id}`} className="border-b border-light-border bg-white p-3 flex items-center justify-center">
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getAdjChipClasses(comp.adjustments.overallComparability)}`}>
                    {comp.adjustments.overallComparability}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Conclusion summary (wizard-style) */}
          <div className="border-t border-light-border bg-slate-50 p-4">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-sm text-slate-500 font-medium mb-2">Subject Size</div>
                <div className="text-2xl font-bold text-slate-800">{subject.sizeSfBldg.toLocaleString()} SF</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-500 font-medium mb-2">Indicated Market Rent</div>
                <div className="text-2xl font-bold text-sky-600">${selectedMarketRentPsf.toFixed(2)}/SF</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-500 font-medium mb-2">Annual Rent Potential</div>
                <div className="text-2xl font-bold text-emerald-600">
                  ${Math.round(selectedMarketRentPsf * subject.sizeSfBldg).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
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

