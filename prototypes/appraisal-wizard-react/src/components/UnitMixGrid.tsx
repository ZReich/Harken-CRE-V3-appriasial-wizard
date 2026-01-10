// src/components/UnitMixGrid.tsx
// Reusable unit configuration grid for multi-family properties
// Used by both SetupPage (primary property) and PropertyComponentPanel (secondary components)

import { useMemo, useId } from 'react';
import type { MultiFamilyUnitMix, MultiFamilyCalculationMethod } from '../types';

interface UnitMixGridProps {
  /** Current unit mix data */
  value: MultiFamilyUnitMix[];
  /** Callback when unit mix changes */
  onChange: (mix: MultiFamilyUnitMix[]) => void;
  /** Total unit count (displayed and validated against sum) */
  totalUnitCount?: number;
  /** Callback when total unit count changes */
  onTotalUnitCountChange?: (count: number) => void;
  /** Current calculation method */
  calculationMethod?: MultiFamilyCalculationMethod;
  /** Callback when calculation method changes */
  onCalculationMethodChange?: (method: MultiFamilyCalculationMethod) => void;
  /** Whether per-unit SF is unknown (show total building SF input instead) */
  perUnitSfUnknown?: boolean;
  /** Callback when unknown SF toggle changes */
  onPerUnitSfUnknownChange?: (unknown: boolean) => void;
  /** Total building SF (used when per-unit SF is unknown) */
  totalBuildingSf?: number;
  /** Callback when total building SF changes */
  onTotalBuildingSfChange?: (sf: number) => void;
  /** Display mode - 'compact' for component panel, 'full' for setup page */
  mode?: 'compact' | 'full';
  /** Whether to show the calculation method selector */
  showCalculationMethod?: boolean;
  /** Whether to show the unknown SF toggle */
  showUnknownSfToggle?: boolean;
  /** Optional title override */
  title?: string;
  /** Optional description override */
  description?: string;
}

// Unit type display labels
const UNIT_TYPE_LABELS: Record<MultiFamilyUnitMix['unitType'], string> = {
  studio: 'Studio',
  '1br': '1-Bedroom',
  '2br': '2-Bedroom',
  '3br': '3-Bedroom',
  '4br+': '4+ Bedroom',
};

// Default unit mix configuration with sfSource
export const DEFAULT_UNIT_MIX: MultiFamilyUnitMix[] = [
  { unitType: 'studio', count: 0, avgSF: 450, sfSource: 'estimated', bedrooms: 0, bathrooms: 1 },
  { unitType: '1br', count: 0, avgSF: 650, sfSource: 'estimated', bedrooms: 1, bathrooms: 1 },
  { unitType: '2br', count: 0, avgSF: 900, sfSource: 'estimated', bedrooms: 2, bathrooms: 2 },
  { unitType: '3br', count: 0, avgSF: 1200, sfSource: 'estimated', bedrooms: 3, bathrooms: 2 },
  { unitType: '4br+', count: 0, avgSF: 1500, sfSource: 'estimated', bedrooms: 4, bathrooms: 2 },
];

export function UnitMixGrid({
  value,
  onChange,
  totalUnitCount = 0,
  onTotalUnitCountChange,
  calculationMethod = 'per_unit',
  onCalculationMethodChange,
  perUnitSfUnknown = false,
  onPerUnitSfUnknownChange,
  totalBuildingSf = 0,
  onTotalBuildingSfChange,
  mode = 'full',
  showCalculationMethod = true,
  showUnknownSfToggle = true,
  title = 'Unit Configuration',
  description = 'Configure the unit count and mix for accurate price-per-unit calculations.',
}: UnitMixGridProps) {
  // Calculate totals
  const unitMixTotal = useMemo(() => value.reduce((acc, u) => acc + u.count, 0), [value]);
  const sfTotal = useMemo(() => {
    if (perUnitSfUnknown && totalBuildingSf > 0) {
      return totalBuildingSf;
    }
    return value.reduce((acc, u) => acc + (u.count * (u.avgSF || 0)), 0);
  }, [value, perUnitSfUnknown, totalBuildingSf]);
  
  // Calculate average SF per unit when unknown mode is active
  const avgSfPerUnit = useMemo(() => {
    if (perUnitSfUnknown && totalBuildingSf > 0 && unitMixTotal > 0) {
      return Math.round(totalBuildingSf / unitMixTotal);
    }
    return 0;
  }, [perUnitSfUnknown, totalBuildingSf, unitMixTotal]);
  
  // Validation: does total match sum?
  const totalMismatch = totalUnitCount > 0 && totalUnitCount !== unitMixTotal;

  // Handle count change for a unit type
  const handleCountChange = (idx: number, newCount: number) => {
    const newMix = [...value];
    newMix[idx] = { ...newMix[idx], count: newCount };
    onChange(newMix);
    // Auto-update total if callback provided
    if (onTotalUnitCountChange) {
      onTotalUnitCountChange(newMix.reduce((acc, u) => acc + u.count, 0));
    }
  };

  // Handle avgSF change for a unit type
  const handleAvgSfChange = (idx: number, newSf: number | null) => {
    const newMix = [...value];
    newMix[idx] = { 
      ...newMix[idx], 
      avgSF: newSf,
      sfSource: newSf === null ? 'unknown' : (value[idx].sfSource === 'unknown' ? 'estimated' : value[idx].sfSource)
    };
    onChange(newMix);
  };

  // Handle unknown SF toggle
  const handleUnknownToggle = (checked: boolean) => {
    if (onPerUnitSfUnknownChange) {
      onPerUnitSfUnknownChange(checked);
    }
    // Update all sfSource values
    const newMix = value.map(u => ({
      ...u,
      sfSource: checked ? 'unknown' as const : 'estimated' as const,
    }));
    onChange(newMix);
  };

  const isCompact = mode === 'compact';
  
  // Generate unique ID for accessibility (prevents collision when multiple grids render)
  const uniqueId = useId();
  const checkboxId = `perUnitSfUnknown-${uniqueId}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      {!isCompact && (
        <div>
          <h4 className="text-sm font-semibold text-harken-gray dark:text-slate-200 mb-1">
            {title}
          </h4>
          <p className="text-xs text-harken-gray-med dark:text-slate-400">
            {description}
          </p>
        </div>
      )}

      {/* Total Units and Calculation Method */}
      <div className={`grid ${showCalculationMethod ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
        <div>
          <label className="block text-xs font-medium text-harken-gray dark:text-slate-200 mb-1.5">
            Total Units {!isCompact && <span className="text-harken-error">*</span>}
          </label>
          <input
            type="number"
            value={totalUnitCount || ''}
            onChange={(e) => onTotalUnitCountChange?.(parseInt(e.target.value) || 0)}
            placeholder="e.g., 4"
            className={`w-full px-3 py-2 border rounded-lg text-sm font-semibold bg-surface-1 dark:bg-elevation-1 text-harken-dark dark:text-white focus:ring-2 focus:ring-harken-blue focus:border-transparent ${
              totalMismatch
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                : 'border-light-border dark:border-harken-gray'
            }`}
          />
          {totalMismatch && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Total ({totalUnitCount}) ≠ unit mix ({unitMixTotal})</span>
            </p>
          )}
        </div>
        
        {showCalculationMethod && onCalculationMethodChange && (
          <div>
            <label className="block text-xs font-medium text-harken-gray dark:text-slate-200 mb-1.5">
              Primary Calculation Method
            </label>
            <div className="flex gap-1.5">
              {(['per_unit', 'per_sf', 'per_room'] as MultiFamilyCalculationMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => onCalculationMethodChange(method)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    calculationMethod === method
                      ? 'bg-harken-blue text-white'
                      : 'bg-harken-gray-light dark:bg-elevation-2 text-harken-gray dark:text-slate-300 hover:bg-harken-gray-med-lt dark:hover:bg-harken-gray'
                  }`}
                >
                  {method === 'per_unit' ? '$/Unit' : method === 'per_sf' ? '$/SF' : '$/Room'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Unknown SF Toggle */}
      {showUnknownSfToggle && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-elevation-2 border border-light-border dark:border-harken-gray">
          <input
            type="checkbox"
            id={checkboxId}
            checked={perUnitSfUnknown}
            onChange={(e) => handleUnknownToggle(e.target.checked)}
            className="w-4 h-4 text-harken-blue bg-white border-harken-gray-light rounded focus:ring-harken-blue"
          />
          <label htmlFor={checkboxId} className="flex-1 text-xs text-harken-gray dark:text-slate-300">
            <span className="font-medium">Per-unit SF unknown</span>
            <span className="text-harken-gray-med dark:text-slate-400 ml-1">(calculate from total building SF)</span>
          </label>
        </div>
      )}

      {/* Total Building SF Input (when unknown mode) */}
      {perUnitSfUnknown && showUnknownSfToggle && (
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 animate-fade-in">
          <label className="block text-xs font-medium text-amber-800 dark:text-amber-200 mb-1.5">
            Total Building SF
          </label>
          <input
            type="number"
            value={totalBuildingSf || ''}
            onChange={(e) => onTotalBuildingSfChange?.(parseInt(e.target.value) || 0)}
            placeholder="e.g., 5000"
            className="w-full px-3 py-2 border border-amber-300 dark:border-amber-700 rounded-lg text-sm bg-white dark:bg-elevation-1 text-harken-dark dark:text-white focus:ring-2 focus:ring-amber-500"
          />
          {avgSfPerUnit > 0 && (
            <p className="mt-1.5 text-xs text-amber-700 dark:text-amber-300">
              Average per unit: {avgSfPerUnit.toLocaleString()} SF (evenly distributed)
            </p>
          )}
        </div>
      )}

      {/* Unit Mix Table */}
      <div className="border border-light-border dark:border-harken-gray rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 dark:bg-elevation-2">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-harken-gray dark:text-slate-200">Type</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-harken-gray dark:text-slate-200">Count</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-harken-gray dark:text-slate-200">
                Avg SF
                {perUnitSfUnknown && <span className="font-normal text-amber-600 dark:text-amber-400 ml-1">(auto)</span>}
              </th>
              {!isCompact && (
                <>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-harken-gray dark:text-slate-200">Beds</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-harken-gray dark:text-slate-200">Baths</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-harken-gray-med-lt dark:divide-harken-gray">
            {value.map((unit, idx) => (
              <tr key={unit.unitType} className="bg-surface-1 dark:bg-elevation-1">
                <td className="px-3 py-2 text-xs font-medium text-harken-gray dark:text-slate-200">
                  {UNIT_TYPE_LABELS[unit.unitType]}
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={unit.count || ''}
                    onChange={(e) => handleCountChange(idx, parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-center text-xs border border-light-border dark:border-harken-gray rounded bg-white dark:bg-elevation-2 text-harken-dark dark:text-white"
                  />
                </td>
                <td className="px-3 py-2">
                  {perUnitSfUnknown ? (
                    <span className="block w-16 px-2 py-1 text-center text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 rounded border border-amber-200 dark:border-amber-800">
                      {/* Only show avg SF for rows with actual units - rows with 0 count show dash */}
                      {unit.count > 0 && avgSfPerUnit > 0 ? avgSfPerUnit.toLocaleString() : '—'}
                    </span>
                  ) : (
                    <input
                      type="number"
                      value={unit.avgSF ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleAvgSfChange(idx, val ? parseInt(val) : null);
                      }}
                      className="w-16 px-2 py-1 text-center text-xs border border-light-border dark:border-harken-gray rounded bg-white dark:bg-elevation-2 text-harken-dark dark:text-white"
                    />
                  )}
                </td>
                {!isCompact && (
                  <>
                    <td className="px-3 py-2 text-center text-xs text-harken-gray-med dark:text-slate-400">
                      {unit.bedrooms}
                    </td>
                    <td className="px-3 py-2 text-center text-xs text-harken-gray-med dark:text-slate-400">
                      {unit.bathrooms}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-surface-2 dark:bg-elevation-2">
            <tr>
              <td className="px-3 py-2 text-xs font-bold text-harken-gray dark:text-slate-200">Total</td>
              <td className="px-3 py-2 text-center text-xs font-bold text-harken-blue">
                {unitMixTotal} units
              </td>
              <td className="px-3 py-2 text-center text-xs font-medium text-harken-gray dark:text-slate-200">
                {sfTotal.toLocaleString()} SF
              </td>
              {!isCompact && <td colSpan={2}></td>}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Info note */}
      {!isCompact && (
        <p className="text-xs text-harken-gray-med dark:text-slate-400 flex items-center gap-2">
          <svg className="w-4 h-4 text-harken-blue shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>The Sales Comparison grid will display both $/Unit and $/SF. Your primary calculation method determines which is used for the concluded value.</span>
        </p>
      )}
    </div>
  );
}

