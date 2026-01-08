/**
 * DepreciationSchedule Component
 * 
 * Displays year-by-year depreciation projections showing tax benefits
 * by depreciation class.
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  TrendingDown, 
  Download,
  ChevronLeft,
  ChevronRight,
  Info,
  BarChart3,
} from 'lucide-react';
import { formatCostSegCurrency } from '../../../services/costSegregationService';
import type { CostSegAnalysis, DepreciationYearProjection } from '../../../types';

interface DepreciationScheduleProps {
  analysis: CostSegAnalysis;
  onExport?: () => void;
  className?: string;
}

export const DepreciationSchedule: React.FC<DepreciationScheduleProps> = ({
  analysis,
  onExport,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [yearRange, setYearRange] = useState({ start: 0, count: 10 });

  const schedule = analysis.depreciationSchedule;
  const displayedYears = schedule.slice(yearRange.start, yearRange.start + yearRange.count);
  
  const canGoBack = yearRange.start > 0;
  const canGoForward = yearRange.start + yearRange.count < schedule.length;

  const handlePrevious = () => {
    if (canGoBack) {
      setYearRange(prev => ({ ...prev, start: Math.max(0, prev.start - prev.count) }));
    }
  };

  const handleNext = () => {
    if (canGoForward) {
      setYearRange(prev => ({ ...prev, start: prev.start + prev.count }));
    }
  };

  // Calculate totals for displayed years
  const displayedTotals = {
    fiveYear: displayedYears.reduce((sum, y) => sum + y.fiveYearDepreciation, 0),
    fifteenYear: displayedYears.reduce((sum, y) => sum + y.fifteenYearDepreciation, 0),
    thirtyNineYear: displayedYears.reduce((sum, y) => sum + y.thirtyNineYearDepreciation, 0),
    total: displayedYears.reduce((sum, y) => sum + y.totalDepreciation, 0),
  };

  // Find max depreciation for chart scaling
  const maxDepreciation = Math.max(...schedule.map(y => y.totalDepreciation));

  return (
    <div className={`bg-surface-1 rounded-xl border border-light-border dark:border-dark-border shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-light-border dark:border-dark-border bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0da1c7]/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#0da1c7]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Depreciation Schedule</h3>
              <p className="text-sm text-slate-500">
                {schedule.length}-Year MACRS Projection
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-surface-3 dark:bg-elevation-subtle rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-surface-1 text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'chart'
                    ? 'bg-surface-1 text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chart
              </button>
            </div>
            {onExport && (
              <button
                onClick={onExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#0da1c7] text-white rounded-lg hover:bg-[#0b8eb1] transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics Bar */}
      <div className="px-6 py-4 bg-surface-2 dark:bg-elevation-2 border-b border-light-border dark:border-dark-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Year 1 Depreciation</div>
            <div className="text-lg font-bold text-slate-900">
              {formatCostSegCurrency(analysis.firstYearDepreciation)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Accelerated Benefit</div>
            <div className="text-lg font-bold text-accent-teal-mint">
              +{formatCostSegCurrency(analysis.acceleratedBenefit)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Basis</div>
            <div className="text-lg font-bold text-slate-900">
              {formatCostSegCurrency(analysis.totalImprovementCost)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Remaining (Yr {schedule.length})</div>
            <div className="text-lg font-bold text-slate-900">
              {formatCostSegCurrency(schedule[schedule.length - 1]?.remainingBasis || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'table' ? (
          <>
            {/* Table View */}
            <div className="border border-light-border dark:border-dark-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-2 dark:bg-elevation-2 border-b border-light-border dark:border-dark-border">
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-700">Year</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-accent-teal-mint">5-Year</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-blue-700">15-Year</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-slate-700">39-Year</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-slate-900">Total</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-slate-700">Cumulative</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-slate-700">Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedYears.map((year, index) => (
                    <tr 
                      key={year.year}
                      className={`border-b border-light-border dark:border-dark-border ${index % 2 === 1 ? 'bg-surface-2 dark:bg-elevation-2/30' : ''} ${
                        year.year === 1 ? 'bg-accent-teal-mint-light/50' : ''
                      }`}
                    >
                      <td className="px-4 py-2.5 font-medium text-slate-900">
                        Year {year.year}
                      </td>
                      <td className="px-4 py-2.5 text-right text-accent-teal-mint">
                        {formatCostSegCurrency(year.fiveYearDepreciation)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-blue-700">
                        {formatCostSegCurrency(year.fifteenYearDepreciation)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-600">
                        {formatCostSegCurrency(year.thirtyNineYearDepreciation)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-900">
                        {formatCostSegCurrency(year.totalDepreciation)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-600">
                        {formatCostSegCurrency(year.cumulativeDepreciation)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-600">
                        {formatCostSegCurrency(year.remainingBasis)}
                      </td>
                    </tr>
                  ))}
                  {/* Subtotal Row */}
                  <tr className="bg-surface-3 dark:bg-elevation-subtle font-semibold">
                    <td className="px-4 py-2.5 text-slate-900">
                      Subtotal (Yrs {yearRange.start + 1}-{yearRange.start + displayedYears.length})
                    </td>
                    <td className="px-4 py-2.5 text-right text-accent-teal-mint">
                      {formatCostSegCurrency(displayedTotals.fiveYear)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-blue-700">
                      {formatCostSegCurrency(displayedTotals.fifteenYear)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-700">
                      {formatCostSegCurrency(displayedTotals.thirtyNineYear)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-900">
                      {formatCostSegCurrency(displayedTotals.total)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-700">-</td>
                    <td className="px-4 py-2.5 text-right text-slate-700">-</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {schedule.length > yearRange.count && (
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={handlePrevious}
                  disabled={!canGoBack}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    canGoBack
                      ? 'text-slate-600 hover:bg-surface-3 dark:hover:bg-elevation-subtle'
                      : 'text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-sm text-slate-500">
                  Showing years {yearRange.start + 1}-{yearRange.start + displayedYears.length} of {schedule.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={!canGoForward}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    canGoForward
                      ? 'text-slate-600 hover:bg-surface-3 dark:hover:bg-elevation-subtle'
                      : 'text-slate-300 cursor-not-allowed'
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Chart View */
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-accent-teal-mint rounded" />
                <span className="text-sm text-slate-600">5-Year</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <span className="text-sm text-slate-600">15-Year</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-400 rounded" />
                <span className="text-sm text-slate-600">39-Year</span>
              </div>
            </div>

            {/* Simple Bar Chart */}
            <div className="space-y-2">
              {schedule.slice(0, 15).map((year) => (
                <div key={year.year} className="flex items-center gap-3">
                  <div className="w-16 text-sm text-slate-600 text-right">Year {year.year}</div>
                  <div className="flex-1 flex h-6 gap-0.5 rounded overflow-hidden bg-surface-3 dark:bg-elevation-subtle">
                    {/* 5-Year */}
                    <div
                      className="bg-accent-teal-mint transition-all duration-300"
                      style={{ 
                        width: maxDepreciation > 0 
                          ? `${(year.fiveYearDepreciation / maxDepreciation) * 100}%` 
                          : '0%' 
                      }}
                      title={`5-Year: ${formatCostSegCurrency(year.fiveYearDepreciation)}`}
                    />
                    {/* 15-Year */}
                    <div
                      className="bg-blue-500 transition-all duration-300"
                      style={{ 
                        width: maxDepreciation > 0 
                          ? `${(year.fifteenYearDepreciation / maxDepreciation) * 100}%` 
                          : '0%' 
                      }}
                      title={`15-Year: ${formatCostSegCurrency(year.fifteenYearDepreciation)}`}
                    />
                    {/* 39-Year */}
                    <div
                      className="bg-slate-400 transition-all duration-300"
                      style={{ 
                        width: maxDepreciation > 0 
                          ? `${(year.thirtyNineYearDepreciation / maxDepreciation) * 100}%` 
                          : '0%' 
                      }}
                      title={`39-Year: ${formatCostSegCurrency(year.thirtyNineYearDepreciation)}`}
                    />
                  </div>
                  <div className="w-24 text-sm text-slate-700 text-right font-medium">
                    {formatCostSegCurrency(year.totalDepreciation)}
                  </div>
                </div>
              ))}
            </div>

            {schedule.length > 15 && (
              <p className="text-xs text-slate-500 text-center">
                Showing first 15 years. Switch to table view for full schedule.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
        <div className="flex items-start gap-2 text-xs text-blue-700">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p>
            Depreciation calculated using MACRS rates per IRS Publication 946. 5-year property uses 
            200% declining balance switching to straight-line. 15-year property uses 150% declining 
            balance. 39-year property uses straight-line with mid-month convention.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DepreciationSchedule;

