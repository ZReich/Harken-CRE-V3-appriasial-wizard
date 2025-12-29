/**
 * BuildingSystems Component
 * 
 * Displays the 9 IRS-defined building systems per Treasury Decision 9636
 * for tangible property regulations compliance.
 */

import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Zap, 
  ArrowUpDown,
  Flame,
  Shield,
  Wind,
  Layers,
  MoreHorizontal,
  Info,
} from 'lucide-react';
import { formatCostSegCurrency, formatCostSegPercent } from '../../../services/costSegregationService';
import { BuildingSystem, BUILDING_SYSTEMS } from '../../../constants/costSegregation';
import type { BuildingSystemSummary, CostSegAnalysis } from '../../../types';

interface BuildingSystemsProps {
  analysis: CostSegAnalysis;
  className?: string;
}

const SYSTEM_ICONS: Record<BuildingSystem, React.ReactNode> = {
  'hvac': <Thermometer className="w-5 h-5" />,
  'plumbing': <Droplets className="w-5 h-5" />,
  'electrical': <Zap className="w-5 h-5" />,
  'escalators-elevators': <ArrowUpDown className="w-5 h-5" />,
  'fire-protection': <Flame className="w-5 h-5" />,
  'security': <Shield className="w-5 h-5" />,
  'gas-distribution': <Wind className="w-5 h-5" />,
  'structural': <Layers className="w-5 h-5" />,
  'other': <MoreHorizontal className="w-5 h-5" />,
};

const SYSTEM_COLORS: Record<BuildingSystem, string> = {
  'hvac': 'bg-orange-100 text-orange-600 border-orange-200',
  'plumbing': 'bg-blue-100 text-blue-600 border-blue-200',
  'electrical': 'bg-yellow-100 text-yellow-600 border-yellow-200',
  'escalators-elevators': 'bg-purple-100 text-purple-600 border-purple-200',
  'fire-protection': 'bg-red-100 text-red-600 border-red-200',
  'security': 'bg-slate-100 text-slate-600 border-slate-200',
  'gas-distribution': 'bg-cyan-100 text-cyan-600 border-cyan-200',
  'structural': 'bg-stone-100 text-stone-600 border-stone-200',
  'other': 'bg-gray-100 text-gray-600 border-gray-200',
};

export const BuildingSystems: React.FC<BuildingSystemsProps> = ({
  analysis,
  className = '',
}) => {
  // Sort systems by cost (highest first), filter out zero-cost systems
  const sortedSystems = [...analysis.buildingSystems]
    .filter(s => s.depreciableCost > 0)
    .sort((a, b) => b.depreciableCost - a.depreciableCost);

  const totalBuildingCost = analysis.totalBuildingCost;

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Building Systems Valuation</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Per IRS Tangible Property Regulations (TD 9636)
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase tracking-wide">Total Building Cost</div>
            <div className="text-lg font-bold text-slate-900">
              {formatCostSegCurrency(totalBuildingCost)}
            </div>
          </div>
        </div>
      </div>

      {/* Systems Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSystems.map((system) => (
            <SystemCard 
              key={system.system} 
              system={system} 
              totalCost={totalBuildingCost}
            />
          ))}
        </div>

        {sortedSystems.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No building systems data available.
          </div>
        )}
      </div>

      {/* Table View */}
      <div className="px-6 pb-6">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Detailed Breakdown</h4>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700">System</th>
                <th className="text-right px-4 py-2.5 font-semibold text-slate-700">Depreciable Cost</th>
                <th className="text-right px-4 py-2.5 font-semibold text-slate-700">Replacement Cost</th>
                <th className="text-right px-4 py-2.5 font-semibold text-slate-700">% of Building</th>
                <th className="text-center px-4 py-2.5 font-semibold text-slate-700">Components</th>
              </tr>
            </thead>
            <tbody>
              {sortedSystems.map((system, index) => (
                <tr 
                  key={system.system}
                  className={`border-b border-slate-100 ${index % 2 === 1 ? 'bg-slate-50/30' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${SYSTEM_COLORS[system.system]}`}>
                        {SYSTEM_ICONS[system.system]}
                      </div>
                      <span className="font-medium text-slate-900">{system.systemLabel}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {formatCostSegCurrency(system.depreciableCost)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {formatCostSegCurrency(system.replacementCost)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                      {formatCostSegPercent(system.percentOfBuilding)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">
                    {system.components.length}
                  </td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-slate-100 font-semibold">
                <td className="px-4 py-3 text-slate-900">Total</td>
                <td className="px-4 py-3 text-right text-slate-900">
                  {formatCostSegCurrency(sortedSystems.reduce((sum, s) => sum + s.depreciableCost, 0))}
                </td>
                <td className="px-4 py-3 text-right text-slate-900">
                  {formatCostSegCurrency(sortedSystems.reduce((sum, s) => sum + s.replacementCost, 0))}
                </td>
                <td className="px-4 py-3 text-right text-slate-900">
                  {formatCostSegPercent(sortedSystems.reduce((sum, s) => sum + s.percentOfBuilding, 0))}
                </td>
                <td className="px-4 py-3 text-center text-slate-900">
                  {sortedSystems.reduce((sum, s) => sum + s.components.length, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Footer */}
      <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
        <div className="flex items-start gap-2 text-xs text-blue-700">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p>
            Building systems are classified per IRS Treasury Decision 9636, which defines nine 
            unit of property categories for tangible property regulations. This breakdown is 
            used for determining partial disposition treatment and repair vs. capitalization analysis.
          </p>
        </div>
      </div>
    </div>
  );
};

interface SystemCardProps {
  system: BuildingSystemSummary;
  totalCost: number;
}

const SystemCard: React.FC<SystemCardProps> = ({ system, totalCost }) => {
  const percentOfTotal = totalCost > 0 ? (system.depreciableCost / totalCost) * 100 : 0;
  
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${SYSTEM_COLORS[system.system]}`}>
          {SYSTEM_ICONS[system.system]}
        </div>
        <span className="text-xs text-slate-500">
          {system.components.length} component{system.components.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <h4 className="font-semibold text-slate-900 mb-1">{system.systemLabel}</h4>
      
      <div className="text-xl font-bold text-slate-900 mb-2">
        {formatCostSegCurrency(system.depreciableCost)}
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
        <div 
          className="h-full bg-[#0da1c7] rounded-full transition-all duration-300"
          style={{ width: `${Math.min(percentOfTotal, 100)}%` }}
        />
      </div>
      
      <div className="text-xs text-slate-500">
        {formatCostSegPercent(system.percentOfBuilding)} of building cost
      </div>
    </div>
  );
};

export default BuildingSystems;

