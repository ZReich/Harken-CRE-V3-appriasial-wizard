/**
 * useThemeColors Hook
 * ===================
 * 
 * Provides theme-aware color values for components that need
 * programmatic access to colors (e.g., Recharts, Canvas, SVG).
 * 
 * ## Usage
 * ```tsx
 * const colors = useThemeColors();
 * <Line stroke={colors.chart.primary} />
 * ```
 * 
 * ## Available Color Groups
 * - `colors.brand` - Official Harken brand colors
 * - `colors.grays` - Official secondary grays
 * - `colors.accent` - Quality, Attention, and Gamified accent sets
 * - `colors.chart` - Chart-specific colors
 * - `colors.status` - Status indicator colors
 * - `colors.surface` - Background/surface colors
 * - `colors.text` - Text colors
 * - `colors.border` - Border colors
 * 
 * The hook automatically returns light or dark colors based on
 * the current theme context.
 */

import { useTheme } from '../context/ThemeContext';
import { lightColors, darkColors, harkenBrand } from '../constants/colors';

// Union type for both light and dark color sets
type ThemeColorsReturn = typeof lightColors | typeof darkColors;

export function useThemeColors(): ThemeColorsReturn {
  const { theme, resolvedTheme } = useTheme();
  
  // Use resolvedTheme which accounts for system preference
  // Falls back to theme if resolvedTheme isn't available
  const effectiveTheme = resolvedTheme || theme;
  
  return effectiveTheme === 'dark' ? darkColors : lightColors;
}

/**
 * Get chart colors based on current theme
 * Includes: primary, secondary, tertiary, positive, negative, income, expense, etc.
 */
export function useChartColors() {
  const colors = useThemeColors();
  return colors.chart;
}

/**
 * Get accent colors based on current theme
 * Includes all accent sets: tealMint, indigo, amberGold, warmSlate, violet
 * Plus legacy aliases: cyan, green, purple, red, amber, rose, pink
 */
export function useAccentColors() {
  const colors = useThemeColors();
  return colors.accent;
}

/**
 * Get status colors based on current theme
 * Includes: success, warning, error, info, ai, locked
 */
export function useStatusColors() {
  const colors = useThemeColors();
  return colors.status;
}

/**
 * Get brand colors based on current theme
 * Includes: dark, blue, gray, white, accent, accentDark, accentLight
 */
export function useBrandColors() {
  const colors = useThemeColors();
  return colors.brand;
}

/**
 * Get official Harken brand colors (light theme, static)
 * Use this for brand-consistent colors that don't change with theme
 */
export function useHarkenBrand() {
  return harkenBrand;
}

/**
 * Get secondary grays based on current theme
 * Includes: med, medLt, light
 */
export function useGrayColors() {
  const colors = useThemeColors();
  return colors.grays;
}

export default useThemeColors;
