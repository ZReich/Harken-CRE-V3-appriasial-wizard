/**
 * useRentRollPrefill Hook
 * 
 * Generates LineItem[] entries from Setup's unitMix configuration.
 * This enables data flow from Setup page to Income Approach without
 * requiring manual re-entry of unit information.
 * 
 * Features:
 * - Converts unitMix array to grouped LineItem entries
 * - Handles unknown SF scenarios (uses total building SF)
 * - Skips unit types with count of 0
 * - Calculates annual rent from monthly avgRent
 */

import { useMemo } from 'react';
import type { MultiFamilyUnitMix } from '../../../types';
import type { LineItem } from '../types';

/** Display labels for unit types */
export const UNIT_TYPE_LABELS: Record<MultiFamilyUnitMix['unitType'], string> = {
  studio: 'Studio',
  '1br': '1-Bedroom',
  '2br': '2-Bedroom',
  '3br': '3-Bedroom',
  '4br+': '4+ Bedroom',
};

export interface UseRentRollPrefillOptions {
  /** Unit mix configuration from Setup */
  unitMix: MultiFamilyUnitMix[] | undefined;
  /** Whether per-unit SF is unknown (uses avgSfPerUnit instead) */
  perUnitSfUnknown?: boolean;
  /** Total building SF (used when perUnitSfUnknown is true) */
  totalBuildingSf?: number;
  /** Total unit count (used to calculate avgSfPerUnit when SF is unknown) */
  totalUnitCount?: number;
}

export interface UseRentRollPrefillResult {
  /** Generated line items from unit mix */
  prefillItems: LineItem[];
  /** Whether there's valid unit mix data to prefill */
  hasPrefillData: boolean;
  /** Total unit count from the unit mix */
  totalUnits: number;
  /** Total annual rent from the unit mix */
  totalAnnualRent: number;
  /** Total SF from the unit mix */
  totalSf: number;
}

/**
 * Generates a unique ID for a prefilled line item
 */
export function generatePrefillId(unitType: MultiFamilyUnitMix['unitType']): string {
  return `prefill_${unitType}_${Date.now()}`;
}

/**
 * Converts a single unit mix entry to a LineItem
 */
export function unitMixToLineItem(
  unit: MultiFamilyUnitMix,
  options: {
    perUnitSfUnknown?: boolean;
    avgSfPerUnit?: number;
  } = {}
): LineItem | null {
  // Skip if no units of this type
  if (unit.count <= 0) {
    return null;
  }

  // Calculate SF: use per-unit SF if known, otherwise use average from total
  let totalSfForGroup = 0;
  if (options.perUnitSfUnknown && options.avgSfPerUnit) {
    totalSfForGroup = unit.count * options.avgSfPerUnit;
  } else if (unit.avgSF && unit.avgSF > 0) {
    totalSfForGroup = unit.count * unit.avgSF;
  }

  // Calculate annual rent: monthly avgRent × 12 × count
  const annualRent = (unit.avgRent || 0) * 12 * unit.count;

  // Generate name with unit count
  const unitLabel = UNIT_TYPE_LABELS[unit.unitType] || unit.unitType;
  const name = `${unitLabel} Units`;

  return {
    id: generatePrefillId(unit.unitType),
    name,
    amount: annualRent,
    itemSqFt: totalSfForGroup > 0 ? totalSfForGroup : undefined,
    sfSource: options.perUnitSfUnknown ? 'unknown' : unit.sfSource,
    unitCount: unit.count,
    vacantUnits: 0, // Default to fully occupied; user can adjust
    unitType: unit.unitType,
    isFromUnitMix: true,
    // Calculate market rent per SF if we have SF data
    marketRentPerSf: totalSfForGroup > 0 && annualRent > 0 
      ? annualRent / totalSfForGroup 
      : undefined,
  };
}

/**
 * Hook to generate LineItem[] from Setup's unitMix configuration
 */
export function useRentRollPrefill(options: UseRentRollPrefillOptions): UseRentRollPrefillResult {
  const { unitMix, perUnitSfUnknown, totalBuildingSf, totalUnitCount } = options;

  return useMemo(() => {
    // No unit mix data available
    if (!unitMix || unitMix.length === 0) {
      return {
        prefillItems: [],
        hasPrefillData: false,
        totalUnits: 0,
        totalAnnualRent: 0,
        totalSf: 0,
      };
    }

    // Calculate total units with count > 0
    const totalUnits = unitMix.reduce((sum, u) => sum + u.count, 0);

    // No units configured
    if (totalUnits <= 0) {
      return {
        prefillItems: [],
        hasPrefillData: false,
        totalUnits: 0,
        totalAnnualRent: 0,
        totalSf: 0,
      };
    }

    // Calculate average SF per unit when in unknown SF mode
    const avgSfPerUnit = perUnitSfUnknown && totalBuildingSf && totalUnits > 0
      ? Math.round(totalBuildingSf / totalUnits)
      : undefined;

    // Convert each unit type to a LineItem
    const prefillItems: LineItem[] = [];
    let totalAnnualRent = 0;
    let totalSf = 0;

    for (const unit of unitMix) {
      const lineItem = unitMixToLineItem(unit, {
        perUnitSfUnknown,
        avgSfPerUnit,
      });

      if (lineItem) {
        prefillItems.push(lineItem);
        totalAnnualRent += lineItem.amount;
        totalSf += lineItem.itemSqFt || 0;
      }
    }

    return {
      prefillItems,
      hasPrefillData: prefillItems.length > 0,
      totalUnits,
      totalAnnualRent,
      totalSf,
    };
  }, [unitMix, perUnitSfUnknown, totalBuildingSf, totalUnitCount]);
}

/**
 * Calculates the rent gap between contract and market rent
 * @returns Gap percentage (positive = above market, negative = below market)
 */
export function calculateRentGap(
  contractRentPerSf: number,
  marketRentPerSf: number
): number {
  if (marketRentPerSf <= 0) return 0;
  return ((contractRentPerSf - marketRentPerSf) / marketRentPerSf) * 100;
}

/**
 * Determines the gap status for color coding
 * - 'above': Contract rent >= market rent (green)
 * - 'below': Contract rent < market rent by >5% (amber)
 * - 'at_market': Contract rent within 5% of market (gray)
 * - 'unknown': No market rent data (gray)
 */
export type GapStatus = 'above' | 'below' | 'at_market' | 'unknown';

export function getGapStatus(
  contractRentPerSf: number,
  marketRentPerSf: number | undefined
): GapStatus {
  if (!marketRentPerSf || marketRentPerSf <= 0) {
    return 'unknown';
  }

  const gap = calculateRentGap(contractRentPerSf, marketRentPerSf);

  if (gap >= 0) {
    return 'above';
  } else if (gap < -5) {
    return 'below';
  } else {
    return 'at_market';
  }
}

export default useRentRollPrefill;
