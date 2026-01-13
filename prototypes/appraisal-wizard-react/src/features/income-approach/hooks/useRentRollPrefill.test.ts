/**
 * Tests for useRentRollPrefill Hook
 * 
 * Verifies the data flow from Setup's unitMix to Income Approach LineItem[]
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  useRentRollPrefill,
  unitMixToLineItem,
  calculateRentGap,
  getGapStatus,
  UNIT_TYPE_LABELS,
  generatePrefillId,
} from './useRentRollPrefill';
import type { MultiFamilyUnitMix } from '../../../types';

describe('useRentRollPrefill', () => {
  // Test data factory
  const createUnitMix = (overrides: Partial<MultiFamilyUnitMix> = {}): MultiFamilyUnitMix => ({
    unitType: '1br',
    count: 4,
    avgSF: 650,
    sfSource: 'estimated',
    bedrooms: 1,
    bathrooms: 1,
    avgRent: 1100,
    ...overrides,
  });

  describe('hook behavior', () => {
    it('returns empty results when unitMix is undefined', () => {
      const { result } = renderHook(() => useRentRollPrefill({
        unitMix: undefined,
      }));

      expect(result.current.prefillItems).toHaveLength(0);
      expect(result.current.hasPrefillData).toBe(false);
      expect(result.current.totalUnits).toBe(0);
      expect(result.current.totalAnnualRent).toBe(0);
    });

    it('returns empty results when unitMix is empty array', () => {
      const { result } = renderHook(() => useRentRollPrefill({
        unitMix: [],
      }));

      expect(result.current.prefillItems).toHaveLength(0);
      expect(result.current.hasPrefillData).toBe(false);
    });

    it('returns empty results when all unit counts are 0', () => {
      const { result } = renderHook(() => useRentRollPrefill({
        unitMix: [
          createUnitMix({ unitType: 'studio', count: 0 }),
          createUnitMix({ unitType: '1br', count: 0 }),
        ],
      }));

      expect(result.current.prefillItems).toHaveLength(0);
      expect(result.current.hasPrefillData).toBe(false);
      expect(result.current.totalUnits).toBe(0);
    });

    it('generates line items for unit types with count > 0', () => {
      const { result } = renderHook(() => useRentRollPrefill({
        unitMix: [
          createUnitMix({ unitType: 'studio', count: 0 }),
          createUnitMix({ unitType: '1br', count: 4, avgRent: 1100 }),
          createUnitMix({ unitType: '2br', count: 2, avgRent: 1400 }),
        ],
      }));

      expect(result.current.prefillItems).toHaveLength(2);
      expect(result.current.hasPrefillData).toBe(true);
      expect(result.current.totalUnits).toBe(6);
    });

    it('calculates correct total annual rent', () => {
      const { result } = renderHook(() => useRentRollPrefill({
        unitMix: [
          createUnitMix({ unitType: '1br', count: 4, avgRent: 1000 }), // 4 * 1000 * 12 = 48000
          createUnitMix({ unitType: '2br', count: 2, avgRent: 1500 }), // 2 * 1500 * 12 = 36000
        ],
      }));

      expect(result.current.totalAnnualRent).toBe(84000);
    });

    it('calculates correct total SF from unit mix', () => {
      const { result } = renderHook(() => useRentRollPrefill({
        unitMix: [
          createUnitMix({ unitType: '1br', count: 4, avgSF: 650 }), // 4 * 650 = 2600
          createUnitMix({ unitType: '2br', count: 2, avgSF: 900 }), // 2 * 900 = 1800
        ],
      }));

      expect(result.current.totalSf).toBe(4400);
    });

    it('handles unknown SF mode with total building SF', () => {
      const { result } = renderHook(() => useRentRollPrefill({
        unitMix: [
          createUnitMix({ unitType: '1br', count: 4, avgSF: null, sfSource: 'unknown' }),
          createUnitMix({ unitType: '2br', count: 2, avgSF: null, sfSource: 'unknown' }),
        ],
        perUnitSfUnknown: true,
        totalBuildingSf: 6000,
        totalUnitCount: 6,
      }));

      // avgSfPerUnit = 6000 / 6 = 1000
      // 1br: 4 * 1000 = 4000
      // 2br: 2 * 1000 = 2000
      expect(result.current.totalSf).toBe(6000);
      expect(result.current.prefillItems[0].itemSqFt).toBe(4000);
      expect(result.current.prefillItems[1].itemSqFt).toBe(2000);
    });
  });

  describe('unitMixToLineItem', () => {
    it('returns null for unit type with count of 0', () => {
      const result = unitMixToLineItem(createUnitMix({ count: 0 }));
      expect(result).toBeNull();
    });

    it('returns null for unit type with negative count', () => {
      const result = unitMixToLineItem(createUnitMix({ count: -1 }));
      expect(result).toBeNull();
    });

    it('generates correct line item for valid unit mix', () => {
      const result = unitMixToLineItem(createUnitMix({
        unitType: '2br',
        count: 3,
        avgSF: 900,
        avgRent: 1400,
      }));

      expect(result).not.toBeNull();
      expect(result!.name).toBe('2-Bedroom Units');
      expect(result!.amount).toBe(50400); // 3 * 1400 * 12
      expect(result!.itemSqFt).toBe(2700); // 3 * 900
      expect(result!.unitCount).toBe(3);
      expect(result!.unitType).toBe('2br');
      expect(result!.isFromUnitMix).toBe(true);
      expect(result!.vacantUnits).toBe(0);
    });

    it('calculates market rent per SF when both amount and SF are present', () => {
      const result = unitMixToLineItem(createUnitMix({
        count: 2,
        avgSF: 1000,
        avgRent: 2000, // Annual = 2 * 2000 * 12 = 48000
      }));

      // marketRentPerSf = 48000 / 2000 = 24
      expect(result!.marketRentPerSf).toBe(24);
    });

    it('handles missing avgRent gracefully', () => {
      const result = unitMixToLineItem(createUnitMix({
        count: 2,
        avgRent: undefined,
      }));

      expect(result!.amount).toBe(0);
    });

    it('handles null avgSF gracefully', () => {
      const result = unitMixToLineItem(createUnitMix({
        count: 2,
        avgSF: null,
      }));

      expect(result!.itemSqFt).toBeUndefined();
    });

    it('uses avgSfPerUnit when perUnitSfUnknown is true', () => {
      const result = unitMixToLineItem(
        createUnitMix({ count: 4, avgSF: null, sfSource: 'unknown' }),
        { perUnitSfUnknown: true, avgSfPerUnit: 800 }
      );

      expect(result!.itemSqFt).toBe(3200); // 4 * 800
      expect(result!.sfSource).toBe('unknown');
    });
  });

  describe('calculateRentGap', () => {
    it('returns 0 when market rent is 0', () => {
      expect(calculateRentGap(25, 0)).toBe(0);
    });

    it('returns 0 when market rent is negative', () => {
      expect(calculateRentGap(25, -10)).toBe(0);
    });

    it('returns positive percentage when contract > market', () => {
      // Contract: 30, Market: 25 → (30-25)/25 * 100 = 20%
      expect(calculateRentGap(30, 25)).toBe(20);
    });

    it('returns negative percentage when contract < market', () => {
      // Contract: 20, Market: 25 → (20-25)/25 * 100 = -20%
      expect(calculateRentGap(20, 25)).toBe(-20);
    });

    it('returns 0 when contract equals market', () => {
      expect(calculateRentGap(25, 25)).toBe(0);
    });
  });

  describe('getGapStatus', () => {
    it('returns "unknown" when market rent is undefined', () => {
      expect(getGapStatus(25, undefined)).toBe('unknown');
    });

    it('returns "unknown" when market rent is 0', () => {
      expect(getGapStatus(25, 0)).toBe('unknown');
    });

    it('returns "above" when contract >= market', () => {
      expect(getGapStatus(30, 25)).toBe('above');
      expect(getGapStatus(25, 25)).toBe('above');
    });

    it('returns "at_market" when contract is within 5% below market', () => {
      // 5% below 25 = 23.75, anything above that is "at_market"
      expect(getGapStatus(24, 25)).toBe('at_market');
      expect(getGapStatus(23.8, 25)).toBe('at_market');
    });

    it('returns "below" when contract is more than 5% below market', () => {
      // More than 5% below 25 = less than 23.75
      expect(getGapStatus(23, 25)).toBe('below');
      expect(getGapStatus(20, 25)).toBe('below');
    });
  });

  describe('UNIT_TYPE_LABELS', () => {
    it('provides labels for all unit types', () => {
      expect(UNIT_TYPE_LABELS.studio).toBe('Studio');
      expect(UNIT_TYPE_LABELS['1br']).toBe('1-Bedroom');
      expect(UNIT_TYPE_LABELS['2br']).toBe('2-Bedroom');
      expect(UNIT_TYPE_LABELS['3br']).toBe('3-Bedroom');
      expect(UNIT_TYPE_LABELS['4br+']).toBe('4+ Bedroom');
    });
  });

  describe('generatePrefillId', () => {
    it('generates IDs with unit type prefix', () => {
      const id1 = generatePrefillId('1br');
      
      expect(id1).toMatch(/^prefill_1br_\d+$/);
    });

    it('includes correct unit type in ID', () => {
      expect(generatePrefillId('studio')).toMatch(/^prefill_studio_/);
      expect(generatePrefillId('2br')).toMatch(/^prefill_2br_/);
    });
    
    it('generates unique IDs when called with delay', async () => {
      const id1 = generatePrefillId('1br');
      await new Promise(resolve => setTimeout(resolve, 5));
      const id2 = generatePrefillId('1br');
      
      expect(id1).not.toBe(id2);
    });
  });

  describe('integration scenarios', () => {
    it('handles typical 4-plex scenario', () => {
      const { result } = renderHook(() => useRentRollPrefill({
        unitMix: [
          createUnitMix({ unitType: '1br', count: 2, avgSF: 700, avgRent: 950 }),
          createUnitMix({ unitType: '2br', count: 2, avgSF: 950, avgRent: 1200 }),
        ],
      }));

      expect(result.current.totalUnits).toBe(4);
      expect(result.current.prefillItems).toHaveLength(2);
      
      // 1BR: 2 * 950 * 12 = 22800
      // 2BR: 2 * 1200 * 12 = 28800
      expect(result.current.totalAnnualRent).toBe(51600);
      
      // 1BR: 2 * 700 = 1400
      // 2BR: 2 * 950 = 1900
      expect(result.current.totalSf).toBe(3300);
    });

    it('handles 7-plex with unknown SF (Ben example)', () => {
      const { result } = renderHook(() => useRentRollPrefill({
        unitMix: [
          createUnitMix({ unitType: 'studio', count: 1, avgSF: null, sfSource: 'unknown', avgRent: 650 }),
          createUnitMix({ unitType: '1br', count: 4, avgSF: null, sfSource: 'unknown', avgRent: 850 }),
          createUnitMix({ unitType: '2br', count: 2, avgSF: null, sfSource: 'unknown', avgRent: 1050 }),
        ],
        perUnitSfUnknown: true,
        totalBuildingSf: 5600,
        totalUnitCount: 7,
      }));

      expect(result.current.totalUnits).toBe(7);
      expect(result.current.prefillItems).toHaveLength(3);
      
      // avgSfPerUnit = 5600 / 7 = 800
      // Studio: 1 * 800 = 800
      // 1BR: 4 * 800 = 3200
      // 2BR: 2 * 800 = 1600
      expect(result.current.totalSf).toBe(5600);
      
      // Studio: 1 * 650 * 12 = 7800
      // 1BR: 4 * 850 * 12 = 40800
      // 2BR: 2 * 1050 * 12 = 25200
      expect(result.current.totalAnnualRent).toBe(73800);
    });

    it('handles large multi-family (20+ units)', () => {
      const { result } = renderHook(() => useRentRollPrefill({
        unitMix: [
          createUnitMix({ unitType: 'studio', count: 4, avgSF: 450, avgRent: 850 }),
          createUnitMix({ unitType: '1br', count: 12, avgSF: 650, avgRent: 1100 }),
          createUnitMix({ unitType: '2br', count: 6, avgSF: 900, avgRent: 1400 }),
          createUnitMix({ unitType: '3br', count: 2, avgSF: 1200, avgRent: 1800 }),
        ],
      }));

      expect(result.current.totalUnits).toBe(24);
      expect(result.current.prefillItems).toHaveLength(4);
      expect(result.current.hasPrefillData).toBe(true);
    });
  });
});
