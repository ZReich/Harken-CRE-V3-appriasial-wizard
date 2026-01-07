import { describe, it, expect } from 'vitest';
import {
  harkenBrand,
  lightColors,
  darkColors,
  chartColors,
  accentColors,
  statusColors,
  brandColors,
} from './colors';

describe('Harken Brand Colors', () => {
  describe('harkenBrand structure', () => {
    it('should have primary colors', () => {
      expect(harkenBrand.primary.darkBlue).toBe('#1c3643');
      expect(harkenBrand.primary.blueGray).toBe('#687f8b');
      expect(harkenBrand.primary.blue).toBe('#0da1c7');
      expect(harkenBrand.primary.white).toBe('#ffffff');
    });

    it('should have secondary colors', () => {
      expect(harkenBrand.secondary.medGray).toBe('#b1bac0');
      expect(harkenBrand.secondary.medGrayLt).toBe('#d3d7d7');
      expect(harkenBrand.secondary.lightGray).toBe('#f1f3f4');
      expect(harkenBrand.secondary.errorRed).toBe('#c11b49');
    });

    it('should have quality accent colors', () => {
      expect(harkenBrand.quality.tealMint).toBe('#2fc4b2');
      expect(harkenBrand.quality.softIndigo).toBe('#5b6ee1');
    });

    it('should have attention accent colors', () => {
      expect(harkenBrand.attention.amberGold).toBe('#f2b705');
      expect(harkenBrand.attention.warmSlate).toBe('#8c9aa6');
    });

    it('should have gamified accent colors', () => {
      expect(harkenBrand.gamified.electricViolet).toBe('#8b5cf6');
    });
  });

  describe('lightColors structure', () => {
    it('should have brand colors matching official palette', () => {
      expect(lightColors.brand.dark).toBe('#1c3643');
      expect(lightColors.brand.blue).toBe('#0da1c7');
      expect(lightColors.brand.gray).toBe('#687f8b');
    });

    it('should have grays property', () => {
      expect(lightColors.grays.med).toBe('#b1bac0');
      expect(lightColors.grays.medLt).toBe('#d3d7d7');
      expect(lightColors.grays.light).toBe('#f1f3f4');
    });

    it('should have official accent colors', () => {
      expect(lightColors.accent.tealMint).toBe('#2fc4b2');
      expect(lightColors.accent.indigo).toBe('#5b6ee1');
      expect(lightColors.accent.amberGold).toBe('#f2b705');
      expect(lightColors.accent.warmSlate).toBe('#8c9aa6');
      expect(lightColors.accent.violet).toBe('#8b5cf6');
    });

    it('should have chart colors using official brand', () => {
      expect(lightColors.chart.primary).toBe('#0da1c7'); // Harken Blue
      expect(lightColors.chart.secondary).toBe('#2fc4b2'); // Teal Mint
      expect(lightColors.chart.positive).toBe('#2fc4b2'); // Teal Mint
      expect(lightColors.chart.negative).toBe('#c11b49'); // Harken Error
    });

    it('should have status colors using official brand', () => {
      expect(lightColors.status.success).toBe('#2fc4b2'); // Teal Mint
      expect(lightColors.status.warning).toBe('#f2b705'); // Amber Gold
      expect(lightColors.status.error).toBe('#c11b49'); // Harken Error
      expect(lightColors.status.info).toBe('#0da1c7'); // Harken Blue
      expect(lightColors.status.ai).toBe('#5b6ee1'); // Soft Indigo
      expect(lightColors.status.locked).toBe('#8c9aa6'); // Warm Slate
    });
  });

  describe('darkColors structure', () => {
    it('should have luminous brand colors for dark mode', () => {
      expect(darkColors.brand.blue).toBe('#00d4ff');
      expect(darkColors.brand.gray).toBe('#94a3b8');
    });

    it('should have luminous accent colors', () => {
      expect(darkColors.accent.tealMint).toBe('#4fd9c7');
      expect(darkColors.accent.indigo).toBe('#818cf8');
      expect(darkColors.accent.amberGold).toBe('#fcd34d');
      expect(darkColors.accent.warmSlate).toBe('#a8b5c4');
      expect(darkColors.accent.violet).toBe('#a78bfa');
    });

    it('should have luminous chart colors', () => {
      expect(darkColors.chart.primary).toBe('#00d4ff');
      expect(darkColors.chart.secondary).toBe('#4fd9c7');
      expect(darkColors.chart.positive).toBe('#4fd9c7');
    });

    it('should have luminous status colors', () => {
      expect(darkColors.status.success).toBe('#4fd9c7');
      expect(darkColors.status.warning).toBe('#fcd34d');
      expect(darkColors.status.error).toBe('#f87171');
      expect(darkColors.status.ai).toBe('#818cf8');
    });
  });

  describe('Convenience exports', () => {
    it('should export chartColors from lightColors', () => {
      expect(chartColors).toBe(lightColors.chart);
    });

    it('should export accentColors from lightColors', () => {
      expect(accentColors).toBe(lightColors.accent);
    });

    it('should export statusColors from lightColors', () => {
      expect(statusColors).toBe(lightColors.status);
    });

    it('should export brandColors as harkenBrand', () => {
      expect(brandColors).toBe(harkenBrand);
    });
  });

  describe('Color consistency', () => {
    it('should use consistent success color across chart and status', () => {
      expect(lightColors.chart.positive).toBe(lightColors.status.success);
      expect(darkColors.chart.positive).toBe(darkColors.status.success);
    });

    it('should use consistent error color across chart and status', () => {
      expect(lightColors.chart.negative).toBe(lightColors.status.error);
    });

    it('should map legacy green to tealMint', () => {
      expect(lightColors.accent.green).toBe(lightColors.accent.tealMint);
    });

    it('should map legacy amber to amberGold', () => {
      expect(lightColors.accent.amber).toBe(lightColors.accent.amberGold);
    });

    it('should map legacy purple to violet', () => {
      expect(lightColors.accent.purple).toBe(lightColors.accent.violet);
    });
  });
});
