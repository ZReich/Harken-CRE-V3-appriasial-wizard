/**
 * CostSegSummaryPage Component
 * 
 * Executive summary page with class breakdown and tax benefit highlights.
 */

import React from 'react';
import type { CostSegAnalysis, ClassSummary } from '../../types';
import { DEPRECIATION_CLASSES } from '../../constants';

interface CostSegSummaryPageProps {
  analysis: CostSegAnalysis;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Color palette for depreciation classes
const CLASS_COLORS: Record<string, { bg: string; text: string; fill: string }> = {
  '5-year': { bg: 'bg-emerald-100', text: 'text-emerald-700', fill: '#10b981' },
  '7-year': { bg: 'bg-teal-100', text: 'text-teal-700', fill: '#14b8a6' },
  '15-year': { bg: 'bg-amber-100', text: 'text-amber-700', fill: '#f59e0b' },
  '27.5-year': { bg: 'bg-slate-100', text: 'text-slate-700', fill: '#64748b' },
  '39-year': { bg: 'bg-slate-200', text: 'text-slate-800', fill: '#475569' },
};

export function CostSegSummaryPage({ analysis }: CostSegSummaryPageProps) {
  const { summaryByClass, taxBenefitProjection, depreciableBasis } = analysis;
  
  // Sort classes by recovery period
  const sortedClasses = [...summaryByClass].sort((a, b) => {
    const order = ['5-year', '7-year', '15-year', '27.5-year', '39-year'];
    return order.indexOf(a.class) - order.indexOf(b.class);
  });
  
  // Calculate accelerated property totals
  const acceleratedTotal = sortedClasses
    .filter(c => ['5-year', '7-year', '15-year'].includes(c.class))
    .reduce((sum, c) => sum + c.totalValue, 0);
  
  const acceleratedPercent = depreciableBasis > 0 
    ? (acceleratedTotal / depreciableBasis) * 100 
    : 0;

  return (
    <div className="min-h-[11in] bg-white p-12" data-page="summary">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executive Summary</h1>
          <p className="text-sm text-gray-500 mt-1">Depreciation Class Allocation</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          {analysis.propertyAddress}
        </div>
      </div>

      {/* Key Findings */}
      <div className="bg-gradient-to-r from-[#0da1c7]/10 to-[#0da1c7]/5 border border-[#0da1c7]/20 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Findings</h2>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-500">Total Depreciable Basis</div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(depreciableBasis)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Accelerated Property</div>
            <div className="text-xl font-bold text-emerald-600">{formatCurrency(acceleratedTotal)}</div>
            <div className="text-xs text-emerald-500">{formatPercent(acceleratedPercent)} of basis</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Year 1 Tax Savings</div>
            <div className="text-xl font-bold text-[#0da1c7]">{formatCurrency(taxBenefitProjection.year1TaxSavings)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">5-Year Benefit</div>
            <div className="text-xl font-bold text-teal-600">{formatCurrency(taxBenefitProjection.cumulativeBenefit5Year)}</div>
          </div>
        </div>
      </div>

      {/* Class Breakdown Table */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Depreciation Class Allocation</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                Recovery Period
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                Category
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b border-gray-200">
                Allocated Value
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b border-gray-200">
                % of Basis
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b border-gray-200">
                Components
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b border-gray-200">
                Year 1 Depreciation
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedClasses.map((cls) => {
              const config = DEPRECIATION_CLASSES.find(c => c.id === cls.class);
              const colors = CLASS_COLORS[cls.class] || CLASS_COLORS['39-year'];
              
              return (
                <tr key={cls.class} className="border-b border-gray-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${colors.bg}`} />
                      <span className="font-medium text-gray-900">{config?.label || cls.class}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {config?.category === 'personal-property' && 'Personal Property'}
                    {config?.category === 'land-improvement' && 'Land Improvement'}
                    {config?.category === 'real-property' && 'Real Property'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatCurrency(cls.totalValue)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {formatPercent(cls.percentOfBasis)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {cls.componentCount}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-emerald-600">
                    {formatCurrency(cls.firstYearWithBonus)}
                  </td>
                </tr>
              );
            })}
            {/* Total Row */}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-4 py-3 text-gray-900" colSpan={2}>Total</td>
              <td className="px-4 py-3 text-right text-gray-900">
                {formatCurrency(depreciableBasis)}
              </td>
              <td className="px-4 py-3 text-right text-gray-900">100.0%</td>
              <td className="px-4 py-3 text-right text-gray-900">
                {sortedClasses.reduce((sum, c) => sum + c.componentCount, 0)}
              </td>
              <td className="px-4 py-3 text-right text-emerald-600">
                {formatCurrency(sortedClasses.reduce((sum, c) => sum + c.firstYearWithBonus, 0))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tax Benefit Comparison */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Year 1 Depreciation Comparison</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Without Cost Segregation:</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(taxBenefitProjection.year1WithoutCostSeg)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">With Cost Segregation:</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(taxBenefitProjection.year1WithCostSeg)}
              </span>
            </div>
            {analysis.bonusDepreciationRate > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">+ Bonus Depreciation ({formatPercent(analysis.bonusDepreciationRate * 100)}):</span>
                <span className="font-semibold text-emerald-600">
                  {formatCurrency(taxBenefitProjection.year1WithBonus)}
                </span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Additional Deductions:</span>
                <span className="font-bold text-emerald-600">
                  {formatCurrency(taxBenefitProjection.additionalYear1Deductions)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
          <h3 className="font-semibold text-emerald-900 mb-4">Tax Savings Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-emerald-700">Tax Rate Applied:</span>
              <span className="font-medium text-emerald-900">
                {formatPercent(taxBenefitProjection.taxRate * 100)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-700">Year 1 Tax Savings:</span>
              <span className="font-semibold text-emerald-900">
                {formatCurrency(taxBenefitProjection.year1TaxSavings)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-700">5-Year Cumulative:</span>
              <span className="font-semibold text-emerald-900">
                {formatCurrency(taxBenefitProjection.cumulativeBenefit5Year)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-700">10-Year Cumulative:</span>
              <span className="font-semibold text-emerald-900">
                {formatCurrency(taxBenefitProjection.cumulativeBenefit10Year)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CostSegSummaryPage;

