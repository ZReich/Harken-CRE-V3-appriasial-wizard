// Design tokens for the Harken CRE comps redesign
// Following the prototype design system from pricing.html

export const colors = {
  // Primary colors
  primary: '#0da1c7',
  primaryDark: '#0b8aad',
  primaryLight: '#38bfd9',
  
  // Navy colors
  navy: '#263d4a',
  navyDark: '#1c3643',
  navyLight: '#344d5c',
  
  // Accent colors
  accent: '#f59e0b',
  accentDark: '#d97706',
  
  // Status colors
  success: '#10b981',
  successLight: '#34d399',
  error: '#ef4444',
  errorLight: '#f87171',
  warning: '#f59e0b',
  info: '#0da1c7',
  
  // Text colors
  text: '#1c3643',
  textLight: '#687F8B',
  textMuted: '#9ca3af',
  
  // Background colors
  background: '#f5f5f5',
  surface: '#ffffff',
  surfaceDark: '#f9fafb',
  
  // Border colors
  border: '#e5e7eb',
  borderLight: '#f0f0f0',
  borderDark: '#d1d5db',
  
  // Link color (sky blue for hyperlinks)
  link: '#38bfd9', // text-sky-400
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
} as const;

export const borderRadius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

export const shadows = {
  none: 'none',
  sm: '0 2px 4px rgba(0,0,0,0.06)',
  md: '0 4px 12px rgba(0,0,0,0.08)',
  lg: '0 8px 24px rgba(0,0,0,0.12)',
  xl: '0 12px 32px rgba(0,0,0,0.15)',
  inner: 'inset 0 2px 4px rgba(0,0,0,0.06)',
} as const;

export const transitions = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '400ms',
} as const;

export const easings = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export const breakpoints = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1280px',
  wide: '1536px',
} as const;

export const zIndex = {
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
} as const;

export const typography = {
  fontFamily: {
    primary: "'Montserrat', sans-serif",
    system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  },
  fontSize: {
    xs: '12px',
    sm: '13px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '32px',
    '5xl': '42px',
    '6xl': '48px',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
    loose: 1.8,
  },
} as const;

// Property type colors for badges and markers
export const propertyTypeColors = {
  office: '#3b82f6', // blue
  retail: '#8b5cf6', // purple
  industrial: '#f59e0b', // amber
  multifamily: '#ec4899', // pink
  hospitality: '#14b8a6', // teal
  special: '#6366f1', // indigo
  land: '#22c55e', // green
  residential: '#0ea5e9', // sky blue
} as const;

// Status colors for comp status badges
export const statusColors = {
  sold: colors.success,
  leased: colors.primary,
  pending: colors.warning,
  expired: colors.textMuted,
  active: colors.info,
  withdrawn: colors.error,
} as const;

export type ColorKey = keyof typeof colors;
export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
export type ShadowKey = keyof typeof shadows;


















