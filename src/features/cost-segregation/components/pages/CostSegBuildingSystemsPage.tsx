/**
 * CostSegBuildingSystemsPage Component
 * 
 * Building systems breakdown per IRS TD 9636 for the Cost Seg report.
 */

import React from 'react';
import type { CostSegAnalysis } from '../../types';
import { BUILDING_SYSTEMS } from '../../constants';

interface CostSegBuildingSystemsPageProps {
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

export function CostSegBuildingSystemsPage({ analysis }: CostSegBuildingSystemsPageProps) {
  const { buildingSystems } = analysis;
  
  // Sort by cost descending
  const sortedSystems = [...buildingSystems].sort((a, b) => b.depreciableCost - a.depreciableCost);
  
  // Calculate total building cost (excluding site improvements)
  const totalBuildingCost = buildingSystems.reduce((sum, s) => sum + s.depreciableCost, 0);

  return (
    <div className="min-h-[11in] bg-white p-12" data-page="building-systems">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Building Systems Analysis</h1>
          <p className="text-sm text-gray-500 mt-1">Per IRS Treasury Decision 9636</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          {analysis.propertyAddress}
        </div>
      </div>

      {/* Regulatory Context */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">IRS Building Systems (TD 9636)</h2>
        <p className="text-sm text-blue-800">
          Treasury Decision 9636 defines the unit of property for buildings as the building 
          structure and its structural components, with nine separate building systems. Each 
          system must be analyzed separately for capitalization and depreciation purposes.
        </p>
      </div>

      {/* Systems Table */}
      <table className="w-full border-collapse mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-300">
              Building System
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-300">
              IRS Reference
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700 border-b border-gray-300">
              Allocated Cost
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700 border-b border-gray-300">
              % of Building
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700 border-b border-gray-300">
              Components
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedSystems.map((system) => {
            const config = BUILDING_SYSTEMS.find(s => s.id === system.system);
            
            return (
              <tr key={system.system} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{system.label}</div>
                  <div className="text-xs text-gray-500">{config?.description}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {config?.irsReference || '-'}
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {formatCurrency(system.depreciableCost)}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {formatPercent(system.percentOfBuilding)}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {system.componentIds.length}
                </td>
              </tr>
            );
          })}
          {/* Total Row */}
          <tr className="bg-gray-100 font-semibold border-t-2 border-gray-300">
            <td className="px-4 py-3 text-gray-900" colSpan={2}>
              Total Building Systems
            </td>
            <td className="px-4 py-3 text-right text-gray-900">
              {formatCurrency(totalBuildingCost)}
            </td>
            <td className="px-4 py-3 text-right text-gray-900">100.0%</td>
            <td className="px-4 py-3 text-right text-gray-900">
              {sortedSystems.reduce((sum, s) => sum + s.componentIds.length, 0)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* System Descriptions */}
      <div className="grid grid-cols-2 gap-4">
        {BUILDING_SYSTEMS.slice(0, 8).map((system) => (
          <div key={system.id} className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-1">{system.label}</h3>
            <p className="text-xs text-gray-600">{system.description}</p>
            <p className="text-xs text-gray-400 mt-1">{system.irsReference}</p>
          </div>
        ))}
      </div>

      {/* Regulatory Note */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
        <p className="font-medium text-gray-700 mb-1">Regulatory Note:</p>
        <p>
          Under Treasury Regulation 1.263(a)-3(e)(2)(ii), a building and its structural components 
          are treated as a single unit of property. However, the nine building systems defined in 
          the regulations are analyzed separately for purposes of determining whether amounts paid 
          result in a betterment, restoration, or adaptation.
        </p>
      </div>
    </div>
  );
}

export default CostSegBuildingSystemsPage;

