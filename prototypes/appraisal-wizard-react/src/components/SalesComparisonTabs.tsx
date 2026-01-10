// src/components/SalesComparisonTabs.tsx
// Manages sub-tabs for Sales Comparison approach (Improved Sales / Land Sales)
// Part of the Mixed-Use Property Architecture

import React, { useState, Suspense, lazy } from 'react';
import { Loader2, BarChart3, TreeDeciduous } from 'lucide-react';
import { PROPERTIES, MOCK_VALUES } from '../features/sales-comparison';

// Lazy load the grid components
const SalesGrid = lazy(() => import('../features/sales-comparison').then(m => ({ default: m.SalesGrid })));
const LandSalesGrid = lazy(() => import('../features/land-valuation').then(m => ({ default: m.LandSalesGrid })));

interface SalesComparisonTabsProps {
  /** Whether to show the Land Sales sub-tab */
  showLandSales: boolean;
  /** Analysis mode (standard or residual) */
  analysisMode: 'standard' | 'residual';
  /** Grid configuration from subject data */
  gridConfiguration?: {
    gridType: string;
    unitOfMeasure: string;
    [key: string]: unknown;
  };
  /** Active scenario for context */
  scenarioId?: number;
}

// Loading fallback for lazy-loaded grids
function GridLoader() {
  return (
    <div className="flex-1 flex items-center justify-center bg-surface-2 dark:bg-elevation-2/50 min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-[#0da1c7] animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading grid...</p>
      </div>
    </div>
  );
}

export function SalesComparisonTabs({
  showLandSales,
  analysisMode,
  gridConfiguration,
  scenarioId,
}: SalesComparisonTabsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'improved' | 'land'>('improved');

  // Sub-tab configuration
  const subTabs = [
    {
      id: 'improved' as const,
      label: 'Improved Sales',
      Icon: BarChart3,
      color: 'text-harken-blue dark:text-cyan-400',
      bgActive: 'bg-harken-blue/10 dark:bg-cyan-500/20',
      borderActive: 'border-harken-blue dark:border-cyan-400',
    },
    ...(showLandSales
      ? [
          {
            id: 'land' as const,
            label: 'Land Sales',
            Icon: TreeDeciduous,
            color: 'text-lime-600 dark:text-lime-400',
            bgActive: 'bg-lime-50 dark:bg-lime-500/20',
            borderActive: 'border-lime-500 dark:border-lime-400',
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tab navigation - only show if we have land sales */}
      {showLandSales && (
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-1 dark:bg-elevation-1 border-b border-light-border dark:border-harken-gray">
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${isActive
                    ? `${tab.bgActive} ${tab.color} border ${tab.borderActive}`
                    : 'text-harken-gray-med dark:text-slate-400 hover:bg-surface-2 dark:hover:bg-elevation-2 border border-transparent'
                  }
                `}
              >
                <tab.Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid content */}
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<GridLoader />}>
          {activeSubTab === 'improved' ? (
            <SalesGrid 
              properties={PROPERTIES}
              values={MOCK_VALUES}
              analysisMode={analysisMode}
              scenarioId={scenarioId}
              gridConfig={gridConfiguration}
            />
          ) : (
            <LandSalesGrid />
          )}
        </Suspense>
      </div>
    </div>
  );
}

export default SalesComparisonTabs;
