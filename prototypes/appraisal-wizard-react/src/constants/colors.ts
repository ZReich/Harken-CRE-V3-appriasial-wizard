/**
 * Harken Official Brand Color Constants
 */

// Official Harken Brand Colors
export const harkenBrand = {
  primary: {
    darkBlue: '#1c3643',
    blueGray: '#687f8b',
    blue: '#0da1c7',
    white: '#ffffff',
  },
  secondary: {
    medGray: '#b1bac0',
    medGrayLt: '#d3d7d7',
    lightGray: '#f1f3f4',
    errorRed: '#c11b49',
  },
  quality: {
    tealMint: '#2fc4b2',
    softIndigo: '#5b6ee1',
  },
  attention: {
    amberGold: '#f2b705',
    warmSlate: '#8c9aa6',
  },
  gamified: {
    electricViolet: '#8b5cf6',
  },
} as const;

// Light Theme Colors
export const lightColors = {
  brand: {
    dark: '#1c3643',
    blue: '#0da1c7',
    gray: '#687f8b',
    white: '#ffffff',
    accent: '#4db8d1',
    accentDark: '#0da1c7',
    accentLight: '#7fcce0',
  },
  grays: {
    med: '#b1bac0',
    medLt: '#d3d7d7',
    light: '#f1f3f4',
  },
  accent: {
    tealMint: '#2fc4b2',
    indigo: '#5b6ee1',
    amberGold: '#f2b705',
    warmSlate: '#8c9aa6',
    violet: '#8b5cf6',
    cyan: '#0da1c7',
    cyanHover: '#0b8fb0',
    cyanActive: '#0890a8',
    cyanLight: '#e0f7fc',
    green: '#2fc4b2',
    greenHover: '#28b3a2',
    greenLight: '#dcfce7',
    purple: '#8b5cf6',
    purpleHover: '#7c4fdf',
    purpleLight: '#f3e8ff',
    red: '#c11b49',
    redHover: '#a91840',
    redLight: '#fef2f2',
    amber: '#f2b705',
    amberHover: '#daa504',
    amberLight: '#fef3c7',
    rose: '#f43f5e',
    roseHover: '#e11d48',
    roseLight: '#ffe4e6',
    pink: '#ec4899',
    pinkHover: '#db2777',
    pinkLight: '#fce7f3',
  },
  chart: {
    primary: '#0da1c7',
    secondary: '#2fc4b2',
    tertiary: '#8b5cf6',
    quaternary: '#f2b705',
    positive: '#2fc4b2',
    negative: '#c11b49',
    neutral: '#8c9aa6',
    income: '#0da1c7',
    expense: '#f2b705',
    loss: '#c11b49',
    net: '#2fc4b2',
    grid: '#e2e8f0',
    axis: '#687f8b',
  },
  status: {
    success: '#2fc4b2',
    warning: '#f2b705',
    error: '#c11b49',
    info: '#0da1c7',
    ai: '#5b6ee1',
    locked: '#8c9aa6',
  },
  surface: {
    primary: '#f9fafb',
    secondary: '#ffffff',
    elevated: '#ffffff',
    card: '#ffffff',
    hover: '#f3f4f6',
  },
  text: {
    primary: '#1c3643',
    secondary: '#687f8b',
    muted: '#b1bac0',
    inverse: '#ffffff',
  },
  border: {
    subtle: '#e5e7eb',
    default: '#d3d7d7',
    accent: '#0da1c7',
  },
  gradients: {
    action: {
      from: '#0da1c7',
      to: '#0890a8',
      hoverFrom: '#0b8fb0',
      hoverTo: '#0780a0',
    },
    light: {
      from: '#4db8d1',
      to: '#7fcce0',
      hoverFrom: '#3da8c1',
      hoverTo: '#6fc0d4',
    },
    icon: {
      from: '#0da1c7',
      to: '#4db8d1',
    },
    brand: {
      from: '#0da1c7',
      to: '#1c3643',
    },
  },
} as const;

// Dark Theme Colors
export const darkColors = {
  brand: {
    dark: '#0d1a22',
    blue: '#00d4ff',
    gray: '#94a3b8',
    white: '#ffffff',
    accent: '#00d4ff',
    accentDark: '#0da1c7',
    accentLight: '#33ddff',
  },
  grays: {
    med: '#64748b',
    medLt: '#475569',
    light: '#1e293b',
  },
  accent: {
    tealMint: '#4fd9c7',
    indigo: '#818cf8',
    amberGold: '#fcd34d',
    warmSlate: '#a8b5c4',
    violet: '#a78bfa',
    cyan: '#00d4ff',
    cyanHover: '#33ddff',
    cyanActive: '#66e5ff',
    cyanLight: '#0c4a5e',
    green: '#4fd9c7',
    greenHover: '#5fe5d3',
    greenLight: '#14532d',
    purple: '#a78bfa',
    purpleHover: '#c4b5fd',
    purpleLight: '#3b0764',
    red: '#f87171',
    redHover: '#fca5a5',
    redLight: '#450a0a',
    amber: '#fcd34d',
    amberHover: '#fde68a',
    amberLight: '#451a03',
    rose: '#fb7185',
    roseHover: '#fda4af',
    roseLight: '#4c0519',
    pink: '#f472b6',
    pinkHover: '#f9a8d4',
    pinkLight: '#500724',
  },
  chart: {
    primary: '#00d4ff',
    secondary: '#4fd9c7',
    tertiary: '#a78bfa',
    quaternary: '#fcd34d',
    positive: '#4fd9c7',
    negative: '#f87171',
    neutral: '#a8b5c4',
    income: '#00d4ff',
    expense: '#fcd34d',
    loss: '#f87171',
    net: '#4fd9c7',
    grid: '#334155',
    axis: '#94a3b8',
  },
  status: {
    success: '#4fd9c7',
    warning: '#fcd34d',
    error: '#f87171',
    info: '#00d4ff',
    ai: '#818cf8',
    locked: '#a8b5c4',
  },
  surface: {
    primary: '#0f172a',
    secondary: '#1e293b',
    elevated: '#334155',
    card: '#1e293b',
    hover: '#334155',
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    muted: '#64748b',
    inverse: '#0f172a',
  },
  border: {
    subtle: '#334155',
    default: '#475569',
    accent: '#00d4ff',
  },
  gradients: {
    action: {
      from: '#00d4ff',
      to: '#0da1c7',
      hoverFrom: '#22d6f8',
      hoverTo: '#0fb8d4',
    },
    light: {
      from: '#00d4ff',
      to: '#33ddff',
      hoverFrom: '#0dc7e8',
      hoverTo: '#4de3ff',
    },
    icon: {
      from: '#00d4ff',
      to: '#0da1c7',
    },
    brand: {
      from: '#00d4ff',
      to: '#0d1a22',
    },
  },
} as const;

// Convenience Exports
export const chartColors = lightColors.chart;
export const accentColors = lightColors.accent;
export const statusColors = lightColors.status;
export const brandColors = harkenBrand;

// Type Definitions
export type ThemeColors = typeof lightColors;
export type ChartColors = typeof lightColors.chart;
export type AccentColors = typeof lightColors.accent;
export type StatusColors = typeof lightColors.status;
export type HarkenBrand = typeof harkenBrand;
