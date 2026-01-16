/**
 * SalesComparisonInstanceTabs.tsx
 * Manages multiple Sales Comparison instances per property component.
 * Part of the Mixed-Use Property Architecture.
 */

import React, { useState, useMemo, Suspense, lazy, useRef, useEffect } from 'react';
import { Loader2, TrendingUp, Building, Home, TreeDeciduous, Plus, X } from 'lucide-react';
import { useWizard } from '../context/WizardContext';
import type { PropertyComponent } from '../types';
import { determineGridConfiguration } from '../constants/gridConfigurations';
import type { PropertyValues, Property } from '../features/sales-comparison';

// Lazy load the SalesComparisonTabs
const SalesComparisonTabs = lazy(() =>
  import('./SalesComparisonTabs').then((m) => ({ default: m.default }))
);

interface SalesComparisonInstanceTabsProps {
  /** Active scenario ID */
  scenarioId?: number;
  /** Analysis mode (standard or improvement/residual) */
  analysisMode?: 'standard' | 'residual';
}

// Loading fallback for lazy-loaded grids
function GridLoader() {
  return (
    <div className="flex-1 flex items-center justify-center bg-surface-2 dark:bg-elevation-2/50 min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-harken-blue animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading sales comparison...</p>
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

export function SalesComparisonInstanceTabs({
  scenarioId,
  analysisMode = 'standard',
}: SalesComparisonInstanceTabsProps) {
  const { state, setActiveComponent } = useWizard();

  // Track active component tab
  const [activeComponentId, setActiveComponentId] = useState<string | null>(null);

  // Get property components that have sales approach enabled
  const salesComponents = useMemo(() => {
    return (state.propertyComponents || []).filter(
      (comp) => comp.analysisConfig.salesApproach
    );
  }, [state.propertyComponents]);

  // Set initial active component if not set
  useEffect(() => {
    if (!activeComponentId && salesComponents.length > 0) {
      setActiveComponentId(salesComponents[0].id);
    }
  }, [salesComponents, activeComponentId]);

  // If no components have sales approach, show default grid
  const showDefaultGrid = salesComponents.length === 0;

  // Get active component
  const activeComponent = salesComponents.find((c) => c.id === activeComponentId);

  const activeGridConfiguration = useMemo(() => {
    if (!activeComponent) {
      return state.subjectData?.gridConfiguration;
    }
    const landAllocation = activeComponent.landAllocation;
    const hasLandAcres = typeof landAllocation?.acres === 'number';
    const hasLandSf = typeof landAllocation?.squareFeet === 'number';
    const subjectSiteSize = state.subjectData?.siteArea
      ? parseFloat(state.subjectData.siteArea)
      : undefined;
    const subjectSiteUnit = state.subjectData?.siteAreaUnit === 'sqft' ? 'sf' : 'acres';
    const siteSize = hasLandAcres
      ? (landAllocation?.acres ?? undefined)
      : hasLandSf
        ? (landAllocation?.squareFeet ?? undefined)
        : subjectSiteSize;
    const siteUnit = hasLandAcres ? 'acres' : hasLandSf ? 'sf' : subjectSiteUnit;
    return determineGridConfiguration(
      activeComponent.category,
      activeComponent.propertyType,
      activeComponent.msOccupancyCode,
      siteSize,
      siteUnit
    );
  }, [activeComponent, state.subjectData?.gridConfiguration, state.subjectData?.siteArea, state.subjectData?.siteAreaUnit]);

  const activeSalesData = useMemo(() => {
    if (!activeComponentId) return undefined;
    const scenarioKey = scenarioId ?? 0;
    return (
      state.salesComparisonDataByComponent?.[activeComponentId]?.[scenarioKey] ||
      (activeComponentId === 'primary' ? state.salesComparisonData : undefined)
    );
  }, [activeComponentId, scenarioId, state.salesComparisonDataByComponent, state.salesComparisonData]);

  useEffect(() => {
    setActiveComponent(activeComponentId);
  }, [activeComponentId, setActiveComponent]);

  // Determine if active component should default to Land Sales tab
  const shouldDefaultToLandSales =
    activeComponent?.landClassification === 'excess' ||
    activeComponent?.landClassification === 'surplus' ||
    activeComponent?.category === 'land';

  // If showing default grid (no components with sales)
  if (showDefaultGrid) {
    return (
      <div className="flex-1 min-h-0 overflow-auto">
        <Suspense fallback={<GridLoader />}>
          <SalesComparisonTabs 
            scenarioId={scenarioId}
            analysisMode={analysisMode}
            gridConfiguration={state.subjectData?.gridConfiguration}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Component tabs - shows when multiple components have sales approach */}
      {salesComponents.length > 1 && (
        <div className="flex items-center gap-2 px-6 py-3 overflow-x-auto border-b border-light-border dark:border-harken-gray/30">
          {salesComponents.map((component) => {
            const Icon = CATEGORY_ICONS[component.category] || TrendingUp;
            const colors = CATEGORY_COLORS[component.category] || CATEGORY_COLORS.commercial;
            const isActive = activeComponentId === component.id;
            const isLandComponent =
              component.landClassification === 'excess' ||
              component.landClassification === 'surplus' ||
              component.category === 'land';

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
                {isLandComponent && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300 font-medium">
                    Land
                  </span>
                )}
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
      {salesComponents.length === 1 && activeComponent && (
        <div className="flex items-center gap-3 px-6 py-3 border-b border-light-border dark:border-harken-gray/30">
          {(() => {
            const Icon = CATEGORY_ICONS[activeComponent.category] || TrendingUp;
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
            <SalesComparisonTabs
              scenarioId={scenarioId}
              analysisMode={analysisMode}
              componentContext={{
                id: activeComponent.id,
                name: activeComponent.name,
                category: activeComponent.category,
                propertyType: activeComponent.propertyType,
                squareFootage: activeComponent.squareFootage,
                landClassification: activeComponent.landClassification,
              }}
              defaultToLandSales={shouldDefaultToLandSales}
            gridConfiguration={activeGridConfiguration}
            properties={activeSalesData?.properties as unknown as Property[] | undefined}
            values={activeSalesData?.values as unknown as PropertyValues | undefined}
            />
          </Suspense>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-harken-gray-med dark:text-slate-400">
              Select a component to view its sales comparison.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SalesComparisonInstanceTabs;
