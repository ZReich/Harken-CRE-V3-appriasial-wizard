/**
 * DepreciationSchedule Component
 * 
 * Year-by-year depreciation projection table with cumulative benefits.
 */

import React, { useState, useMemo } from 'react';
import { Calendar, ChevronDown, ChevronUp, Download } from 'lucide-react';
import type { DepreciationSchedule as DepreciationScheduleType, DepreciationYearEntry } from '../types';

interface DepreciationScheduleProps {
  schedule: DepreciationScheduleType;
  showYears?: number;
  onExport?: () => void;
}

function formatCurrency(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1000000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function DepreciationSchedule({ 
  schedule, 
  showYears = 10,
  onExport 
}: DepreciationScheduleProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
  // Display years based on expansion state
  const displayYears = useMemo(() => {
    const allYears = schedule.years.filter(y => y.totalDepreciation > 0 || y.year <= 40);
    return expanded ? allYears : allYears.slice(0, showYears);
  }, [schedule.years, expanded, showYears]);
  
  const hasMoreYears = schedule.years.filter(y => y.totalDepreciation > 0).length > showYears;
  
  // Calculate max values for bar chart scaling
  const maxDepreciation = Math.max(...schedule.years.map(y => y.totalDepreciation));
  
  // Get selected year details
  const selectedYearData = selectedYear 
    ? schedule.years.find(y => y.year === selectedYear) 
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="text-[#0da1c7]" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">
            Depreciation Schedule
          </h3>
        </div>
        
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Download size={16} />
            Export
          </button>
        )}
      </div>
      
      {/* Schedule Info */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>Start Year: {schedule.startYear}</span>
        <span className="text-gray-300">|</span>
        <span>Tax Rate: {(schedule.taxRate * 100).toFixed(0)}%</span>
        {schedule.bonusRate > 0 && (
          <>
            <span className="text-gray-300">|</span>
            <span className="text-emerald-600">
              Bonus Depreciation: {(schedule.bonusRate * 100).toFixed(0)}%
            </span>
          </>
        )}
      </div>
      
      {/* Schedule Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-50">
                  Year
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  5-Year
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  7-Year
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  15-Year
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Real Property
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cumulative
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tax Savings
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                  Visual
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayYears.map((year) => {
                const isSelected = selectedYear === year.year;
                const barWidth = maxDepreciation > 0 
                  ? (year.totalDepreciation / maxDepreciation) * 100 
                  : 0;
                
                return (
                  <tr 
                    key={year.year}
                    onClick={() => setSelectedYear(isSelected ? null : year.year)}
                    className={`cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-[#0da1c7]/10' 
                        : 'hover:bg-gray-50'
                    } ${year.year === 1 ? 'bg-emerald-50/50' : ''}`}
                  >
                    <td className="px-4 py-3 sticky left-0 bg-inherit">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          Year {year.year}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({year.calendarYear})
                        </span>
                        {year.year === 1 && (
                          <span className="px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded">
                            + Bonus
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {year.byClass.fiveYear > 0 ? (
                        <span className="text-emerald-600 font-medium">
                          {formatCurrency(year.byClass.fiveYear)}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {year.byClass.sevenYear > 0 ? (
                        <span className="text-teal-600 font-medium">
                          {formatCurrency(year.byClass.sevenYear)}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {year.byClass.fifteenYear > 0 ? (
                        <span className="text-amber-600 font-medium">
                          {formatCurrency(year.byClass.fifteenYear)}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {year.byClass.realProperty > 0 ? (
                        <span className="text-slate-600">
                          {formatCurrency(year.byClass.realProperty)}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(year.totalDepreciation)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {formatCurrency(year.cumulativeDepreciation, true)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium text-emerald-600">
                        {formatCurrency(year.taxSavings)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-300"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            
            {/* Summary Row */}
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td className="px-4 py-3 font-semibold text-gray-900 sticky left-0 bg-gray-50">
                  Total (All Years)
                </td>
                <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                  {formatCurrency(schedule.years.reduce((sum, y) => sum + y.byClass.fiveYear, 0))}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-teal-600">
                  {formatCurrency(schedule.years.reduce((sum, y) => sum + y.byClass.sevenYear, 0))}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-amber-600">
                  {formatCurrency(schedule.years.reduce((sum, y) => sum + y.byClass.fifteenYear, 0))}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-600">
                  {formatCurrency(schedule.years.reduce((sum, y) => sum + y.byClass.realProperty, 0))}
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">
                  {formatCurrency(schedule.years.reduce((sum, y) => sum + y.totalDepreciation, 0))}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-600">
                  -
                </td>
                <td className="px-4 py-3 text-right font-bold text-emerald-600">
                  {formatCurrency(schedule.years.reduce((sum, y) => sum + y.taxSavings, 0))}
                </td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {/* Expand/Collapse Button */}
        {hasMoreYears && (
          <div className="border-t border-gray-200 p-2 text-center">
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp size={16} />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Show All Years ({schedule.years.filter(y => y.totalDepreciation > 0).length} total)
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* Year Detail Panel */}
      {selectedYearData && (
        <div className="bg-[#0da1c7]/5 border border-[#0da1c7]/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">
              Year {selectedYearData.year} Detail ({selectedYearData.calendarYear})
            </h4>
            <button
              onClick={() => setSelectedYear(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Total Depreciation</div>
              <div className="font-semibold text-gray-900">
                {formatCurrency(selectedYearData.totalDepreciation)}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Cumulative</div>
              <div className="font-semibold text-gray-900">
                {formatCurrency(selectedYearData.cumulativeDepreciation)}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Remaining Basis</div>
              <div className="font-semibold text-gray-900">
                {formatCurrency(selectedYearData.remainingBasis)}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Tax Savings (YTD)</div>
              <div className="font-semibold text-emerald-600">
                {formatCurrency(selectedYearData.cumulativeTaxSavings)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepreciationSchedule;

