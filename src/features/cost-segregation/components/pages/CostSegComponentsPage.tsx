/**
 * CostSegComponentsPage Component
 * 
 * Detailed component list with classifications for the Cost Seg report.
 */

import React from 'react';
import type { CostSegAnalysis, CostSegComponent } from '../../types';
import { DEPRECIATION_CLASSES } from '../../constants';

interface CostSegComponentsPageProps {
  analysis: CostSegAnalysis;
  pageNumber?: number;
  totalPages?: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Color palette for depreciation classes
const CLASS_COLORS: Record<string, string> = {
  '5-year': 'bg-emerald-100 text-emerald-700',
  '7-year': 'bg-teal-100 text-teal-700',
  '15-year': 'bg-amber-100 text-amber-700',
  '27.5-year': 'bg-slate-100 text-slate-700',
  '39-year': 'bg-slate-200 text-slate-700',
};

export function CostSegComponentsPage({ analysis, pageNumber = 1, totalPages = 1 }: CostSegComponentsPageProps) {
  const { components } = analysis;
  
  // Group components by building
  const componentsByBuilding = components.reduce((acc, comp) => {
    const key = comp.buildingName || 'Site Improvements';
    if (!acc[key]) acc[key] = [];
    acc[key].push(comp);
    return acc;
  }, {} as Record<string, CostSegComponent[]>);

  return (
    <div className="min-h-[11in] bg-white p-12" data-page="components">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Component Detail</h1>
          <p className="text-sm text-gray-500 mt-1">
            {components.length} Components Classified
            {totalPages > 1 && ` • Page ${pageNumber} of ${totalPages}`}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          {analysis.propertyAddress}
        </div>
      </div>

      {/* Components by Building */}
      {Object.entries(componentsByBuilding).map(([buildingName, buildingComponents]) => (
        <div key={buildingName} className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#0da1c7] rounded-full" />
            {buildingName}
          </h2>
          
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">
                  Component
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">
                  Category
                </th>
                <th className="px-3 py-2 text-center font-semibold text-gray-700 border-b border-gray-200">
                  Class
                </th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700 border-b border-gray-200">
                  Allocated Cost
                </th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700 border-b border-gray-200">
                  % of Basis
                </th>
              </tr>
            </thead>
            <tbody>
              {buildingComponents.map((comp) => {
                const effectiveClass = comp.depreciationClassOverride || comp.depreciationClass;
                const colors = CLASS_COLORS[effectiveClass] || CLASS_COLORS['39-year'];
                
                return (
                  <tr key={comp.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900">{comp.label}</div>
                      {comp.description && (
                        <div className="text-xs text-gray-500">{comp.description}</div>
                      )}
                      {comp.overrideJustification && (
                        <div className="text-xs text-amber-600 italic mt-0.5">
                          Override: {comp.overrideJustification}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {comp.category === 'personal-property' && 'Personal Property'}
                      {comp.category === 'land-improvement' && 'Land Improvement'}
                      {comp.category === 'real-property' && 'Real Property'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${colors}`}>
                        {effectiveClass}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900">
                      {formatCurrency(comp.cost)}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-600">
                      {comp.percentOfTotal.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
              {/* Building Subtotal */}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-3 py-2 text-gray-900" colSpan={3}>
                  {buildingName} Subtotal
                </td>
                <td className="px-3 py-2 text-right text-gray-900">
                  {formatCurrency(buildingComponents.reduce((sum, c) => sum + c.cost, 0))}
                </td>
                <td className="px-3 py-2 text-right text-gray-900">
                  {buildingComponents.reduce((sum, c) => sum + c.percentOfTotal, 0).toFixed(2)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}

      {/* Grand Total */}
      <div className="mt-8 pt-4 border-t-2 border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total Depreciable Basis</span>
          <span className="text-xl font-bold text-gray-900">
            {formatCurrency(analysis.depreciableBasis)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Classification Legend</h3>
        <div className="flex flex-wrap gap-3">
          {DEPRECIATION_CLASSES.map(cls => {
            const colors = CLASS_COLORS[cls.id] || CLASS_COLORS['39-year'];
            return (
              <div key={cls.id} className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors}`}>
                  {cls.id}
                </span>
                <span className="text-xs text-gray-500">{cls.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CostSegComponentsPage;

