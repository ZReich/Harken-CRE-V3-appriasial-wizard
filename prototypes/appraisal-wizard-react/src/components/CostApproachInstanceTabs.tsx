/**
 * CostApproachInstanceTabs.tsx
 * Manages multiple Cost Approach instances per property component.
 * Part of the Mixed-Use Property Architecture.
 */

import React, { useState, useMemo, Suspense, lazy, useEffect } from 'react';
import { Loader2, HardHat, Building, Home, TreeDeciduous } from 'lucide-react';
import { useWizard } from '../context/WizardContext';
import type { PropertyComponent } from '../types';

// Lazy load the CostApproachGrid
const CostApproachGrid = lazy(() =>
  import('../features/cost-approach').then((m) => ({ default: m.CostApproachGrid }))
);

interface CostApproachInstanceTabsProps {
  /** Active scenario ID */
  scenarioId?: number;
}

// Loading fallback for lazy-loaded grids
function GridLoader() {
  return (
    <div className="flex-1 flex items-center justify-center bg-surface-2 dark:bg-elevation-2/50 min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading cost approach...</p>
      </div>
    </div>
  );
}

// Category icons
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  commercial: Building,
  residential: Home,
  land: TreeDeciduous,
};

// Category colors for tabs
const CATEGORY_COLORS: Record<string, {
  active: string;
  inactive: string;
  border: string;
}> = {
  commercial: {
    active: 'bg-harken-blue/10 text-harken-blue dark:bg-cyan-500/20 dark:text-cyan-400',
    inactive: 'text-harken-gray-med dark:text-slate-400 hover:bg-surface-2 dark:hover:bg-elevation-2',
    border: 'border-harken-blue dark:border-cyan-400',
  },
  residential: {
    active: 'bg-accent-teal-mint/10 text-accent-teal-mint dark:bg-teal-500/20 dark:text-teal-400',
    inactive: 'text-harken-gray-med dark:text-slate-400 hover:bg-surface-2 dark:hover:bg-elevation-2',
    border: 'border-accent-teal-mint dark:border-teal-400',
  },
  land: {
    active: 'bg-lime-50 text-lime-600 dark:bg-lime-500/20 dark:text-lime-400',
    inactive: 'text-harken-gray-med dark:text-slate-400 hover:bg-surface-2 dark:hover:bg-elevation-2',
    border: 'border-lime-500 dark:border-lime-400',
  },
};

export function CostApproachInstanceTabs({
  scenarioId,
}: CostApproachInstanceTabsProps) {
  const { state } = useWizard();

  // Track active component tab
  const [activeComponentId, setActiveComponentId] = useState<string | null>(null);

  // Get property components that have cost approach enabled
  const costComponents = useMemo(() => {
    return (state.propertyComponents || []).filter(
      (comp) => comp.analysisConfig.costApproach
    );
  }, [state.propertyComponents]);

  // Set initial active component if not set
  useEffect(() => {
    if (!activeComponentId && costComponents.length > 0) {
      setActiveComponentId(costComponents[0].id);
    }
  }, [costComponents, activeComponentId]);

  // If no components have cost approach, show default grid
  const showDefaultGrid = costComponents.length === 0;

  // Get active component
  const activeComponent = costComponents.find((c) => c.id === activeComponentId);

  // If showing default grid (no components with cost approach)
  if (showDefaultGrid) {
    return (
      <div className="flex-1 min-h-0 overflow-auto">
        <Suspense fallback={<GridLoader />}>
          <CostApproachGrid scenarioId={scenarioId} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Component tabs - shows when multiple components have cost approach */}
      {costComponents.length > 1 && (
        <div className="flex items-center gap-2 px-6 py-3 overflow-x-auto border-b border-light-border dark:border-harken-gray/30">
          {costComponents.map((component) => {
            const Icon = CATEGORY_ICONS[component.category] || HardHat;
            const colors = CATEGORY_COLORS[component.category] || CATEGORY_COLORS.commercial;
            const isActive = activeComponentId === component.id;

            return (
              <button
                key={component.id}
                onClick={() => setActiveComponentId(component.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                  whitespace-nowrap shadow-sm
                  ${
                    isActive
                      ? `${colors.active} ${colors.border} border shadow-md`
                      : `bg-white dark:bg-elevation-2 ${colors.inactive} border border-light-border dark:border-harken-gray hover:shadow-md`
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{component.name}</span>
                {component.isPrimary && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-harken-blue/10 text-harken-blue dark:bg-cyan-900/30 dark:text-cyan-300 font-medium">
                    Primary
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Single component header when only one component */}
      {costComponents.length === 1 && activeComponent && (
        <div className="flex items-center gap-3 px-6 py-3 border-b border-light-border dark:border-harken-gray/30">
          {(() => {
            const Icon = CATEGORY_ICONS[activeComponent.category] || HardHat;
            const colors = CATEGORY_COLORS[activeComponent.category] || CATEGORY_COLORS.commercial;
            return (
              <>
                <div className={`p-2 rounded-lg ${colors.active}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-harken-dark dark:text-white">
                    {activeComponent.name}
                  </h3>
                  <p className="text-xs text-harken-gray-med dark:text-slate-400 capitalize">
                    {activeComponent.category} • {activeComponent.propertyType.replace(/-/g, ' ')}
                    {activeComponent.squareFootage && (
                      <span> • {activeComponent.squareFootage.toLocaleString()} SF</span>
                    )}
                  </p>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Active component content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {activeComponent ? (
          <Suspense fallback={<GridLoader />}>
            <CostApproachGrid
              scenarioId={scenarioId}
              componentContext={{
                id: activeComponent.id,
                name: activeComponent.name,
                category: activeComponent.category,
                propertyType: activeComponent.propertyType,
                squareFootage: activeComponent.squareFootage,
              }}
            />
          </Suspense>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-harken-gray-med dark:text-slate-400">
              Select a component to view its cost approach.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CostApproachInstanceTabs;
