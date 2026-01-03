/**
 * ContractorCostComparison Component
 * 
 * Allows appraisers to compare actual contractor costs/bids against
 * Marshall & Swift calculated estimates for reconciliation.
 */

import React, { useState, useMemo } from 'react';
import { Scale, BookOpen, HardHat, FileText, Receipt, Calculator, ChevronDown, ChevronRight } from 'lucide-react';
import EnhancedTextArea from '../../../components/EnhancedTextArea';
import { useWizard } from '../../../context/WizardContext';
import { formatCurrency } from '../constants';

interface ContractorCostComparisonProps {
  scenarioId?: number;
  msTotalCost: number; // Marshall & Swift calculated cost
  buildingId?: string; // Optional: specific building, otherwise aggregate
}

export const ContractorCostComparison: React.FC<ContractorCostComparisonProps> = ({
  scenarioId,
  msTotalCost,
  buildingId = 'aggregate',
}) => {
  const { state, setCostApproachBuildingCostData } = useWizard();
  const currentScenarioId = scenarioId ?? state.activeScenarioId;
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get current cost overrides for this building
  const costOverrides = useMemo(() => {
    return state.costApproachBuildingCostData?.[currentScenarioId]?.[buildingId] || {};
  }, [state.costApproachBuildingCostData, currentScenarioId, buildingId]);
  
  const contractorCost = costOverrides.contractorCost || 0;
  const contractorSource = costOverrides.contractorSource || 'bid';
  const contractorNotes = costOverrides.contractorNotes || '';
  
  // Calculate variance
  const variance = msTotalCost > 0 ? ((contractorCost - msTotalCost) / msTotalCost) * 100 : 0;
  
  // Update handler - uses correct function signature: (scenarioId, buildingId, overrides)
  const updateCostData = (updates: Partial<typeof costOverrides>) => {
    const currentData = state.costApproachBuildingCostData?.[currentScenarioId]?.[buildingId] || {};
    const updatedOverrides = { ...currentData, ...updates };
    setCostApproachBuildingCostData(currentScenarioId, buildingId, updatedOverrides as import('../../../types').CostApproachOverrides);
  };
  
  const sourceOptions = [
    { value: 'bid', label: 'Bid', icon: FileText },
    { value: 'invoice', label: 'Invoice', icon: Receipt },
    { value: 'estimate', label: 'Estimate', icon: Calculator },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#0da1c7]" />
          <h4 className="font-semibold text-slate-800 dark:text-white">Contractor Cost Comparison</h4>
          {contractorCost > 0 && (
            <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
              Math.abs(variance) <= 5 
                ? 'bg-emerald-100 text-emerald-700' 
                : Math.abs(variance) <= 15 
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
            }`}>
              {variance > 0 ? '+' : ''}{variance.toFixed(1)}% variance
            </span>
          )}
        </div>
        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Comparison rows */}
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Marshall & Swift Estimate</span>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-white">{formatCurrency(msTotalCost)}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 bg-[#0da1c7]/5 -mx-4 px-4">
              <div className="flex items-center gap-2">
                <HardHat className="w-4 h-4 text-[#0da1c7]" />
                <span className="text-sm font-medium text-[#0da1c7]">Contractor Cost</span>
              </div>
              <input
                type="text"
                className="w-36 px-3 py-1.5 border border-[#0da1c7]/30 rounded-lg text-sm text-right font-bold focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                value={contractorCost ? contractorCost.toLocaleString() : ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  updateCostData({ contractorCost: value ? parseInt(value) : undefined });
                }}
                placeholder="Enter cost"
              />
            </div>
            
            {/* Variance */}
            {contractorCost > 0 && (
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-slate-500 dark:text-slate-400">Variance</span>
                <span className={`text-sm font-bold ${
                  variance > 0 ? 'text-red-600' : variance < 0 ? 'text-emerald-600' : 'text-slate-500'
                }`}>
                  {variance > 0 ? '+' : ''}{formatCurrency(contractorCost - msTotalCost)} ({variance > 0 ? '+' : ''}{variance.toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
          
          {/* Source selection - ButtonSelector style */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Cost Source</label>
            <div className="flex gap-2">
              {sourceOptions.map((option) => {
                const IconComponent = option.icon;
                const isSelected = contractorSource === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateCostData({ contractorSource: option.value as 'bid' | 'invoice' | 'estimate' })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-[#0da1c7] bg-[#0da1c7]/10 text-[#0da1c7]'
                        : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Notes - full EnhancedTextArea */}
          <div>
            <EnhancedTextArea
              label="Cost Reconciliation Notes"
              value={contractorNotes}
              onChange={(v) => updateCostData({ contractorNotes: v })}
              placeholder="Explain the basis for cost selection and any reconciliation between M&S and contractor figures..."
              sectionContext="cost_reconciliation"
              rows={4}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorCostComparison;
