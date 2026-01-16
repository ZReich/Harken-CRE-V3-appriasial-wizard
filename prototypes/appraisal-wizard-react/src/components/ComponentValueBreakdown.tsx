/**
 * ComponentValueBreakdown.tsx
 * Displays individual component values and their contribution to total property value.
 * Part of the reconciliation enhancements for mixed-use properties.
 */

import React from 'react';
import { Building, Home, TreeDeciduous, TrendingUp, Wallet, HardHat } from 'lucide-react';
import type { PropertyComponent, ComponentReconciliation } from '../types';

interface ComponentValueBreakdownProps {
  components: PropertyComponent[];
  reconciliations: ComponentReconciliation[];
  totalValue: number;
  className?: string;
}

// Category icons
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  commercial: Building,
  residential: Home,
  land: TreeDeciduous,
};

// Approach icons
const APPROACH_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  sales: TrendingUp,
  income: Wallet,
  cost: HardHat,
};

// Category colors
const CATEGORY_COLORS: Record<string, {
  bg: string;
  text: string;
  bar: string;
}> = {
  commercial: {
    bg: 'bg-harken-blue/10 dark:bg-cyan-500/20',
    text: 'text-harken-blue dark:text-cyan-400',
    bar: 'bg-harken-blue dark:bg-cyan-500',
  },
  residential: {
    bg: 'bg-accent-teal-mint/10 dark:bg-teal-500/20',
    text: 'text-accent-teal-mint dark:text-teal-400',
    bar: 'bg-accent-teal-mint dark:bg-teal-500',
  },
  land: {
    bg: 'bg-lime-100 dark:bg-lime-500/20',
    text: 'text-lime-600 dark:text-lime-400',
    bar: 'bg-lime-500 dark:bg-lime-400',
  },
};

export function ComponentValueBreakdown({
  components,
  reconciliations,
  totalValue,
  className = '',
}: ComponentValueBreakdownProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Get reconciliation for a component
  const getReconciliation = (componentId: string) => {
    return reconciliations.find((r) => r.componentId === componentId);
  };

  // Get primary approach for display
  const getPrimaryApproach = (recon: ComponentReconciliation) => {
    if (!recon.approachValues || recon.approachValues.length === 0) return null;
    // Find approach with highest weight
    return recon.approachValues.reduce((max, curr) =>
      curr.weight > max.weight ? curr : max
    );
  };

  return (
    <div className={`bg-surface-1 dark:bg-elevation-1 rounded-xl border border-light-border dark:border-harken-gray/30 ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-light-border dark:border-harken-gray/30">
        <h3 className="text-sm font-bold text-harken-dark dark:text-white">
          Component Value Breakdown
        </h3>
        <p className="text-xs text-harken-gray-med dark:text-slate-400 mt-0.5">
          Individual values contributing to total market value
        </p>
      </div>

      {/* Component List */}
      <div className="divide-y divide-light-border/50 dark:divide-harken-gray/20">
        {components.map((component) => {
          const recon = getReconciliation(component.id);
          const value = recon?.reconciledValue || 0;
          const percentOfTotal = totalValue > 0 ? (value / totalValue) * 100 : 0;
          const primaryApproach = recon ? getPrimaryApproach(recon) : null;

          const Icon = CATEGORY_ICONS[component.category] || Building;
          const colors = CATEGORY_COLORS[component.category] || CATEGORY_COLORS.commercial;
          const ApproachIcon = primaryApproach
            ? APPROACH_ICONS[primaryApproach.approach.toLowerCase()] || TrendingUp
            : null;

          return (
            <div key={component.id} className="p-4">
              {/* Component Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <Icon className={`w-4 h-4 ${colors.text}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-harken-dark dark:text-white">
                      {component.name}
                    </h4>
                    <p className="text-xs text-harken-gray-med dark:text-slate-400 capitalize">
                      {component.propertyType.replace(/-/g, ' ')}
                      {component.isPrimary && (
                        <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-harken-blue/10 text-harken-blue dark:bg-cyan-500/10 dark:text-cyan-400">
                          Primary
                        </span>
                      )}
                      {component.landClassification !== 'standard' && (
                        <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded ${
                          component.landClassification === 'excess'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {component.landClassification === 'excess' ? 'Excess' : 'Surplus'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-harken-dark dark:text-white">
                    {formatCurrency(value)}
                  </span>
                  <span className="block text-xs text-harken-gray-med dark:text-slate-400">
                    {formatPercent(percentOfTotal)} of total
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all ${colors.bar}`}
                  style={{ width: `${Math.min(percentOfTotal, 100)}%` }}
                />
              </div>

              {/* Approach Indicator */}
              {primaryApproach && ApproachIcon && (
                <div className="flex items-center gap-2 text-xs text-harken-gray-med dark:text-slate-400">
                  <ApproachIcon className="w-3 h-3" />
                  <span>{primaryApproach.approach}</span>
                  {primaryApproach.weight < 1 && (
                    <span className="text-harken-gray-light dark:text-slate-500">
                      ({formatPercent(primaryApproach.weight * 100)} weight)
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="px-5 py-4 border-t border-light-border dark:border-harken-gray/30 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-harken-dark dark:text-white">
            Total Market Value
          </span>
          <span className="text-xl font-bold text-harken-blue dark:text-cyan-400">
            {formatCurrency(totalValue)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ComponentValueBreakdown;
