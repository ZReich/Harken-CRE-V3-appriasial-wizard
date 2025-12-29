/**
 * CostSegOverview Component
 * 
 * Summary dashboard showing depreciation class breakdown and tax benefit projections.
 */

import React from 'react';
import { PieChart, DollarSign, TrendingUp, Calculator, Info } from 'lucide-react';
import type { CostSegAnalysis, ClassSummary } from '../types';
import { DEPRECIATION_CLASSES } from '../constants';

interface CostSegOverviewProps {
  analysis: CostSegAnalysis;
  onEditTaxRate?: () => void;
}

// Color palette for depreciation classes
const CLASS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '5-year': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-400' },
  '7-year': { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-400' },
  '15-year': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-400' },
  '27.5-year': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-400' },
  '39-year': { bg: 'bg-slate-200', text: 'text-slate-800', border: 'border-slate-500' },
};

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

// Simple pie chart using CSS conic-gradient
function SimplePieChart({ data }: { data: ClassSummary[] }) {
  const total = data.reduce((sum, d) => sum + d.totalValue, 0);
  if (total === 0) return null;
  
  // Build gradient stops
  let currentPercent = 0;
  const colors = [
    '#10b981', // emerald-500 for 5-year
    '#14b8a6', // teal-500 for 7-year
    '#f59e0b', // amber-500 for 15-year
    '#64748b', // slate-500 for 27.5/39-year
    '#475569', // slate-600 for additional
  ];
  
  const gradientStops = data.map((d, i) => {
    const percent = (d.totalValue / total) * 100;
    const start = currentPercent;
    currentPercent += percent;
    return `${colors[i % colors.length]} ${start}% ${currentPercent}%`;
  }).join(', ');
  
  return (
    <div 
      className="w-32 h-32 rounded-full mx-auto"
      style={{
        background: `conic-gradient(${gradientStops})`,
      }}
    />
  );
}

export function CostSegOverview({ analysis, onEditTaxRate }: CostSegOverviewProps) {
  const { summaryByClass, taxBenefitProjection, depreciableBasis, landValue, totalProjectCost } = analysis;
  
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
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <DollarSign size={16} />
            Total Project Cost
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalProjectCost)}
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Calculator size={16} />
            Depreciable Basis
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(depreciableBasis)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Excludes land: {formatCurrency(landValue)}
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <TrendingUp size={16} />
            Accelerated Property
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {formatCurrency(acceleratedTotal)}
          </div>
          <div className="text-xs text-emerald-500 mt-1">
            {formatPercent(acceleratedPercent)} of basis
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-emerald-100 mb-1">
            <DollarSign size={16} />
            Year 1 Tax Savings
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(taxBenefitProjection.year1TaxSavings)}
          </div>
          <div className="text-xs text-emerald-100 mt-1">
            @ {formatPercent(taxBenefitProjection.taxRate * 100)} tax rate
            {onEditTaxRate && (
              <button 
                onClick={onEditTaxRate}
                className="ml-2 underline hover:no-underline"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Depreciation Class Breakdown */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart size={20} className="text-[#0da1c7]" />
            Depreciation Class Breakdown
          </h3>
          
          <div className="flex gap-8">
            {/* Pie Chart */}
            <div className="flex-shrink-0">
              <SimplePieChart data={sortedClasses} />
            </div>
            
            {/* Class List */}
            <div className="flex-1 space-y-2">
              {sortedClasses.map((cls) => {
                const colors = CLASS_COLORS[cls.class] || CLASS_COLORS['39-year'];
                const classConfig = DEPRECIATION_CLASSES.find(c => c.id === cls.class);
                
                return (
                  <div 
                    key={cls.class}
                    className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${colors.bg} ${colors.border}`}
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className={`font-medium ${colors.text}`}>
                          {classConfig?.label || cls.class}
                        </div>
                        <div className="text-xs text-gray-500">
                          {cls.componentCount} components
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${colors.text}`}>
                        {formatCurrency(cls.totalValue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatPercent(cls.percentOfBasis)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tax Benefit Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-500" />
            Tax Benefit Summary
          </h3>
          
          <div className="space-y-4">
            {/* Year 1 Comparison */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-2">Year 1 Depreciation</div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Without Cost Seg:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(taxBenefitProjection.year1WithoutCostSeg)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">With Cost Seg:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(taxBenefitProjection.year1WithCostSeg)}
                  </span>
                </div>
                
                {analysis.bonusDepreciationRate > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      + Bonus ({formatPercent(analysis.bonusDepreciationRate * 100)}):
                    </span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(taxBenefitProjection.year1WithBonus)}
                    </span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Additional Deductions:</span>
                    <span className="font-bold text-emerald-600">
                      {formatCurrency(taxBenefitProjection.additionalYear1Deductions)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Cumulative Benefits */}
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                <span className="text-sm text-emerald-700">5-Year Cumulative Benefit:</span>
                <span className="font-semibold text-emerald-700">
                  {formatCurrency(taxBenefitProjection.cumulativeBenefit5Year)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                <span className="text-sm text-teal-700">10-Year Cumulative Benefit:</span>
                <span className="font-semibold text-teal-700">
                  {formatCurrency(taxBenefitProjection.cumulativeBenefit10Year)}
                </span>
              </div>
            </div>
            
            {/* Info Note */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <span>
                Tax savings calculated at {formatPercent(taxBenefitProjection.taxRate * 100)} marginal rate. 
                Actual savings depend on your specific tax situation.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bonus Depreciation Note */}
      {analysis.bonusDepreciationRate > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <TrendingUp className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <div className="font-medium text-amber-800">
              Bonus Depreciation Applied: {formatPercent(analysis.bonusDepreciationRate * 100)}
            </div>
            <div className="text-sm text-amber-700 mt-1">
              Eligible 5-year, 7-year, and 15-year property qualifies for first-year bonus depreciation 
              under current tax law. The bonus rate phases down each year through 2026.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CostSegOverview;

