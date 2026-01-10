// src/components/ValueReconciliationSummary.tsx
// Value aggregation and reconciliation summary for mixed-use properties
// Displays combined values from primary, contributory, and excess land components

import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Building,
  Home,
  TreeDeciduous,
  DollarSign,
  Plus,
  Equal,
  CheckCircle,
} from 'lucide-react';
import { useWizard } from '../context/WizardContext';
import type { PropertyComponent, IncomeApproachInstance } from '../types';

interface ValueReconciliationSummaryProps {
  /** Current scenario ID to get scenario-specific values */
  scenarioId?: number;
  /** Callback when reconciliation is confirmed */
  onConfirm?: (totalValue: number) => void;
}

// Category icons
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  commercial: Building,
  residential: Home,
  land: TreeDeciduous,
};

// Category colors
const CATEGORY_COLORS: Record<string, {
  bg: string;
  text: string;
  border: string;
}> = {
  commercial: {
    bg: 'bg-harken-blue/5 dark:bg-cyan-500/10',
    text: 'text-harken-blue dark:text-cyan-400',
    border: 'border-harken-blue/20 dark:border-cyan-500/30',
  },
  residential: {
    bg: 'bg-accent-teal-mint/5 dark:bg-teal-500/10',
    text: 'text-accent-teal-mint dark:text-teal-400',
    border: 'border-accent-teal-mint/20 dark:border-teal-500/30',
  },
  land: {
    bg: 'bg-lime-50 dark:bg-lime-500/10',
    text: 'text-lime-600 dark:text-lime-400',
    border: 'border-lime-300 dark:border-lime-500/30',
  },
};

interface ValueLineItem {
  id: string;
  name: string;
  category: string;
  type: 'primary' | 'contributory' | 'excess_land' | 'surplus_land';
  approach: string;
  value: number;
  roundedValue: number;
  weight?: number;
  methodology?: string;
}

export function ValueReconciliationSummary({
  scenarioId,
  onConfirm,
}: ValueReconciliationSummaryProps) {
  const { state, getActiveScenario } = useWizard();
  const activeScenario = getActiveScenario();
  const scenarioName = activeScenario?.name || 'As Is';

  const [isExpanded, setIsExpanded] = useState(false);
  const [confirmedValue, setConfirmedValue] = useState<number | null>(null);

  // Calculate value breakdown from property components and income instances
  const valueBreakdown = useMemo<ValueLineItem[]>(() => {
    const items: ValueLineItem[] = [];

    // Get property components
    const components = state.propertyComponents || [];
    const incomeInstances = state.incomeApproachInstances || [];

    components.forEach((comp) => {
      // Determine analysis type
      let type: ValueLineItem['type'] = 'primary';
      if (comp.analysisConfig.analysisType === 'contributory') {
        type = 'contributory';
      } else if (comp.landClassification === 'excess') {
        type = 'excess_land';
      } else if (comp.landClassification === 'surplus') {
        type = 'surplus_land';
      }

      // Find associated income instance
      const incomeInstance = incomeInstances.find(
        (inst) => inst.componentId === comp.id
      );

      // Get concluded value (mock for now - would come from actual analysis)
      const concludedValue = incomeInstance?.concludedValue || 0;

      // Only add if value > 0 or it's a primary component
      if (concludedValue > 0 || comp.isPrimary) {
        items.push({
          id: comp.id,
          name: comp.name,
          category: comp.category,
          type,
          approach: comp.analysisConfig.incomeApproach
            ? 'Income Approach'
            : comp.analysisConfig.salesApproach
            ? 'Sales Comparison'
            : 'Cost Approach',
          value: concludedValue,
          roundedValue: Math.round(concludedValue / 1000) * 1000,
          weight: comp.isPrimary ? 1 : 0.5,
          methodology:
            type === 'contributory'
              ? 'Contributory value added to primary'
              : type === 'excess_land'
              ? 'Excess land valued separately via land sales comparison'
              : type === 'surplus_land'
              ? 'Surplus land adjustment applied'
              : 'Full analysis approach',
        });
      }
    });

    // If no components, add a placeholder for the primary analysis
    if (items.length === 0 && state.incomeApproachData) {
      // Get category from primary component or default to 'commercial'
      const primaryComponent = state.propertyComponents?.find(c => c.isPrimary);
      const category = primaryComponent?.category || 'commercial';
      // Check if income approach is enabled for this scenario
      const hasIncomeApproach = activeScenario?.approaches?.includes('Income Approach');
      if (hasIncomeApproach) {
        // Get concluded value from income approach data if available
        // For now, use a placeholder - in production this would come from actual calculations
        const concludedValue = 0; // Would be calculated from state.incomeApproachData
        items.push({
          id: 'primary',
          name: 'Subject Property',
          category: category,
          type: 'primary',
          approach: 'Income Approach',
          value: concludedValue,
          roundedValue: Math.round(concludedValue / 1000) * 1000,
          methodology: 'Direct Capitalization',
        });
      }
    }

    return items;
  }, [state.propertyComponents, state.incomeApproachInstances, state.incomeApproachData, activeScenario]);

  // Calculate totals
  const totals = useMemo(() => {
    const primary = valueBreakdown
      .filter((item) => item.type === 'primary')
      .reduce((sum, item) => sum + item.value, 0);

    const contributory = valueBreakdown
      .filter((item) => item.type === 'contributory')
      .reduce((sum, item) => sum + item.value, 0);

    const excessLand = valueBreakdown
      .filter((item) => item.type === 'excess_land')
      .reduce((sum, item) => sum + item.value, 0);

    const surplusLand = valueBreakdown
      .filter((item) => item.type === 'surplus_land')
      .reduce((sum, item) => sum + item.value, 0);

    const total = primary + contributory + excessLand + surplusLand;
    const roundedTotal = Math.round(total / 1000) * 1000;

    return {
      primary,
      contributory,
      excessLand,
      surplusLand,
      total,
      roundedTotal,
    };
  }, [valueBreakdown]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleConfirm = () => {
    setConfirmedValue(totals.roundedTotal);
    onConfirm?.(totals.roundedTotal);
  };

  const hasMultipleComponents = valueBreakdown.length > 1;
  const hasMixedUse = valueBreakdown.some((item) =>
    ['contributory', 'excess_land', 'surplus_land'].includes(item.type)
  );

  return (
    <div className="bg-surface-1 dark:bg-elevation-1 rounded-xl border border-light-border dark:border-harken-gray overflow-hidden">
      {/* Header */}
      <div
        className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-colors ${
          isExpanded ? 'bg-surface-2 dark:bg-elevation-2' : 'hover:bg-surface-2/50 dark:hover:bg-elevation-2/50'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-teal-mint/10 dark:bg-green-500/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-accent-teal-mint dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-harken-dark dark:text-white">
              Value Reconciliation
            </h3>
            <p className="text-sm text-harken-gray-med dark:text-slate-400">
              {scenarioName} {hasMixedUse ? '(Mixed-Use Aggregation)' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-harken-dark dark:text-white">
              {formatCurrency(totals.roundedTotal)}
            </p>
            {hasMultipleComponents && (
              <p className="text-xs text-harken-gray-med dark:text-slate-400">
                {valueBreakdown.length} components combined
              </p>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-harken-gray-med" />
          ) : (
            <ChevronDown className="w-5 h-5 text-harken-gray-med" />
          )}
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-6 py-4 border-t border-light-border dark:border-harken-gray">
          {/* Value breakdown table */}
          <div className="space-y-3 mb-6">
            {valueBreakdown.map((item, index) => {
              const Icon = CATEGORY_ICONS[item.category] || Building;
              const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.commercial;
              const isLast = index === valueBreakdown.length - 1;

              return (
                <div key={item.id} className="relative">
                  <div
                    className={`flex items-center justify-between p-4 rounded-lg ${colors.bg} border ${colors.border}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                      <div>
                        <p className={`font-semibold ${colors.text}`}>{item.name}</p>
                        <p className="text-xs text-harken-gray-med dark:text-slate-400">
                          {item.approach}
                          {item.type !== 'primary' && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {item.type === 'contributory'
                                ? 'Contributory'
                                : item.type === 'excess_land'
                                ? 'Excess Land'
                                : 'Surplus Land'}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-harken-dark dark:text-white">
                        {formatCurrency(item.roundedValue)}
                      </p>
                      {item.methodology && (
                        <p className="text-[10px] text-harken-gray-med dark:text-slate-500">
                          {item.methodology}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Plus sign between items */}
                  {!isLast && (
                    <div className="flex justify-center py-1">
                      <Plus className="w-4 h-4 text-harken-gray-med" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Totals section */}
          {hasMultipleComponents && (
            <div className="border-t border-light-border dark:border-harken-gray pt-4 mb-6">
              <div className="flex items-center gap-2 mb-3 text-harken-gray-med dark:text-slate-400">
                <Equal className="w-4 h-4" />
                <span className="text-sm font-medium">Value Summary</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {totals.primary > 0 && (
                  <div className="bg-surface-2 dark:bg-elevation-2 rounded-lg p-3">
                    <p className="text-xs text-harken-gray-med dark:text-slate-400 mb-1">Primary Value</p>
                    <p className="font-bold text-harken-dark dark:text-white">{formatCurrency(totals.primary)}</p>
                  </div>
                )}
                {totals.contributory > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Contributory</p>
                    <p className="font-bold text-amber-700 dark:text-amber-300">{formatCurrency(totals.contributory)}</p>
                  </div>
                )}
                {totals.excessLand > 0 && (
                  <div className="bg-lime-50 dark:bg-lime-900/20 rounded-lg p-3">
                    <p className="text-xs text-lime-600 dark:text-lime-400 mb-1">Excess Land</p>
                    <p className="font-bold text-lime-700 dark:text-lime-300">{formatCurrency(totals.excessLand)}</p>
                  </div>
                )}
                {totals.surplusLand > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Surplus Land</p>
                    <p className="font-bold text-slate-600 dark:text-slate-300">{formatCurrency(totals.surplusLand)}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between bg-gradient-to-r from-accent-teal-mint/10 to-harken-blue/10 dark:from-green-900/30 dark:to-cyan-900/30 rounded-lg p-4 border border-accent-teal-mint/20 dark:border-green-500/30">
                <div>
                  <p className="text-sm font-medium text-harken-gray dark:text-slate-200">
                    Combined Market Value
                  </p>
                  <p className="text-xs text-harken-gray-med dark:text-slate-400">
                    Rounded to nearest $1,000
                  </p>
                </div>
                <p className="text-3xl font-bold text-harken-dark dark:text-white">
                  {formatCurrency(totals.roundedTotal)}
                </p>
              </div>
            </div>
          )}

          {/* Confirm button */}
          <div className="flex justify-end">
            {confirmedValue !== null ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-accent-teal-mint/10 dark:bg-green-500/20 rounded-lg border border-accent-teal-mint/20 dark:border-green-500/30">
                <CheckCircle className="w-5 h-5 text-accent-teal-mint dark:text-green-400" />
                <span className="text-sm font-medium text-accent-teal-mint dark:text-green-400">
                  Value Confirmed: {formatCurrency(confirmedValue)}
                </span>
              </div>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={totals.total === 0}
                className="px-6 py-2 bg-harken-blue hover:bg-harken-blue-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Confirm Reconciled Value
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ValueReconciliationSummary;
