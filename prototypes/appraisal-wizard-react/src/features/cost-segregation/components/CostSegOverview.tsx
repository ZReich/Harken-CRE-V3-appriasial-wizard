/**
 * CostSegOverview Component
 * 
 * Displays the executive summary of a cost segregation analysis,
 * showing the breakdown by depreciation class (5-year, 15-year, 39-year).
 */

import React from 'react';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Calculator,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { formatCostSegCurrency, formatCostSegPercent } from '../../../services/costSegregationService';
import type { CostSegAnalysis } from '../../../types';

interface CostSegOverviewProps {
  analysis: CostSegAnalysis | null;
  isLoading?: boolean;
  error?: string | null;
  onGenerate?: () => void;
  onViewDetails?: () => void;
  onViewSchedule?: () => void;
  onViewFullReport?: () => void;
  className?: string;
}

export const CostSegOverview: React.FC<CostSegOverviewProps> = ({
  analysis,
  isLoading = false,
  error,
  onGenerate,
  onViewDetails,
  onViewSchedule,
  onViewFullReport,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className={`bg-surface-1 rounded-xl border border-light-border shadow-sm p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-12 h-12 border-3 border-light-border border-t-[#0da1c7] rounded-full animate-spin mb-4" />
          <p className="text-harken-gray font-medium">Generating Cost Segregation Analysis...</p>
          <p className="text-sm text-harken-gray-med mt-1">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-surface-1 rounded-xl border border-harken-error/20 shadow-sm p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-accent-red-light rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-harken-error" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Analysis Error</h3>
          <p className="text-sm text-harken-gray text-center max-w-md mb-4">{error}</p>
          {onGenerate && (
            <button
              onClick={onGenerate}
              className="flex items-center gap-2 px-4 py-2 bg-[#0da1c7] text-white rounded-lg hover:bg-[#0b8eb1] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Analysis
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={`bg-surface-1 rounded-xl border border-light-border shadow-sm p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0da1c7]/10 to-[#0da1c7]/5 rounded-2xl flex items-center justify-center mb-6">
            <Calculator className="w-10 h-10 text-[#0da1c7]" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Cost Segregation Analysis</h3>
          <p className="text-sm text-harken-gray text-center max-w-lg mb-6">
            Generate an IRS-compliant cost segregation study to accelerate depreciation 
            and maximize tax benefits for this property.
          </p>
          {onGenerate && (
            <button
              onClick={onGenerate}
              className="flex items-center gap-2 px-6 py-3 bg-[#0da1c7] text-white rounded-xl hover:bg-[#0b8eb1] transition-colors font-medium shadow-sm"
            >
              <TrendingUp className="w-5 h-5" />
              Generate Analysis
            </button>
          )}
        </div>
      </div>
    );
  }

  // Calculate combined accelerated (5 + 15 year)
  const acceleratedTotal = analysis.summary.fiveYear.total + analysis.summary.fifteenYear.total;
  const acceleratedPercent = analysis.summary.fiveYear.percent + analysis.summary.fifteenYear.percent;

  return (
    <div className={`bg-surface-1 rounded-xl border border-light-border shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-light-border bg-gradient-to-r from-harken-gray-light to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0da1c7]/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#0da1c7]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Cost Segregation Analysis</h3>
              <p className="text-sm text-harken-gray-med">
                {analysis.propertyName} • {analysis.analysisDate.split('T')[0]}
              </p>
            </div>
          </div>
          {analysis.hasManualOverrides && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-amber-gold-light text-accent-amber-gold text-xs font-medium rounded-full border border-accent-amber-gold">
              <AlertCircle className="w-3.5 h-3.5" />
              {analysis.overrideCount} Override{analysis.overrideCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 5-Year Personal Property */}
          <div className="bg-gradient-to-br from-accent-teal-mint-light to-accent-teal-mint/50 rounded-xl p-5 border border-accent-teal-mint">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-accent-teal-mint rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-accent-teal-mint">5-Year Property</span>
            </div>
            <div className="text-2xl font-bold text-accent-teal-mint mb-1">
              {formatCostSegCurrency(analysis.summary.fiveYear.total)}
            </div>
            <div className="text-sm text-accent-teal-mint">
              {formatCostSegPercent(analysis.summary.fiveYear.percent)} of improvements
            </div>
          </div>

          {/* 15-Year Land Improvements */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-blue-800">15-Year Improvements</span>
            </div>
            <div className="text-2xl font-bold text-blue-900 mb-1">
              {formatCostSegCurrency(analysis.summary.fifteenYear.total)}
            </div>
            <div className="text-sm text-blue-700">
              {formatCostSegPercent(analysis.summary.fifteenYear.percent)} of improvements
            </div>
          </div>

          {/* 39-Year Real Property */}
          <div className="bg-gradient-to-br from-harken-gray-light to-harken-gray-light/50 rounded-xl p-5 border border-light-border">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-harken-gray-med rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-harken-gray">39-Year Property</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {formatCostSegCurrency(analysis.summary.thirtyNineYear.total)}
            </div>
            <div className="text-sm text-harken-gray">
              {formatCostSegPercent(analysis.summary.thirtyNineYear.percent)} of improvements
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-harken-gray-light rounded-xl p-5 mb-6">
          <h4 className="text-sm font-semibold text-harken-gray mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Tax Benefit Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-harken-gray-med uppercase tracking-wide mb-1">Total Project Cost</div>
              <div className="text-lg font-bold text-slate-900">
                {formatCostSegCurrency(analysis.totalProjectCost)}
              </div>
            </div>
            <div>
              <div className="text-xs text-harken-gray-med uppercase tracking-wide mb-1">Accelerated Recovery</div>
              <div className="text-lg font-bold text-accent-teal-mint">
                {formatCostSegCurrency(acceleratedTotal)}
              </div>
              <div className="text-xs text-accent-teal-mint">
                {formatCostSegPercent(acceleratedPercent)} eligible
              </div>
            </div>
            <div>
              <div className="text-xs text-harken-gray-med uppercase tracking-wide mb-1">Year 1 Depreciation</div>
              <div className="text-lg font-bold text-slate-900">
                {formatCostSegCurrency(analysis.firstYearDepreciation)}
              </div>
            </div>
            <div>
              <div className="text-xs text-harken-gray-med uppercase tracking-wide mb-1">Accelerated Benefit</div>
              <div className="text-lg font-bold text-[#0da1c7]">
                +{formatCostSegCurrency(analysis.acceleratedBenefit)}
              </div>
              <div className="text-xs text-harken-gray-med">vs. straight-line</div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown Table */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-harken-gray mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Cost Breakdown
          </h4>
          <div className="border border-light-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harken-gray-light border-b border-light-border">
                  <th className="text-left px-4 py-2 font-semibold text-harken-gray">Category</th>
                  <th className="text-right px-4 py-2 font-semibold text-harken-gray">Amount</th>
                  <th className="text-right px-4 py-2 font-semibold text-harken-gray">%</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-light-border">
                  <td className="px-4 py-3 text-harken-gray">Land Value (Non-Depreciable)</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {formatCostSegCurrency(analysis.landValue)}
                  </td>
                  <td className="px-4 py-3 text-right text-harken-gray-med">-</td>
                </tr>
                <tr className="border-b border-light-border bg-accent-teal-mint-light/50">
                  <td className="px-4 py-3 text-accent-teal-mint flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-teal-mint" />
                    5-Year Personal Property
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-accent-teal-mint">
                    {formatCostSegCurrency(analysis.summary.fiveYear.total)}
                  </td>
                  <td className="px-4 py-3 text-right text-accent-teal-mint">
                    {formatCostSegPercent(analysis.summary.fiveYear.percent)}
                  </td>
                </tr>
                <tr className="border-b border-light-border dark:border-dark-border bg-blue-50/50">
                  <td className="px-4 py-3 text-blue-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    15-Year Land Improvements
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-blue-800">
                    {formatCostSegCurrency(analysis.summary.fifteenYear.total)}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-600">
                    {formatCostSegPercent(analysis.summary.fifteenYear.percent)}
                  </td>
                </tr>
                <tr className="border-b border-light-border">
                  <td className="px-4 py-3 text-harken-gray flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-harken-gray-med" />
                    39-Year Real Property
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {formatCostSegCurrency(analysis.summary.thirtyNineYear.total)}
                  </td>
                  <td className="px-4 py-3 text-right text-harken-gray-med">
                    {formatCostSegPercent(analysis.summary.thirtyNineYear.percent)}
                  </td>
                </tr>
                <tr className="bg-harken-gray-light font-semibold">
                  <td className="px-4 py-3 text-slate-900">Total Improvements</td>
                  <td className="px-4 py-3 text-right text-slate-900">
                    {formatCostSegCurrency(analysis.totalImprovementCost)}
                  </td>
                  <td className="px-4 py-3 text-right text-harken-gray">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {onViewFullReport && (
            <button
              onClick={onViewFullReport}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent-teal-mint text-white rounded-lg hover:bg-accent-teal-mint transition-colors font-medium text-sm shadow-sm"
            >
              <FileText className="w-4 h-4" />
              View Full Report
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex items-center gap-2 px-4 py-2.5 bg-harken-gray-light text-harken-gray rounded-lg hover:bg-harken-gray-light transition-colors font-medium text-sm"
            >
              View Component Details
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {onViewSchedule && (
            <button
              onClick={onViewSchedule}
              className="flex items-center gap-2 px-4 py-2.5 bg-harken-gray-light text-harken-gray rounded-lg hover:bg-harken-gray-light transition-colors font-medium text-sm"
            >
              Depreciation Schedule
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {onGenerate && (
            <button
              onClick={onGenerate}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0da1c7] text-white rounded-lg hover:bg-[#0b8eb1] transition-colors font-medium text-sm ml-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
          )}
        </div>
      </div>

      {/* Methodology Footer */}
      <div className="px-6 py-4 bg-harken-gray-light border-t border-light-border">
        <div className="flex items-start gap-3 text-xs text-harken-gray-med">
          <FileText className="w-4 h-4 text-harken-gray-med mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-medium text-harken-gray">Methodology: </span>
            {analysis.methodologyDescription}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostSegOverview;

