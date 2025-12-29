/**
 * CostSegSchedulePage Component
 * 
 * Year-by-year depreciation projection table for the Cost Seg report.
 */

import React from 'react';
import type { CostSegAnalysis } from '../../types';

interface CostSegSchedulePageProps {
  analysis: CostSegAnalysis;
  showYears?: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function CostSegSchedulePage({ analysis, showYears = 15 }: CostSegSchedulePageProps) {
  const { depreciationSchedule } = analysis;
  const displayYears = depreciationSchedule.years.slice(0, showYears);

  return (
    <div className="min-h-[11in] bg-white p-12" data-page="schedule">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Depreciation Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">
            {showYears}-Year Projection | Start Year: {depreciationSchedule.startYear}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          {analysis.propertyAddress}
        </div>
      </div>

      {/* Schedule Parameters */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Tax Rate</div>
          <div className="font-semibold text-gray-900">
            {(depreciationSchedule.taxRate * 100).toFixed(0)}%
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Bonus Rate</div>
          <div className="font-semibold text-gray-900">
            {(depreciationSchedule.bonusRate * 100).toFixed(0)}%
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Convention</div>
          <div className="font-semibold text-gray-900">
            {depreciationSchedule.midYearConvention ? 'Half-Year' : 'Full-Year'}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Total Basis</div>
          <div className="font-semibold text-gray-900">
            {formatCurrency(analysis.depreciableBasis)}
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-300">
              Year
            </th>
            <th className="px-2 py-2 text-right font-semibold text-emerald-700 border-b border-gray-300">
              5-Year
            </th>
            <th className="px-2 py-2 text-right font-semibold text-teal-700 border-b border-gray-300">
              7-Year
            </th>
            <th className="px-2 py-2 text-right font-semibold text-amber-700 border-b border-gray-300">
              15-Year
            </th>
            <th className="px-2 py-2 text-right font-semibold text-slate-700 border-b border-gray-300">
              Real Property
            </th>
            <th className="px-2 py-2 text-right font-semibold text-gray-900 border-b border-gray-300">
              Total
            </th>
            <th className="px-2 py-2 text-right font-semibold text-gray-700 border-b border-gray-300">
              Cumulative
            </th>
            <th className="px-2 py-2 text-right font-semibold text-gray-700 border-b border-gray-300">
              Remaining
            </th>
            <th className="px-2 py-2 text-right font-semibold text-emerald-700 border-b border-gray-300">
              Tax Savings
            </th>
          </tr>
        </thead>
        <tbody>
          {displayYears.map((year, index) => (
            <tr 
              key={year.year}
              className={`border-b border-gray-100 ${year.year === 1 ? 'bg-emerald-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
            >
              <td className="px-2 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">Year {year.year}</span>
                  <span className="text-xs text-gray-500">({year.calendarYear})</span>
                </div>
              </td>
              <td className="px-2 py-2 text-right text-emerald-600 font-medium">
                {year.byClass.fiveYear > 0 ? formatCurrency(year.byClass.fiveYear) : '-'}
              </td>
              <td className="px-2 py-2 text-right text-teal-600 font-medium">
                {year.byClass.sevenYear > 0 ? formatCurrency(year.byClass.sevenYear) : '-'}
              </td>
              <td className="px-2 py-2 text-right text-amber-600 font-medium">
                {year.byClass.fifteenYear > 0 ? formatCurrency(year.byClass.fifteenYear) : '-'}
              </td>
              <td className="px-2 py-2 text-right text-slate-600">
                {year.byClass.realProperty > 0 ? formatCurrency(year.byClass.realProperty) : '-'}
              </td>
              <td className="px-2 py-2 text-right font-semibold text-gray-900">
                {formatCurrency(year.totalDepreciation)}
              </td>
              <td className="px-2 py-2 text-right text-gray-600">
                {formatCurrency(year.cumulativeDepreciation)}
              </td>
              <td className="px-2 py-2 text-right text-gray-600">
                {formatCurrency(year.remainingBasis)}
              </td>
              <td className="px-2 py-2 text-right font-medium text-emerald-600">
                {formatCurrency(year.taxSavings)}
              </td>
            </tr>
          ))}
          {/* Total Row */}
          <tr className="bg-gray-100 font-semibold border-t-2 border-gray-300">
            <td className="px-2 py-3 text-gray-900">
              Total ({showYears} Years)
            </td>
            <td className="px-2 py-3 text-right text-emerald-700">
              {formatCurrency(displayYears.reduce((sum, y) => sum + y.byClass.fiveYear, 0))}
            </td>
            <td className="px-2 py-3 text-right text-teal-700">
              {formatCurrency(displayYears.reduce((sum, y) => sum + y.byClass.sevenYear, 0))}
            </td>
            <td className="px-2 py-3 text-right text-amber-700">
              {formatCurrency(displayYears.reduce((sum, y) => sum + y.byClass.fifteenYear, 0))}
            </td>
            <td className="px-2 py-3 text-right text-slate-700">
              {formatCurrency(displayYears.reduce((sum, y) => sum + y.byClass.realProperty, 0))}
            </td>
            <td className="px-2 py-3 text-right text-gray-900">
              {formatCurrency(displayYears.reduce((sum, y) => sum + y.totalDepreciation, 0))}
            </td>
            <td className="px-2 py-3 text-right text-gray-700">-</td>
            <td className="px-2 py-3 text-right text-gray-700">-</td>
            <td className="px-2 py-3 text-right text-emerald-700">
              {formatCurrency(displayYears.reduce((sum, y) => sum + y.taxSavings, 0))}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Notes */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
        <p className="font-medium text-gray-700 mb-1">Notes:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Year 1 includes bonus depreciation on eligible 5-year, 7-year, and 15-year property.</li>
          <li>Real property depreciation uses mid-month convention for the first and last years.</li>
          <li>Tax savings calculated at {(depreciationSchedule.taxRate * 100).toFixed(0)}% marginal rate.</li>
          <li>Actual tax benefits may vary based on taxpayer's specific situation.</li>
        </ul>
      </div>
    </div>
  );
}

export default CostSegSchedulePage;

