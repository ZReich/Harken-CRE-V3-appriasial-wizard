/**
 * Sales Comparison Adjustment Calculator Tests
 * 
 * Unit tests for the pure adjustment calculation functions
 */

import { describe, it, expect } from 'vitest';
import {
  calculateNetAdjustment,
  calculateBasePriceSf,
  calculateAdjustedPriceSf,
  calculateIndicatedValue,
  calculateConcludedValue,
  calculateConcludedValuePsf,
  getAdjustmentDirection,
  formatAdjustmentDisplay,
} from './adjustmentCalculator';
import type { PropertyValues, ComparisonValue } from '../types';

describe('Adjustment Calculator', () => {
  
  describe('calculateNetAdjustment', () => {
    it('should return 0 for empty property values', () => {
      const result = calculateNetAdjustment({});
      expect(result).toBe(0);
    });

    it('should sum all adjustment values', () => {
      const propValues: Record<string, ComparisonValue> = {
        location: { value: 'Good', adjustment: 0.05 },
        condition: { value: 'Average', adjustment: -0.10 },
        size: { value: 10000, adjustment: 0.025 },
      };
      
      const result = calculateNetAdjustment(propValues);
      expect(result).toBeCloseTo(-0.025, 5);
    });

    it('should exclude price and price_sf from adjustments', () => {
      const propValues: Record<string, ComparisonValue> = {
        location: { value: 'Good', adjustment: 0.05 },
        price: { value: 500000, adjustment: 0.10 }, // Should be excluded
        price_sf: { value: 50, adjustment: 0.05 },  // Should be excluded
      };
      
      const result = calculateNetAdjustment(propValues);
      expect(result).toBe(0.05);
    });

    it('should ignore undefined adjustments', () => {
      const propValues: Record<string, ComparisonValue> = {
        location: { value: 'Good', adjustment: 0.05 },
        condition: { value: 'Average' }, // No adjustment
        size: { value: 10000, adjustment: undefined },
      };
      
      const result = calculateNetAdjustment(propValues);
      expect(result).toBe(0.05);
    });
  });

  describe('calculateBasePriceSf', () => {
    describe('standard mode', () => {
      it('should return price_sf value directly', () => {
        const propValues: Record<string, ComparisonValue> = {
          price_sf: { value: 125 },
        };
        
        const result = calculateBasePriceSf(propValues, 'standard');
        expect(result).toBe(125);
      });

      it('should return 0 if price_sf is not a number', () => {
        const propValues: Record<string, ComparisonValue> = {
          price_sf: { value: 'N/A' },
        };
        
        const result = calculateBasePriceSf(propValues, 'standard');
        expect(result).toBe(0);
      });
    });

    describe('residual mode', () => {
      it('should calculate (price - land) / bldg_sf', () => {
        const propValues: Record<string, ComparisonValue> = {
          price: { value: 1000000 },
          land_value: { value: 200000 },
          bldg_size_fact: { value: 10000 },
        };
        
        const result = calculateBasePriceSf(propValues, 'residual');
        expect(result).toBe(80); // (1M - 200K) / 10K = 80
      });

      it('should return 0 if building SF is 0', () => {
        const propValues: Record<string, ComparisonValue> = {
          price: { value: 1000000 },
          land_value: { value: 200000 },
          bldg_size_fact: { value: 0 },
        };
        
        const result = calculateBasePriceSf(propValues, 'residual');
        expect(result).toBe(0);
      });

      it('should return 0 if any required value is missing', () => {
        const propValues: Record<string, ComparisonValue> = {
          price: { value: 1000000 },
          // Missing land_value and bldg_size_fact
        };
        
        const result = calculateBasePriceSf(propValues, 'residual');
        expect(result).toBe(0);
      });
    });
  });

  describe('calculateAdjustedPriceSf', () => {
    it('should apply positive adjustment', () => {
      const result = calculateAdjustedPriceSf(100, 0.10);
      expect(result).toBeCloseTo(110, 5);
    });

    it('should apply negative adjustment', () => {
      const result = calculateAdjustedPriceSf(100, -0.10);
      expect(result).toBeCloseTo(90, 5);
    });

    it('should return base price for zero adjustment', () => {
      const result = calculateAdjustedPriceSf(100, 0);
      expect(result).toBeCloseTo(100, 5);
    });
  });

  describe('calculateIndicatedValue', () => {
    it('should calculate value in standard mode', () => {
      const propValues: Record<string, ComparisonValue> = {
        price_sf: { value: 100 },
        location: { value: 'Good', adjustment: 0.10 },
      };
      
      const result = calculateIndicatedValue(propValues, 10000, 'standard');
      // 100 * 1.10 = 110 per SF, * 10000 SF = 1,100,000
      expect(result).toBe(1100000);
    });

    it('should calculate value in residual mode with land add-back', () => {
      const propValues: Record<string, ComparisonValue> = {
        price: { value: 500000 },
        land_value: { value: 100000 },
        bldg_size_fact: { value: 5000 },
        // Net adjustment: 0% (none specified)
      };
      
      // Base price SF: (500K - 100K) / 5K = 80
      // Adjusted: 80 * 1.0 = 80
      // Building value: 10000 * 80 = 800,000
      // Plus subject land: 800,000 + 150,000 = 950,000
      const result = calculateIndicatedValue(propValues, 10000, 'residual', 150000);
      expect(result).toBe(950000);
    });

    it('should return null if base price SF is 0', () => {
      const propValues: Record<string, ComparisonValue> = {
        price_sf: { value: 0 },
      };
      
      const result = calculateIndicatedValue(propValues, 10000, 'standard');
      expect(result).toBeNull();
    });
  });

  describe('calculateConcludedValue', () => {
    it('should average indicated values from all comps', () => {
      const properties = [
        { id: 'subject', type: 'subject' as const },
        { id: 'comp1', type: 'comp' as const },
        { id: 'comp2', type: 'comp' as const },
      ];
      
      const values: PropertyValues = {
        subject: {
          bldg_size_fact: { value: 10000 },
        },
        comp1: {
          price_sf: { value: 100 },
          // No adjustments = 100 * 10000 = 1,000,000
        },
        comp2: {
          price_sf: { value: 120 },
          // No adjustments = 120 * 10000 = 1,200,000
        },
      };
      
      const result = calculateConcludedValue(values, properties, 'standard');
      // Average: (1,000,000 + 1,200,000) / 2 = 1,100,000
      expect(result).toBe(1100000);
    });

    it('should return null if no subject building size', () => {
      const properties = [
        { id: 'subject', type: 'subject' as const },
        { id: 'comp1', type: 'comp' as const },
      ];
      
      const values: PropertyValues = {
        subject: {
          // No bldg_size_fact
        },
        comp1: {
          price_sf: { value: 100 },
        },
      };
      
      const result = calculateConcludedValue(values, properties, 'standard');
      expect(result).toBeNull();
    });

    it('should return null if no valid comp values', () => {
      const properties = [
        { id: 'subject', type: 'subject' as const },
        { id: 'comp1', type: 'comp' as const },
      ];
      
      const values: PropertyValues = {
        subject: {
          bldg_size_fact: { value: 10000 },
        },
        comp1: {
          price_sf: { value: 0 }, // Zero = invalid
        },
      };
      
      const result = calculateConcludedValue(values, properties, 'standard');
      expect(result).toBeNull();
    });
  });

  describe('calculateConcludedValuePsf', () => {
    it('should calculate value per SF', () => {
      const result = calculateConcludedValuePsf(1000000, 10000);
      expect(result).toBe(100);
    });

    it('should return null if concluded value is null', () => {
      const result = calculateConcludedValuePsf(null, 10000);
      expect(result).toBeNull();
    });

    it('should return null if building SF is 0', () => {
      const result = calculateConcludedValuePsf(1000000, 0);
      expect(result).toBeNull();
    });
  });

  describe('getAdjustmentDirection', () => {
    it('should return inferior for positive adjustment', () => {
      expect(getAdjustmentDirection(0.10)).toBe('inferior');
    });

    it('should return superior for negative adjustment', () => {
      expect(getAdjustmentDirection(-0.10)).toBe('superior');
    });

    it('should return similar for zero adjustment', () => {
      expect(getAdjustmentDirection(0)).toBe('similar');
    });

    it('should return similar for undefined adjustment', () => {
      expect(getAdjustmentDirection(undefined)).toBe('similar');
    });
  });

  describe('formatAdjustmentDisplay', () => {
    it('should format positive adjustment', () => {
      expect(formatAdjustmentDisplay(0.10)).toBe('+10.0%');
    });

    it('should format negative adjustment', () => {
      expect(formatAdjustmentDisplay(-0.05)).toBe('-5.0%');
    });

    it('should return SIM for zero adjustment', () => {
      expect(formatAdjustmentDisplay(0)).toBe('SIM');
    });

    it('should return SIM for undefined adjustment', () => {
      expect(formatAdjustmentDisplay(undefined)).toBe('SIM');
    });

    it('should handle fractional percentages', () => {
      expect(formatAdjustmentDisplay(0.025)).toBe('+2.5%');
    });
  });
});
