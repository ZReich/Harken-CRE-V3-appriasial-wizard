import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useThemeColors,
  useChartColors,
  useAccentColors,
  useStatusColors,
  useBrandColors,
  useHarkenBrand,
  useGrayColors,
} from './useThemeColors';
import { lightColors, darkColors, harkenBrand } from '../constants/colors';

// Mock ThemeContext with light theme by default
const mockUseTheme = vi.fn(() => ({
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: vi.fn(),
}));

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => mockUseTheme(),
}));

describe('useThemeColors hooks', () => {
  describe('useThemeColors', () => {
    it('should return lightColors for light theme', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        resolvedTheme: 'light',
        setTheme: vi.fn(),
      });
      const { result } = renderHook(() => useThemeColors());
      expect(result.current).toBe(lightColors);
    });

    it('should return darkColors for dark theme', () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        resolvedTheme: 'dark',
        setTheme: vi.fn(),
      });
      const { result } = renderHook(() => useThemeColors());
      expect(result.current).toBe(darkColors);
    });
  });

  describe('useChartColors', () => {
    it('should return chart colors from theme', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        resolvedTheme: 'light',
        setTheme: vi.fn(),
      });
      const { result } = renderHook(() => useChartColors());
      expect(result.current).toBe(lightColors.chart);
    });

    it('should have official Harken brand colors', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        resolvedTheme: 'light',
        setTheme: vi.fn(),
      });
      const { result } = renderHook(() => useChartColors());
      expect(result.current.primary).toBe('#0da1c7'); // Harken Blue
      expect(result.current.secondary).toBe('#2fc4b2'); // Teal Mint
      expect(result.current.positive).toBe('#2fc4b2'); // Teal Mint
      expect(result.current.negative).toBe('#c11b49'); // Harken Error
    });
  });

  describe('useAccentColors', () => {
    it('should return accent colors from theme', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        resolvedTheme: 'light',
        setTheme: vi.fn(),
      });
      const { result } = renderHook(() => useAccentColors());
      expect(result.current).toBe(lightColors.accent);
    });

    it('should have official Harken accent sets', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        resolvedTheme: 'light',
        setTheme: vi.fn(),
      });
      const { result } = renderHook(() => useAccentColors());
      expect(result.current.tealMint).toBe('#2fc4b2');
      expect(result.current.indigo).toBe('#5b6ee1');
      expect(result.current.amberGold).toBe('#f2b705');
      expect(result.current.warmSlate).toBe('#8c9aa6');
      expect(result.current.violet).toBe('#8b5cf6');
    });
  });

  describe('useStatusColors', () => {
    it('should return status colors from theme', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        resolvedTheme: 'light',
        setTheme: vi.fn(),
      });
      const { result } = renderHook(() => useStatusColors());
      expect(result.current).toBe(lightColors.status);
    });

    it('should have all status types including new ones', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        resolvedTheme: 'light',
        setTheme: vi.fn(),
      });
      const { result } = renderHook(() => useStatusColors());
      expect(result.current.success).toBe('#2fc4b2');
      expect(result.current.warning).toBe('#f2b705');
      expect(result.current.error).toBe('#c11b49');
      expect(result.current.info).toBe('#0da1c7');
      expect(result.current.ai).toBe('#5b6ee1');
      expect(result.current.locked).toBe('#8c9aa6');
    });
  });

  describe('useBrandColors', () => {
    it('should return brand colors from theme', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        resolvedTheme: 'light',
        setTheme: vi.fn(),
      });
      const { result } = renderHook(() => useBrandColors());
      expect(result.current).toBe(lightColors.brand);
    });

    it('should have official Harken primary colors', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        resolvedTheme: 'light',
        setTheme: vi.fn(),
      });
      const { result } = renderHook(() => useBrandColors());
      expect(result.current.dark).toBe('#1c3643');
      expect(result.current.blue).toBe('#0da1c7');
      expect(result.current.gray).toBe('#687f8b');
    });
  });

  describe('useHarkenBrand', () => {
    it('should return static harkenBrand object', () => {
      const { result } = renderHook(() => useHarkenBrand());
      expect(result.current).toBe(harkenBrand);
    });

    it('should have complete brand structure', () => {
      const { result } = renderHook(() => useHarkenBrand());
      expect(result.current.primary).toBeDefined();
      expect(result.current.secondary).toBeDefined();
      expect(result.current.quality).toBeDefined();
      expect(result.current.attention).toBeDefined();
      expect(result.current.gamified).toBeDefined();
    });
  });

  describe('useGrayColors', () => {
    it('should return grays from theme', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        resolvedTheme: 'light',
        setTheme: vi.fn(),
      });
      const { result } = renderHook(() => useGrayColors());
      expect(result.current).toBe(lightColors.grays);
    });

    it('should have official Harken secondary grays', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        resolvedTheme: 'light',
        setTheme: vi.fn(),
      });
      const { result } = renderHook(() => useGrayColors());
      expect(result.current.med).toBe('#b1bac0');
      expect(result.current.medLt).toBe('#d3d7d7');
      expect(result.current.light).toBe('#f1f3f4');
    });
  });
});
