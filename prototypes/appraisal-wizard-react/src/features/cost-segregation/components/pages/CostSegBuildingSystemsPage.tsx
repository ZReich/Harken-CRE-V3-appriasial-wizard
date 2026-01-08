/**
 * CostSegBuildingSystemsPage Component
 * 
 * Building systems breakdown per IRS TD 9636 for the Cost Segregation report.
 */

import React from 'react';
import { formatCostSegCurrency, formatCostSegPercent } from '../../../../services/costSegregationService';
import type { CostSegAnalysis } from '../../../../types';
import type { BuildingSystem } from '../../../../constants/costSegregation';

interface CostSegBuildingSystemsPageProps {
  analysis: CostSegAnalysis;
  className?: string;
}

const SYSTEM_DESCRIPTIONS: Record<BuildingSystem, string> = {
  'hvac': 'Heating, ventilation, and air conditioning equipment including ducts, diffusers, thermostats, and controls.',
  'plumbing': 'Piping, fixtures, water heaters, and drainage systems for water supply and waste removal.',
  'electrical': 'Electrical service, distribution panels, wiring, receptacles, and switches.',
  'escalators-elevators': 'Vertical transportation systems including elevator cabs, motors, controls, and shafts.',
  'fire-protection': 'Sprinkler systems, fire alarms, detection devices, extinguishers, and emergency lighting.',
  'security': 'Access control systems, surveillance cameras, alarms, and related security equipment.',
  'gas-distribution': 'Natural gas piping, meters, regulators, and connections for gas-fired equipment.',
  'structural': 'Foundation, framing, exterior walls, roof structure, and other load-bearing elements.',
  'other': 'Building components not classified in the eight specific systems above.',
};

export const CostSegBuildingSystemsPage: React.FC<CostSegBuildingSystemsPageProps> = ({
  analysis,
  className = '',
}) => {
  // Sort systems by cost (highest first), filter out zero-cost systems
  const systems = analysis.buildingSystems
    .filter(s => s.depreciableCost > 0)
    .sort((a, b) => b.depreciableCost - a.depreciableCost);

  const totalSystemsCost = systems.reduce((sum, s) => sum + s.depreciableCost, 0);

  return (
    <div className={`bg-surface-1 p-12 ${className}`}>
      <h2 className="text-2xl font-bold text-[#1c3643] mb-6 pb-4 border-b-2 border-[#0da1c7]">
        Building Systems Analysis
      </h2>

      {/* Introduction */}
      <div className="prose prose-slate max-w-none mb-8 text-sm">
        <p>
          Treasury Decision 9636 established the Tangible Property Regulations, which define nine 
          building systems as distinct units of property for purposes of determining whether 
          expenditures should be capitalized or expensed. This analysis allocates building costs 
          among these systems for compliance with IRS guidelines.
        </p>
      </div>

      {/* IRS TD 9636 Reference */}
      <div className="bg-harken-gray-light border border-light-border rounded-lg p-4 mb-6">
        <h4 className="font-medium text-slate-800 mb-2">IRS Building Systems (TD 9636)</h4>
        <div className="grid grid-cols-3 gap-2 text-sm text-harken-gray">
          <div>1. HVAC Systems</div>
          <div>2. Plumbing Systems</div>
          <div>3. Electrical Systems</div>
          <div>4. Escalators & Elevators</div>
          <div>5. Fire Protection & Alarm</div>
          <div>6. Security Systems</div>
          <div>7. Gas Distribution</div>
          <div>8. Structural Components</div>
          <div>9. Other Building Components</div>
        </div>
      </div>

      {/* Systems Breakdown */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-[#1c3643] mb-4">Building Systems Valuation</h3>
        
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-300 bg-harken-gray-light">
              <th className="text-left py-3 px-4 font-semibold text-harken-gray">System</th>
              <th className="text-right py-3 px-4 font-semibold text-harken-gray">Depreciable Cost</th>
              <th className="text-right py-3 px-4 font-semibold text-harken-gray">Replacement Cost</th>
              <th className="text-right py-3 px-4 font-semibold text-harken-gray">% of Building</th>
              <th className="text-center py-3 px-4 font-semibold text-harken-gray">Components</th>
            </tr>
          </thead>
          <tbody>
            {systems.map((system, idx) => (
              <tr 
                key={system.system}
                className={`border-b border-light-border ${idx % 2 === 1 ? 'bg-harken-gray-light/50' : ''}`}
              >
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-900">{system.systemLabel}</div>
                  <div className="text-xs text-harken-gray-med mt-0.5">
                    {SYSTEM_DESCRIPTIONS[system.system]}
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-slate-900">
                  {formatCostSegCurrency(system.depreciableCost)}
                </td>
                <td className="py-3 px-4 text-right text-harken-gray">
                  {formatCostSegCurrency(system.replacementCost)}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="inline-flex px-2 py-0.5 bg-harken-gray-light text-harken-gray rounded-full text-xs font-medium">
                    {formatCostSegPercent(system.percentOfBuilding)}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-harken-gray">
                  {system.components.length}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-harken-gray-light font-semibold border-t border-slate-300">
              <td className="py-3 px-4 text-slate-900">Total - All Systems</td>
              <td className="py-3 px-4 text-right text-slate-900">
                {formatCostSegCurrency(totalSystemsCost)}
              </td>
              <td className="py-3 px-4 text-right text-slate-900">
                {formatCostSegCurrency(totalSystemsCost)}
              </td>
              <td className="py-3 px-4 text-right text-slate-900">
                {formatCostSegPercent(
                  analysis.totalBuildingCost > 0 
                    ? totalSystemsCost / analysis.totalBuildingCost 
                    : 0
                )}
              </td>
              <td className="py-3 px-4 text-center text-slate-900">
                {systems.reduce((sum, s) => sum + s.components.length, 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Visual Chart (Simple Bar Representation) */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-[#1c3643] mb-4">Cost Distribution</h3>
        <div className="space-y-3">
          {systems.slice(0, 8).map((system) => {
            const percent = analysis.totalBuildingCost > 0 
              ? (system.depreciableCost / analysis.totalBuildingCost) * 100 
              : 0;
            
            return (
              <div key={system.system}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-harken-gray">{system.systemLabel}</span>
                  <span className="text-harken-gray font-medium">
                    {formatCostSegCurrency(system.depreciableCost)}
                  </span>
                </div>
                <div className="h-4 bg-harken-gray-light rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#0da1c7] to-[#0b8eb1] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Regulatory Reference */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Regulatory Reference</h4>
        <p className="text-sm text-blue-700 mb-3">
          The building systems framework is established by Treasury Decision 9636, which implements 
          the final tangible property regulations under IRC Sections 162 and 263. These regulations 
          are important for:
        </p>
        <ul className="text-sm text-blue-700 list-disc ml-6 space-y-1">
          <li>Determining unit of property for capitalization vs. expense decisions</li>
          <li>Partial disposition elections when replacing building systems</li>
          <li>Betterment, restoration, and adaptation analysis</li>
          <li>De minimis safe harbor and routine maintenance safe harbor</li>
        </ul>
      </div>
    </div>
  );
};

export default CostSegBuildingSystemsPage;
