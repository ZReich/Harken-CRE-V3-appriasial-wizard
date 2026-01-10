// src/components/IncomeApproachInstanceTabs.tsx
// Manages multiple Income Approach instances per property component
// Part of the Mixed-Use Property Architecture

import React, { useState, useMemo, Suspense, lazy, useRef, useEffect } from 'react';
import { Loader2, Wallet, Building, Home, Plus, X } from 'lucide-react';
import { useWizard } from '../context/WizardContext';
import type { PropertyComponent, IncomeApproachInstance } from '../types';

// Lazy load the IncomeApproachGrid
const IncomeApproachGrid = lazy(() => 
  import('../features/income-approach').then(m => ({ default: m.IncomeApproachGrid }))
);

interface IncomeApproachInstanceTabsProps {
  /** Active scenario ID */
  scenarioId?: number;
  /** Visibility configuration */
  visibility?: {
    rentComparableGrid?: boolean;
    expenseComparableGrid?: boolean;
  };
  /** Default rent comp mode when no property components exist */
  rentCompMode?: 'commercial' | 'residential';
}

// Loading fallback for lazy-loaded grids
function GridLoader() {
  return (
    <div className="flex-1 flex items-center justify-center bg-surface-2 dark:bg-elevation-2/50 min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-[#22c55e] animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading income analysis...</p>
      </div>
    </div>
  );
}

// Category icons
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  commercial: Building,
  residential: Home,
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

export function IncomeApproachInstanceTabs({
  scenarioId,
  visibility = { rentComparableGrid: true, expenseComparableGrid: true },
  rentCompMode = 'commercial',
}: IncomeApproachInstanceTabsProps) {
  const { state, setIncomeApproachData, dispatch } = useWizard();
  
  // Dropdown state and ref for click-based dropdown
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        addButtonRef.current &&
        !addButtonRef.current.contains(event.target as Node)
      ) {
        setShowAddDropdown(false);
      }
    };
    
    if (showAddDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAddDropdown]);
  
  // Get property components that have income approach enabled
  const incomeComponents = useMemo(() => {
    return (state.propertyComponents || []).filter(
      comp => comp.analysisConfig.incomeApproach
    );
  }, [state.propertyComponents]);

  // Get income approach instances from state
  const incomeInstances = state.incomeApproachInstances || [];

  // Track active instance tab
  const [activeInstanceId, setActiveInstanceId] = useState<string | null>(
    incomeInstances.length > 0 ? incomeInstances[0].id : null
  );

  // If no components have income approach, show default grid
  const showDefaultGrid = incomeComponents.length === 0;

  // Create an income instance for a component
  const handleCreateInstance = (component: PropertyComponent) => {
    const newInstance: IncomeApproachInstance = {
      id: `income_${component.id}_${Date.now()}`,
      componentId: component.id,
      componentName: component.name,
      analysisType: component.analysisConfig.analysisType === 'contributory' ? 'contributory' : 'full',
      incomeLineItems: [],
      incomeData: {
        rentalIncome: [],
        expenseReimbursements: [],
        otherIncome: [],
        vacancyRate: 5,
      },
      expenseData: {
        expenses: [],
        reserves: [],
        managementFeePercent: 3,
      },
      valuationData: {
        capRate: 7,
        dcfYears: 10,
        terminalCapRate: 8,
        discountRate: 9,
      },
      rentComparables: [],
      rentCompMode: component.category === 'residential' ? 'residential' : 'commercial',
      concludedValue: null,
    };

    dispatch({ type: 'ADD_INCOME_APPROACH_INSTANCE', payload: newInstance });
    setActiveInstanceId(newInstance.id);
  };

  // Determine rent comp mode based on component category
  const getRentCompMode = (componentId: string): 'commercial' | 'residential' => {
    const component = incomeComponents.find(c => c.id === componentId);
    return component?.category === 'residential' ? 'residential' : 'commercial';
  };

  // If showing default grid (no components with income)
  if (showDefaultGrid) {
    return (
      <div className="flex-1 min-h-0 overflow-auto">
        <Suspense fallback={<GridLoader />}>
          <IncomeApproachGrid
            initialData={state.incomeApproachData}
            onDataChange={setIncomeApproachData}
            showGuidancePanel={true}
            scenarioId={scenarioId}
            visibility={visibility}
            rentCompMode={rentCompMode}
          />
        </Suspense>
      </div>
    );
  }

  // Get components that don't have instances yet
  const componentsWithoutInstances = incomeComponents.filter(
    comp => !incomeInstances.some(inst => inst.componentId === comp.id)
  );

  // Get active instance
  const activeInstance = incomeInstances.find(inst => inst.id === activeInstanceId);

  return (
    <div className="flex flex-col h-full">
      {/* Instance tabs */}
      <div className="flex items-center gap-2 px-4 py-2 bg-surface-1 dark:bg-elevation-1 border-b border-light-border dark:border-harken-gray overflow-x-auto">
        {incomeInstances.map((instance) => {
          const component = incomeComponents.find(c => c.id === instance.componentId);
          const category = component?.category || 'commercial';
          const Icon = CATEGORY_ICONS[category] || Wallet;
          const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.commercial;
          const isActive = activeInstanceId === instance.id;

          return (
            <button
              key={instance.id}
              onClick={() => setActiveInstanceId(instance.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                whitespace-nowrap border
                ${isActive
                  ? `${colors.active} ${colors.border}`
                  : `${colors.inactive} border-transparent`
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{instance.componentName}</span>
              {instance.analysisType === 'contributory' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  Contributory
                </span>
              )}
            </button>
          );
        })}

        {/* Add new instance for components without one */}
        {componentsWithoutInstances.length > 0 && (
          <div className="relative">
            <button
              ref={addButtonRef}
              onClick={() => setShowAddDropdown(!showAddDropdown)}
              className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg border transition-all ${
                showAddDropdown
                  ? 'bg-accent-teal-mint/10 text-accent-teal-mint border-accent-teal-mint dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-400'
                  : 'text-harken-gray-med dark:text-slate-400 hover:text-harken-blue dark:hover:text-cyan-400 border-transparent hover:border-harken-blue/30'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Dropdown for component selection - Rendered outside overflow container */}
      {showAddDropdown && componentsWithoutInstances.length > 0 && (
        <div 
          ref={dropdownRef}
          className="fixed inset-0 z-[9999]"
          style={{ pointerEvents: 'none' }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/10"
            style={{ pointerEvents: 'auto' }}
            onClick={() => setShowAddDropdown(false)}
          />
          
          {/* Dropdown menu - positioned relative to button */}
          <div 
            className="absolute bg-surface-0 dark:bg-elevation-1 rounded-xl shadow-2xl border border-light-border dark:border-harken-gray overflow-hidden animate-fade-in"
            style={{ 
              pointerEvents: 'auto',
              top: addButtonRef.current ? addButtonRef.current.getBoundingClientRect().bottom + 8 : 0,
              left: addButtonRef.current ? addButtonRef.current.getBoundingClientRect().left : 0,
              minWidth: 280,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-light-border dark:border-harken-gray bg-surface-1 dark:bg-elevation-2">
              <span className="text-sm font-semibold text-harken-dark dark:text-white">
                Create Income Analysis
              </span>
              <button 
                onClick={() => setShowAddDropdown(false)}
                className="p-1 rounded-md hover:bg-surface-2 dark:hover:bg-elevation-3 transition-colors"
              >
                <X className="w-4 h-4 text-harken-gray-med" />
              </button>
            </div>
            
            {/* Component options */}
            <div className="p-2">
              <p className="px-2 py-1 text-xs text-harken-gray-med dark:text-slate-400 mb-1">
                Select a property component:
              </p>
              {componentsWithoutInstances.map((comp) => {
                const Icon = CATEGORY_ICONS[comp.category] || Wallet;
                const colors = CATEGORY_COLORS[comp.category] || CATEGORY_COLORS.commercial;
                return (
                  <button
                    key={comp.id}
                    onClick={() => {
                      handleCreateInstance(comp);
                      setShowAddDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all hover:${colors.active} border border-transparent hover:${colors.border}`}
                  >
                    <div className={`p-1.5 rounded-md ${colors.active}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-medium text-harken-dark dark:text-white">{comp.name}</span>
                      <p className="text-xs text-harken-gray-med dark:text-slate-400">
                        {comp.category.charAt(0).toUpperCase() + comp.category.slice(1)} • {comp.analysisConfig.analysisType === 'contributory' ? 'Contributory' : 'Full Analysis'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Active instance content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {activeInstance ? (
          <Suspense fallback={<GridLoader />}>
            {(() => {
              // Find the component associated with this instance
              const component = incomeComponents.find(c => c.id === activeInstance.componentId);
              
              return (
                <IncomeApproachGrid
                  initialData={state.incomeApproachData}
                  onDataChange={setIncomeApproachData}
                  showGuidancePanel={true}
                  scenarioId={scenarioId}
                  visibility={visibility}
                  rentCompMode={component?.category === 'residential' ? 'residential' : 'commercial'}
                  componentData={component ? {
                    id: component.id,
                    name: component.name,
                    category: component.category,
                    propertyType: component.propertyType || 'office',
                    squareFootage: component.squareFootage,
                    unitCount: component.unitCount ?? null,
                    sfSource: component.sfSource, // Pass SF source for unknown SF handling
                  } : undefined}
                />
              );
            })()}
          </Suspense>
        ) : incomeInstances.length === 0 && componentsWithoutInstances.length > 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <Wallet className="w-16 h-16 text-harken-gray-light dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-harken-gray dark:text-slate-200 mb-2">
              No Income Analysis Created
            </h3>
            <p className="text-sm text-harken-gray-med dark:text-slate-400 text-center max-w-md mb-6">
              Create an income analysis for one of your property components to get started.
            </p>
            <div className="flex flex-wrap gap-2">
              {componentsWithoutInstances.map((comp) => {
                const Icon = CATEGORY_ICONS[comp.category] || Wallet;
                const colors = CATEGORY_COLORS[comp.category] || CATEGORY_COLORS.commercial;
                return (
                  <button
                    key={comp.id}
                    onClick={() => handleCreateInstance(comp)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${colors.active} border ${colors.border}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>Analyze {comp.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-harken-gray-med dark:text-slate-400">
              Select an income instance to view its analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default IncomeApproachInstanceTabs;
