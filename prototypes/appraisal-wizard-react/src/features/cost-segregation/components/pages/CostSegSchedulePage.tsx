/**
 * CostSegSchedulePage Component
 * 
 * Depreciation schedule page for the Cost Segregation report.
 */

import React from 'react';
import { formatCostSegCurrency } from '../../../../services/costSegregationService';
import type { CostSegAnalysis } from '../../../../types';

interface CostSegSchedulePageProps {
  analysis: CostSegAnalysis;
  maxYears?: number;
  className?: string;
}

export const CostSegSchedulePage: React.FC<CostSegSchedulePageProps> = ({
  analysis,
  maxYears = 15,
  className = '',
}) => {
  const schedule = analysis.depreciationSchedule.slice(0, maxYears);
  const totalDepreciation = analysis.depreciationSchedule.reduce(
    (sum, y) => sum + y.totalDepreciation, 
    0
  );

  return (
    <div className={`bg-white p-12 ${className}`}>
      <h2 className="text-2xl font-bold text-[#1c3643] mb-6 pb-4 border-b-2 border-[#0da1c7]">
        Depreciation Schedule
      </h2>

      <p className="text-sm text-slate-600 mb-6">
        The following schedule shows year-by-year depreciation by asset class using Modified 
        Accelerated Cost Recovery System (MACRS) rates per IRS Publication 946. Depreciation 
        amounts shown are based on the half-year convention for personal property and land 
        improvements, and mid-month convention for real property.
      </p>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
            Total Depreciable Basis
          </div>
          <div className="text-lg font-bold text-slate-900">
            {formatCostSegCurrency(analysis.totalImprovementCost)}
          </div>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 text-center">
          <div className="text-xs text-emerald-600 uppercase tracking-wide mb-1">
            Year 1 Depreciation
          </div>
          <div className="text-lg font-bold text-emerald-700">
            {formatCostSegCurrency(analysis.firstYearDepreciation)}
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
          <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">
            Accelerated Benefit
          </div>
          <div className="text-lg font-bold text-blue-700">
            +{formatCostSegCurrency(analysis.acceleratedBenefit)}
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
            Recovery Period
          </div>
          <div className="text-lg font-bold text-slate-900">
            {analysis.isResidential ? '27.5' : '39'} Years
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Year</th>
              <th className="text-right py-3 px-4 font-semibold text-emerald-700">5-Year</th>
              {analysis.summary.sevenYear.total > 0 && (
                <th className="text-right py-3 px-4 font-semibold text-green-700">7-Year</th>
              )}
              <th className="text-right py-3 px-4 font-semibold text-blue-700">15-Year</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-600">
                {analysis.isResidential ? '27.5-Year' : '39-Year'}
              </th>
              <th className="text-right py-3 px-4 font-semibold text-slate-900">Total</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-700">Cumulative</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-700">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((year, idx) => {
              const isFirstYear = year.year === 1;
              return (
                <tr 
                  key={year.year}
                  className={`border-b border-slate-100 ${
                    isFirstYear ? 'bg-emerald-50/50' : idx % 2 === 1 ? 'bg-slate-50/50' : ''
                  }`}
                >
                  <td className={`py-2.5 px-4 font-medium ${isFirstYear ? 'text-emerald-800' : 'text-slate-900'}`}>
                    Year {year.year}
                    {isFirstYear && <span className="ml-2 text-xs text-emerald-600">(1st Year)</span>}
                  </td>
                  <td className="py-2.5 px-4 text-right text-emerald-700">
                    {formatCostSegCurrency(year.fiveYearDepreciation)}
                  </td>
                  {analysis.summary.sevenYear.total > 0 && (
                    <td className="py-2.5 px-4 text-right text-green-700">
                      {formatCostSegCurrency(year.sevenYearDepreciation)}
                    </td>
                  )}
                  <td className="py-2.5 px-4 text-right text-blue-700">
                    {formatCostSegCurrency(year.fifteenYearDepreciation)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-600">
                    {formatCostSegCurrency(
                      analysis.isResidential 
                        ? year.twentySevenFiveYearDepreciation 
                        : year.thirtyNineYearDepreciation
                    )}
                  </td>
                  <td className={`py-2.5 px-4 text-right font-semibold ${isFirstYear ? 'text-emerald-800' : 'text-slate-900'}`}>
                    {formatCostSegCurrency(year.totalDepreciation)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-600">
                    {formatCostSegCurrency(year.cumulativeDepreciation)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-600">
                    {formatCostSegCurrency(year.remainingBasis)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {schedule.length < analysis.depreciationSchedule.length && (
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200">
                <td colSpan={analysis.summary.sevenYear.total > 0 ? 8 : 7} className="py-3 px-4 text-center text-sm text-slate-500">
                  Showing first {schedule.length} years of {analysis.depreciationSchedule.length}-year recovery period
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* MACRS Notes */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">MACRS Depreciation Methods</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <strong>5-Year & 7-Year Property:</strong>
            <ul className="mt-1 ml-4 list-disc">
              <li>200% Declining Balance Method</li>
              <li>Half-Year Convention</li>
              <li>Switching to Straight-Line</li>
            </ul>
          </div>
          <div>
            <strong>15-Year Property:</strong>
            <ul className="mt-1 ml-4 list-disc">
              <li>150% Declining Balance Method</li>
              <li>Half-Year Convention</li>
              <li>Switching to Straight-Line</li>
            </ul>
          </div>
          <div>
            <strong>{analysis.isResidential ? '27.5' : '39'}-Year Property:</strong>
            <ul className="mt-1 ml-4 list-disc">
              <li>Straight-Line Method</li>
              <li>Mid-Month Convention</li>
              <li>No switching required</li>
            </ul>
          </div>
          <div>
            <strong>Reference:</strong>
            <ul className="mt-1 ml-4 list-disc">
              <li>IRS Publication 946</li>
              <li>IRC Section 168</li>
              <li>MACRS Tables A-1 through A-6</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostSegSchedulePage;
