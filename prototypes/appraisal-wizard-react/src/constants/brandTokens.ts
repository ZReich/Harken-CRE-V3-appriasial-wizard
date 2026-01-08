/**
 * Harken Brand Semantic Tokens
 * ============================
 * 
 * This file maps business concepts and UI elements to official Harken brand colors.
 * Use these semantic tokens for consistent color usage across the application.
 * 
 * ## Usage Guidelines
 * 
 * ### Headers
 * Use `harken-blue` (#0da1c7) for headers and section titles
 * 
 * ### Body Text
 * Use `harken-dark` (#1c3643) for primary body text
 * 
 * ### Subtitles
 * Use `harken-gray` (#687f8b) for secondary/subtitle text
 * 
 * ### Links
 * Use `harken-blue` (#0da1c7) for interactive links
 * 
 * ### Errors
 * Use `harken-error` (#c11b49) for error states
 * 
 * ## Accent Usage
 * 
 * ### Quality Indicators (Set 1)
 * - Quality Badges: `accent-teal-mint`
 * - Score Rings: `accent-teal-mint`
 * - Positive Indicators: `accent-teal-mint`
 * - AI-Assisted Labels: `accent-indigo`
 * - Insight Icons: `accent-indigo`
 * - "Enhanced" Features: `accent-indigo`
 * 
 * ### Attention Indicators (Set 2)
 * - Pending Review: `accent-amber-gold`
 * - Flagged Comps: `accent-amber-gold`
 * - Incomplete Data Warnings: `accent-amber-gold`
 * - Locked/Unavailable States: `accent-warm-slate`
 * - Secondary Badges: `accent-warm-slate`
 * - Achievement Placeholders: `accent-warm-slate`
 * 
 * ### Gamification (Set 3)
 * - Rare Achievements: `accent-violet`
 * - Power User Indicators: `accent-violet`
 * - Special Recognition: `accent-violet`
 */

// ============================================
// SEMANTIC TOKEN MAPPINGS
// ============================================

/**
 * Maps UI element types to their Tailwind color classes
 * Use these for consistent styling across the application
 */
export const uiTokens = {
  // Typography
  // Note: Dark mode uses Tailwind slate classes for proper contrast
  // See index.css "DARK MODE TEXT COLOR STRATEGY" for rationale
  header: 'text-harken-blue dark:text-cyan-400',
  headerAlt: 'text-harken-dark dark:text-white',
  bodyText: 'text-harken-dark dark:text-slate-100',
  subtitle: 'text-harken-gray dark:text-slate-300',
  muted: 'text-harken-gray-med dark:text-slate-400',
  link: 'text-harken-blue hover:text-harken-blue/80 dark:text-cyan-400',
  
  // Interactive Elements
  button: {
    primary: 'bg-harken-blue hover:bg-harken-blue/90 text-white',
    secondary: 'bg-harken-gray-light hover:bg-harken-gray-med-lt text-harken-dark dark:bg-slate-800 dark:text-white',
    danger: 'bg-harken-error hover:bg-harken-error/90 text-white',
  },
  
  // Input States
  input: {
    default: 'border-light-border focus:border-harken-blue focus:ring-harken-blue',
    error: 'border-harken-error focus:border-harken-error focus:ring-harken-error',
  },
} as const;

/**
 * Maps feature concepts to their semantic colors
 */
export const featureTokens = {
  // Quality Indicators
  qualityBadge: 'bg-accent-teal-mint text-white',
  scoreRing: 'stroke-accent-teal-mint',
  positiveIndicator: 'text-accent-teal-mint',
  
  // AI & Insight Features
  aiAssisted: 'bg-accent-indigo text-white',
  aiLabel: 'text-accent-indigo',
  insightIcon: 'text-accent-indigo',
  enhancedFeature: 'border-accent-indigo bg-accent-indigo-light',
  
  // Attention & Warnings
  pendingReview: 'bg-accent-amber-gold text-white',
  flaggedComp: 'border-accent-amber-gold bg-accent-amber-gold-light',
  dataWarning: 'text-accent-amber-gold',
  
  // Locked & Unavailable
  lockedState: 'bg-accent-warm-slate text-white',
  unavailable: 'text-accent-warm-slate opacity-60',
  placeholder: 'bg-accent-warm-slate-light border-accent-warm-slate',
  
  // Achievements & Gamification
  achievement: 'bg-accent-violet text-white',
  rareAchievement: 'bg-gradient-to-r from-accent-violet to-accent-indigo text-white',
  powerUser: 'text-accent-violet',
  specialRecognition: 'border-accent-violet bg-accent-violet-light',
} as const;

/**
 * Maps status types to their semantic colors
 */
export const statusTokens = {
  success: {
    bg: 'bg-accent-teal-mint',
    text: 'text-accent-teal-mint',
    border: 'border-accent-teal-mint',
    light: 'bg-accent-teal-mint-light',
  },
  warning: {
    bg: 'bg-accent-amber-gold',
    text: 'text-accent-amber-gold',
    border: 'border-accent-amber-gold',
    light: 'bg-accent-amber-gold-light',
  },
  error: {
    bg: 'bg-harken-error',
    text: 'text-harken-error',
    border: 'border-harken-error',
    light: 'bg-accent-red-light',
  },
  info: {
    bg: 'bg-harken-blue',
    text: 'text-harken-blue',
    border: 'border-harken-blue',
    light: 'bg-accent-cyan-light',
  },
  ai: {
    bg: 'bg-accent-indigo',
    text: 'text-accent-indigo',
    border: 'border-accent-indigo',
    light: 'bg-accent-indigo-light',
  },
  locked: {
    bg: 'bg-accent-warm-slate',
    text: 'text-accent-warm-slate',
    border: 'border-accent-warm-slate',
    light: 'bg-accent-warm-slate-light',
  },
} as const;

/**
 * Maps chart data types to their semantic colors
 * For use with Recharts and other charting libraries
 */
export const chartTokens = {
  // Primary data series
  primary: 'harken-blue',      // #0da1c7
  secondary: 'teal-mint',      // #2fc4b2
  tertiary: 'violet',          // #8b5cf6
  quaternary: 'amber-gold',    // #f2b705
  
  // Financial data
  income: 'harken-blue',       // Income/revenue streams
  expense: 'amber-gold',       // Expenses/costs
  net: 'teal-mint',            // Net profit/positive result
  loss: 'harken-error',        // Losses/negative result
  
  // Comparative data
  positive: 'teal-mint',       // Good/up trends
  negative: 'harken-error',    // Bad/down trends
  neutral: 'warm-slate',       // Unchanged/baseline
  
  // Grid & Axes
  grid: 'slate-200',
  axis: 'harken-gray',
} as const;

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Get the appropriate status token based on status type
 */
export function getStatusToken(status: 'success' | 'warning' | 'error' | 'info' | 'ai' | 'locked') {
  return statusTokens[status];
}

/**
 * Get button classes based on variant
 */
export function getButtonClasses(variant: 'primary' | 'secondary' | 'danger' = 'primary') {
  return uiTokens.button[variant];
}

// ============================================
// TYPE DEFINITIONS
// ============================================

export type UITokens = typeof uiTokens;
export type FeatureTokens = typeof featureTokens;
export type StatusTokens = typeof statusTokens;
export type ChartTokens = typeof chartTokens;
export type StatusType = keyof typeof statusTokens;
export type ButtonVariant = keyof typeof uiTokens.button;
