/**
 * CostSegComponentsPage Component
 * 
 * Detailed component list for the Cost Segregation report.
 */

import React from 'react';
import { formatCostSegCurrency, formatCostSegPercent } from '../../../../services/costSegregationService';
import type { CostSegAnalysis, CostSegComponent } from '../../../../types';
import type { DepreciationClass } from '../../../../constants/costSegregation';

interface CostSegComponentsPageProps {
  analysis: CostSegAnalysis;
  className?: string;
}

// Group components by depreciation class
function groupByClass(components: CostSegComponent[]): Record<DepreciationClass, CostSegComponent[]> {
  const groups: Record<DepreciationClass, CostSegComponent[]> = {
    '5-year': [],
    '7-year': [],
    '15-year': [],
    '27.5-year': [],
    '39-year': [],
  };

  components.forEach(c => {
    const effectiveClass = c.depreciationClassOverride || c.depreciationClass;
    groups[effectiveClass].push(c);
  });

  return groups;
}

const CLASS_STYLES: Record<DepreciationClass, { bg: string; text: string; border: string }> = {
  '5-year': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  '7-year': { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
  '15-year': { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  '27.5-year': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  '39-year': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

const CLASS_LABELS: Record<DepreciationClass, string> = {
  '5-year': '5-Year Personal Property',
  '7-year': '7-Year Personal Property',
  '15-year': '15-Year Land Improvements',
  '27.5-year': '27.5-Year Residential Real Property',
  '39-year': '39-Year Nonresidential Real Property',
};

export const CostSegComponentsPage: React.FC<CostSegComponentsPageProps> = ({
  analysis,
  className = '',
}) => {
  const grouped = groupByClass(analysis.components);
  const orderedClasses: DepreciationClass[] = ['5-year', '7-year', '15-year', '27.5-year', '39-year'];

  return (
    <div className={`bg-white p-12 ${className}`}>
      <h2 className="text-2xl font-bold text-[#1c3643] mb-6 pb-4 border-b-2 border-[#0da1c7]">
        Component Detail Listing
      </h2>

      <p className="text-sm text-slate-600 mb-6">
        The following tables detail all building and site components analyzed in this study, 
        organized by IRS depreciation class. Each component's allocated cost and percentage 
        of total improvements are shown.
      </p>

      {orderedClasses.map(depClass => {
        const components = grouped[depClass];
        if (components.length === 0) return null;

        const styles = CLASS_STYLES[depClass];
        const classTotal = components.reduce((sum, c) => sum + c.cost, 0);
        const classPercent = analysis.totalImprovementCost > 0 
          ? classTotal / analysis.totalImprovementCost 
          : 0;

        return (
          <div key={depClass} className="mb-8">
            {/* Class Header */}
            <div className={`${styles.bg} ${styles.border} border rounded-t-lg px-4 py-3`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${styles.text}`}>
                  {CLASS_LABELS[depClass]}
                </h3>
                <div className={`text-sm ${styles.text}`}>
                  <span className="font-semibold">{formatCostSegCurrency(classTotal)}</span>
                  <span className="mx-2">•</span>
                  <span>{formatCostSegPercent(classPercent)}</span>
                </div>
              </div>
            </div>

            {/* Components Table */}
            <table className={`w-full text-sm border-collapse border-x ${styles.border}`}>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-2 px-4 font-medium text-slate-600">Component</th>
                  <th className="text-left py-2 px-4 font-medium text-slate-600">Category</th>
                  <th className="text-right py-2 px-4 font-medium text-slate-600">Cost</th>
                  <th className="text-right py-2 px-4 font-medium text-slate-600">% of Total</th>
                  {analysis.hasManualOverrides && (
                    <th className="text-center py-2 px-4 font-medium text-slate-600 w-16">Override</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {components.map((component, idx) => {
                  const isOverridden = !!component.depreciationClassOverride;
                  return (
                    <tr key={component.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : ''}>
                      <td className="py-2 px-4 text-slate-900">{component.label}</td>
                      <td className="py-2 px-4 text-slate-600 capitalize">
                        {component.category.replace(/-/g, ' ')}
                      </td>
                      <td className="py-2 px-4 text-right font-medium text-slate-900">
                        {formatCostSegCurrency(component.cost)}
                      </td>
                      <td className="py-2 px-4 text-right text-slate-600">
                        {formatCostSegPercent(component.percentOfTotal)}
                      </td>
                      {analysis.hasManualOverrides && (
                        <td className="py-2 px-4 text-center">
                          {isOverridden && (
                            <span className="inline-flex w-5 h-5 bg-amber-100 text-amber-700 rounded-full items-center justify-center text-xs font-medium">
                              *
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className={`${styles.bg} ${styles.border} border-t font-semibold`}>
                  <td colSpan={2} className={`py-2 px-4 ${styles.text}`}>
                    Subtotal - {CLASS_LABELS[depClass]}
                  </td>
                  <td className={`py-2 px-4 text-right ${styles.text}`}>
                    {formatCostSegCurrency(classTotal)}
                  </td>
                  <td className={`py-2 px-4 text-right ${styles.text}`}>
                    {formatCostSegPercent(classPercent)}
                  </td>
                  {analysis.hasManualOverrides && <td />}
                </tr>
              </tfoot>
            </table>
          </div>
        );
      })}

      {/* Overrides Note */}
      {analysis.hasManualOverrides && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
          <div className="flex items-start gap-2">
            <span className="text-amber-500 font-bold">*</span>
            <div className="text-sm text-amber-700">
              <strong>Note:</strong> Components marked with an asterisk (*) have been manually 
              reclassified from their default depreciation class. A total of {analysis.overrideCount} 
              override{analysis.overrideCount !== 1 ? 's' : ''} {analysis.overrideCount !== 1 ? 'have' : 'has'} been 
              applied to this analysis. Manual overrides should be reviewed with a tax professional 
              to ensure IRS compliance.
            </div>
          </div>
        </div>
      )}

      {/* Grand Total */}
      <div className="mt-8 bg-slate-100 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-900">
            Grand Total - All Components ({analysis.components.length} items)
          </span>
          <span className="text-xl font-bold text-slate-900">
            {formatCostSegCurrency(analysis.totalImprovementCost)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CostSegComponentsPage;
