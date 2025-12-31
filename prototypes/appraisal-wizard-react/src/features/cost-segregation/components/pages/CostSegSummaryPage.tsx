/**
 * CostSegSummaryPage Component
 * 
 * Executive summary page for the Cost Segregation report.
 */

import React from 'react';
import { formatCostSegCurrency, formatCostSegPercent } from '../../../../services/costSegregationService';
import type { CostSegAnalysis } from '../../../../types';

interface CostSegSummaryPageProps {
  analysis: CostSegAnalysis;
  className?: string;
}

export const CostSegSummaryPage: React.FC<CostSegSummaryPageProps> = ({
  analysis,
  className = '',
}) => {
  const acceleratedTotal = analysis.summary.fiveYear.total + analysis.summary.fifteenYear.total;
  const acceleratedPercent = analysis.summary.fiveYear.percent + analysis.summary.fifteenYear.percent;

  return (
    <div className={`bg-white p-12 ${className}`}>
      <h2 className="text-2xl font-bold text-[#1c3643] mb-6 pb-4 border-b-2 border-[#0da1c7]">
        Executive Summary
      </h2>

      {/* Introduction */}
      <div className="prose prose-slate max-w-none mb-8">
        <p>
          This cost segregation study was conducted for <strong>{analysis.propertyName}</strong> located at{' '}
          <strong>{analysis.propertyAddress}</strong>. The purpose of this study is to identify and reclassify 
          building components that qualify for accelerated depreciation under IRS guidelines.
        </p>
      </div>

      {/* Key Findings */}
      <div className="bg-slate-50 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#1c3643] mb-4">Key Findings</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-slate-500 mb-1">Total Project Cost</div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCostSegCurrency(analysis.totalProjectCost)}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">Depreciable Basis</div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCostSegCurrency(analysis.totalImprovementCost)}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">Accelerated Recovery (5 & 15 Year)</div>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCostSegCurrency(acceleratedTotal)}
            </div>
            <div className="text-sm text-emerald-600">
              {formatCostSegPercent(acceleratedPercent)} of improvements
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">First Year Depreciation</div>
            <div className="text-2xl font-bold text-[#0da1c7]">
              {formatCostSegCurrency(analysis.firstYearDepreciation)}
            </div>
          </div>
        </div>
      </div>

      {/* Cost Allocation Summary */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-[#1c3643] mb-4">Cost Allocation Summary</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-300">
              <th className="text-left py-3 font-semibold text-slate-700">Depreciation Class</th>
              <th className="text-right py-3 font-semibold text-slate-700">Amount</th>
              <th className="text-right py-3 font-semibold text-slate-700">Percentage</th>
              <th className="text-center py-3 font-semibold text-slate-700">Recovery Method</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="py-3 text-slate-600">Land (Non-Depreciable)</td>
              <td className="py-3 text-right font-medium text-slate-900">
                {formatCostSegCurrency(analysis.landValue)}
              </td>
              <td className="py-3 text-right text-slate-500">—</td>
              <td className="py-3 text-center text-slate-500">N/A</td>
            </tr>
            <tr className="border-b border-slate-200 bg-emerald-50/50">
              <td className="py-3 text-emerald-800 font-medium">5-Year Personal Property</td>
              <td className="py-3 text-right font-medium text-emerald-800">
                {formatCostSegCurrency(analysis.summary.fiveYear.total)}
              </td>
              <td className="py-3 text-right text-emerald-600">
                {formatCostSegPercent(analysis.summary.fiveYear.percent)}
              </td>
              <td className="py-3 text-center text-emerald-700">200% DB / HY</td>
            </tr>
            {analysis.summary.sevenYear.total > 0 && (
              <tr className="border-b border-slate-200 bg-green-50/50">
                <td className="py-3 text-green-800 font-medium">7-Year Personal Property</td>
                <td className="py-3 text-right font-medium text-green-800">
                  {formatCostSegCurrency(analysis.summary.sevenYear.total)}
                </td>
                <td className="py-3 text-right text-green-600">
                  {formatCostSegPercent(analysis.summary.sevenYear.percent)}
                </td>
                <td className="py-3 text-center text-green-700">200% DB / HY</td>
              </tr>
            )}
            <tr className="border-b border-slate-200 bg-blue-50/50">
              <td className="py-3 text-blue-800 font-medium">15-Year Land Improvements</td>
              <td className="py-3 text-right font-medium text-blue-800">
                {formatCostSegCurrency(analysis.summary.fifteenYear.total)}
              </td>
              <td className="py-3 text-right text-blue-600">
                {formatCostSegPercent(analysis.summary.fifteenYear.percent)}
              </td>
              <td className="py-3 text-center text-blue-700">150% DB / HY</td>
            </tr>
            {analysis.isResidential ? (
              <tr className="border-b border-slate-200">
                <td className="py-3 text-slate-600">27.5-Year Residential Real Property</td>
                <td className="py-3 text-right font-medium text-slate-900">
                  {formatCostSegCurrency(analysis.summary.twentySevenFiveYear.total)}
                </td>
                <td className="py-3 text-right text-slate-500">
                  {formatCostSegPercent(analysis.summary.twentySevenFiveYear.percent)}
                </td>
                <td className="py-3 text-center text-slate-500">SL / MM</td>
              </tr>
            ) : (
              <tr className="border-b border-slate-200">
                <td className="py-3 text-slate-600">39-Year Nonresidential Real Property</td>
                <td className="py-3 text-right font-medium text-slate-900">
                  {formatCostSegCurrency(analysis.summary.thirtyNineYear.total)}
                </td>
                <td className="py-3 text-right text-slate-500">
                  {formatCostSegPercent(analysis.summary.thirtyNineYear.percent)}
                </td>
                <td className="py-3 text-center text-slate-500">SL / MM</td>
              </tr>
            )}
            <tr className="bg-slate-100 font-semibold">
              <td className="py-3 text-slate-900">Total Improvements</td>
              <td className="py-3 text-right text-slate-900">
                {formatCostSegCurrency(analysis.totalImprovementCost)}
              </td>
              <td className="py-3 text-right text-slate-700">100%</td>
              <td className="py-3 text-center text-slate-500">—</td>
            </tr>
          </tbody>
        </table>
        <div className="text-xs text-slate-500 mt-2">
          DB = Declining Balance, SL = Straight-Line, HY = Half-Year Convention, MM = Mid-Month Convention
        </div>
      </div>

      {/* Tax Benefit Highlight */}
      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
        <h3 className="text-lg font-semibold text-emerald-800 mb-2">Tax Benefit Highlight</h3>
        <p className="text-sm text-emerald-700 mb-4">
          By reclassifying {formatCostSegPercent(acceleratedPercent)} of the depreciable basis to 
          shorter-lived property classes, the property owner can accelerate depreciation deductions 
          significantly compared to straight-line depreciation over {analysis.isResidential ? '27.5' : '39'} years.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-emerald-200">
            <div className="text-xs text-emerald-600 uppercase tracking-wide mb-1">
              Accelerated Benefit (Year 1)
            </div>
            <div className="text-xl font-bold text-emerald-700">
              +{formatCostSegCurrency(analysis.acceleratedBenefit)}
            </div>
            <div className="text-xs text-emerald-600">vs. straight-line depreciation</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-emerald-200">
            <div className="text-xs text-emerald-600 uppercase tracking-wide mb-1">
              Bonus Depreciation Eligible
            </div>
            <div className="text-xl font-bold text-emerald-700">
              {formatCostSegCurrency(acceleratedTotal)}
            </div>
            <div className="text-xs text-emerald-600">5, 7, and 15-year property</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostSegSummaryPage;
