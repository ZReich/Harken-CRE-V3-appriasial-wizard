/**
 * Comprehensive guidance content for Property Components.
 * 
 * Property components enable mixed-use analysis where a single property
 * contains multiple distinct use types (e.g., retail + residential + parking).
 * Each component can have its own valuation approaches and analysis configuration.
 * 
 * This file provides contextual guidance for:
 * - Component categories (Commercial, Residential, Land)
 * - Analysis types (Full, Contributory, Combined)
 * - Land classifications (Standard, Excess, Surplus)
 * - Approach selection strategies
 */

import type { SectionGuidance } from './wizardPhaseGuidance';

// =============================================================================
// MAIN COMPONENT GUIDANCE (for right sidebar)
// =============================================================================

export const PROPERTY_COMPONENT_GUIDANCE: SectionGuidance = {
  title: 'Property Components',
  context: 'Property components allow you to define distinct use types within a mixed-use property. Each component can have its own valuation approaches, enabling accurate analysis of properties with multiple income streams or diverse physical characteristics.',
  tips: [
    'Start with the primary income-generating component as your first/primary component',
    'Each component\'s square footage should sum to the total building area',
    'Use "Contributory" analysis for secondary components that add value but don\'t warrant separate approaches',
    'Land components with "Excess" classification can be valued separately via land sales comparison',
    'Commercial and residential components typically use different cap rates and market data',
  ],
  mistakes: [
    'Creating overlapping components with duplicated square footage',
    'Using "Full Analysis" for minor components that don\'t warrant separate tabs',
    'Forgetting to enable Income Approach for rent-generating components',
    'Misclassifying land as "Excess" when it cannot be legally subdivided',
    'Not considering how component values will be reconciled in final opinion',
  ],
  uspap: {
    reference: 'SR 1-4(b)',
    title: 'Standards Rule 1-4(b) - Analysis Methods',
    summary: 'Apply appropriate valuation methods for each property component.',
  },
};

// =============================================================================
// CATEGORY-SPECIFIC GUIDANCE
// =============================================================================

export interface CategoryGuidance {
  label: string;
  description: string;
  tips: string[];
  approaches: {
    recommended: string[];
    description: string;
  };
  examples: string[];
}

export const CATEGORY_GUIDANCE: Record<string, CategoryGuidance> = {
  commercial: {
    label: 'Commercial Component',
    description: 'Income-producing commercial space such as retail, office, industrial, or specialty uses. Commercial components typically generate rent from business tenants.',
    tips: [
      'Income Approach is typically primary for commercial components',
      'Consider market rent vs. contract rent for leased spaces',
      'Document tenant mix and lease terms for accurate analysis',
      'Industrial/warehouse may prioritize Sales Comparison over Income',
    ],
    approaches: {
      recommended: ['Income Approach', 'Sales Comparison'],
      description: 'Commercial components typically use Income Approach as primary, with Sales Comparison for support. Cost Approach may apply for newer or special-purpose properties.',
    },
    examples: [
      'Ground-floor retail in a mixed-use building',
      'Office space above street-level retail',
      'Industrial warehouse with attached office',
      'Medical/dental office suites',
    ],
  },
  residential: {
    label: 'Residential Component',
    description: 'Dwelling units for residential occupancy (1-4 units under Marshall & Swift), including duplexes, triplexes, fourplexes, or single-family portions of mixed-use properties.',
    tips: [
      'Use residential-specific cap rates and market data',
      'Consider unit mix (1BR, 2BR, 3BR) for accurate rent analysis',
      'Rent comparables should match unit types and amenity levels',
      'For 2-4 unit residential, both Sales Comparison (GRM) and Income Approach are applicable',
    ],
    approaches: {
      recommended: ['Sales Comparison', 'Income Approach'],
      description: 'Residential components (2-4 units) may use Sales Comparison with GRM/per-unit analysis or Income Approach. For 5+ units, select Commercial - Multi-Family.',
    },
    examples: [
      'Upper-floor apartments above retail',
      'Carriage house or ADU on commercial property',
      'Live/work units in mixed-use development',
      'Residential condos in mixed-use tower',
    ],
  },
  land: {
    label: 'Land Component',
    description: 'Unimproved land portions of the property, including excess land that can be sold separately or surplus land that adds contributory value.',
    tips: [
      'Classify land correctly: Excess can be sold; Surplus cannot',
      'Excess land is valued separately via land sales comparison',
      'Surplus land adds contributory value to the whole property',
      'Consider highest and best use for land portions independently',
    ],
    approaches: {
      recommended: ['Sales Comparison'],
      description: 'Land components use Sales Comparison (land sales) as the primary approach. Excess land is valued as a separate marketable parcel.',
    },
    examples: [
      'Excess parking lot that could be developed',
      'Undeveloped outparcel adjacent to main building',
      'Surplus lawn area that adds to property appeal',
      'Development pad sites within larger parcel',
    ],
  },
};

// =============================================================================
// ANALYSIS TYPE GUIDANCE
// =============================================================================

export interface AnalysisTypeGuidance {
  label: string;
  shortDescription: string;
  fullDescription: string;
  whenToUse: string[];
  considerations: string[];
  icon: 'layers' | 'plus-circle' | 'merge';
}

export const ANALYSIS_TYPE_GUIDANCE: Record<string, AnalysisTypeGuidance> = {
  full: {
    label: 'Full Analysis',
    shortDescription: 'Separate approach tabs for this component',
    fullDescription: 'Creates dedicated analysis tabs for this component, allowing complete Sales Comparison, Income, or Cost approach analysis independent of other components. Component values are reconciled in the final opinion.',
    whenToUse: [
      'Component represents a significant portion of total value (>25%)',
      'Component has distinct market characteristics from other uses',
      'Client or lender requires separate valuations by use type',
      'Component could operate as a standalone property',
    ],
    considerations: [
      'Requires separate comparable data for each approach',
      'Increases analysis complexity and report length',
      'Values must be reconciled with other component conclusions',
      'Best for primary or major secondary components',
    ],
    icon: 'layers',
  },
  contributory: {
    label: 'Contributory Value',
    shortDescription: 'Income approach only, value added to total',
    fullDescription: 'Analyzes component contribution via Income Approach without separate Sales or Cost tabs. Income from this component is included in overall property income analysis. Useful for secondary income sources.',
    whenToUse: [
      'Component provides additional income but is secondary to main use',
      'Component cannot be sold or operated independently',
      'Insufficient market data for separate sales comparison',
      'Component value is primarily tied to income generation',
    ],
    considerations: [
      'Only Income Approach is applied to this component',
      'Component income appears in consolidated income analysis',
      'No separate reconciliation needed - flows into whole property value',
      'Appropriate for most secondary commercial/residential components',
    ],
    icon: 'plus-circle',
  },
  combined: {
    label: 'Combined Analysis',
    shortDescription: 'No separate tabs; income lines added to primary grid',
    fullDescription: 'Component income is merged directly into the primary component\'s income grid as additional line items. No separate tabs or analysis. Best for minor income sources that don\'t warrant separate tracking.',
    whenToUse: [
      'Component is minor relative to whole (<10% of value)',
      'Income source is simple (e.g., single parking lease)',
      'Component characteristics similar to primary use',
      'Simplification is appropriate for assignment scope',
    ],
    considerations: [
      'Component appears as income line items in primary grid only',
      'Cannot track component-specific metrics separately',
      'Fastest analysis approach but least granular',
      'May not meet requirements for detailed mixed-use reports',
    ],
    icon: 'merge',
  },
};

// =============================================================================
// LAND CLASSIFICATION GUIDANCE
// =============================================================================

export interface LandClassificationGuidance {
  label: string;
  shortDescription: string;
  fullDescription: string;
  valuationMethod: string;
  legalConsiderations: string[];
  marketIndicators: string[];
}

export const LAND_CLASSIFICATION_GUIDANCE: Record<string, LandClassificationGuidance> = {
  standard: {
    label: 'Standard Component',
    shortDescription: 'Part of main property improvements',
    fullDescription: 'Standard land allocation representing the site area necessary for the property\'s current improvements and use. This land is integral to the property and valued as part of the whole.',
    valuationMethod: 'Valued as part of the overall property through all applicable approaches. In Cost Approach, land value is estimated separately via land sales comparison.',
    legalConsiderations: [
      'Land is necessary for current use and zoning compliance',
      'Cannot be subdivided without affecting primary improvements',
      'Subject to same zoning and restrictions as improvements',
    ],
    marketIndicators: [
      'Land-to-building ratio is typical for property type',
      'Site provides adequate parking, setbacks, and access',
      'No portion of site is independently developable',
    ],
  },
  excess: {
    label: 'Excess Land',
    shortDescription: 'Can be sold separately (valued via land sales comparison)',
    fullDescription: 'Land beyond what is necessary for the existing improvements that has independent utility and could be sold or developed separately. Excess land is valued as a distinct parcel using land sales comparison.',
    valuationMethod: 'Valued separately using Sales Comparison (land sales) as a potentially marketable parcel. Value is added to improved portion value for total property value.',
    legalConsiderations: [
      'Must be legally subdividable under current zoning',
      'Access must be available independent of main parcel',
      'Utility connections must be feasible for separate development',
      'Check for deed restrictions or easements preventing subdivision',
    ],
    marketIndicators: [
      'Site is oversized relative to improvements and market norms',
      'Portion of site is unused and independently accessible',
      'Market demand exists for separately-developed parcels',
      'Highest and best use as separate parcel is economically viable',
    ],
  },
  surplus: {
    label: 'Surplus Land',
    shortDescription: 'Cannot be sold separately (adds contributory value only)',
    fullDescription: 'Land beyond what is necessary for the improvements but which cannot be sold separately due to legal, physical, or practical constraints. Surplus land adds contributory value but is not independently marketable.',
    valuationMethod: 'Valued based on contributory value to the whole property. May add nominal value for aesthetics, buffer, or future expansion. Not valued as separate marketable parcel.',
    legalConsiderations: [
      'Cannot be legally subdivided under current zoning',
      'May lack independent access or utility connections',
      'Deed restrictions may prevent separate conveyance',
      'Shape or size may prevent practical independent use',
    ],
    marketIndicators: [
      'Land provides buffer, aesthetics, or expansion potential',
      'No separate market demand due to size, shape, or location',
      'Contributory value is less than independent land value would be',
      'Property would not sell for less if surplus land were removed',
    ],
  },
};

// =============================================================================
// APPROACH SELECTION GUIDANCE
// =============================================================================

export interface ApproachGuidance {
  approach: string;
  description: string;
  bestFor: string[];
  considerations: string[];
}

export const APPROACH_GUIDANCE: Record<string, ApproachGuidance> = {
  sales: {
    approach: 'Sales Comparison',
    description: 'Compares the subject component to similar property sales, making adjustments for differences. Most reliable when active market data exists.',
    bestFor: [
      'Land components (land sales comparison)',
      'Residential properties with active sales markets',
      'Commercial properties where investor surveys use sale comparables',
      'Owner-occupied properties where income data is limited',
    ],
    considerations: [
      'Requires comparable sales data for this specific use type',
      'Adjustments should be market-supported, not arbitrary',
      'Most applicable when the component could trade independently',
    ],
  },
  income: {
    approach: 'Income Approach',
    description: 'Values component based on the income it generates, typically using direct capitalization or DCF analysis.',
    bestFor: [
      'Leased commercial spaces with market rent data',
      'Commercial multi-family (5+ units)',
      'Residential 2-4 unit investment properties',
      'Investment properties purchased for income potential',
      'Any component with quantifiable rent or revenue',
    ],
    considerations: [
      'Requires reliable income and expense data',
      'Cap rates should reflect this specific component type',
      'Consider lease terms: contract rent vs. market rent',
    ],
  },
  cost: {
    approach: 'Cost Approach',
    description: 'Estimates component value based on replacement/reproduction cost minus depreciation, plus land value.',
    bestFor: [
      'New construction or recently completed components',
      'Special-purpose improvements with limited sales data',
      'Insurance valuations requiring replacement cost',
      'Components where income approach is not applicable',
    ],
    considerations: [
      'Most reliable for newer improvements with minimal depreciation',
      'Requires accurate construction cost data for component type',
      'Must estimate all forms of depreciation accurately',
    ],
  },
};

// =============================================================================
// CONTEXTUAL TIPS (Smart tips based on current selections)
// =============================================================================

export interface ContextualTip {
  condition: (params: {
    category: string | null;
    propertyType: string | null;
    landClassification: string;
    analysisType: string;
    salesApproach: boolean;
    incomeApproach: boolean;
    costApproach: boolean;
  }) => boolean;
  message: string;
  type: 'info' | 'warning' | 'success';
}

export const CONTEXTUAL_TIPS: ContextualTip[] = [
  // Category-specific
  {
    condition: ({ category }) => category === 'residential',
    message: 'Residential components use unit-based analysis. Consider adding unit mix details for accurate rent comparisons.',
    type: 'info',
  },
  {
    condition: ({ category }) => category === 'land',
    message: 'Land components are valued via Sales Comparison using land sales. Classify correctly as Excess or Surplus.',
    type: 'info',
  },
  
  // Land classification warnings
  {
    condition: ({ category, landClassification }) => 
      category === 'land' && landClassification === 'excess',
    message: 'Excess land must be legally subdividable and have independent access. Verify with zoning and legal records.',
    type: 'warning',
  },
  {
    condition: ({ category, landClassification }) =>
      category !== 'land' && landClassification !== 'standard',
    message: 'Excess/Surplus classification typically applies to land components. Standard is correct for improvements.',
    type: 'info',
  },
  
  // Analysis type recommendations
  {
    condition: ({ analysisType }) => analysisType === 'full',
    message: 'Full Analysis creates separate approach tabs. Best for major components representing >25% of value.',
    type: 'info',
  },
  {
    condition: ({ analysisType }) => analysisType === 'combined',
    message: 'Combined merges this component into the primary grid. Best for minor income sources (<10% of value).',
    type: 'info',
  },
  
  // Approach selection warnings
  {
    condition: ({ category, incomeApproach }) => 
      category === 'commercial' && !incomeApproach,
    message: 'Income Approach is typically essential for commercial components. Consider enabling it.',
    type: 'warning',
  },
  {
    condition: ({ category, salesApproach, incomeApproach }) =>
      category === 'land' && !salesApproach && incomeApproach,
    message: 'Land is typically valued via Sales Comparison, not Income. Reconsider approach selection.',
    type: 'warning',
  },
  {
    condition: ({ salesApproach, incomeApproach, costApproach }) =>
      !salesApproach && !incomeApproach && !costApproach,
    message: 'No approaches enabled. Select at least one valuation approach for this component.',
    type: 'warning',
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get contextual tips based on current component configuration.
 */
export function getContextualTips(params: {
  category: string | null;
  propertyType: string | null;
  landClassification: string;
  analysisType: string;
  salesApproach: boolean;
  incomeApproach: boolean;
  costApproach: boolean;
}): Array<{ message: string; type: 'info' | 'warning' | 'success' }> {
  return CONTEXTUAL_TIPS
    .filter(tip => tip.condition(params))
    .map(({ message, type }) => ({ message, type }));
}

/**
 * Get category-specific guidance.
 */
export function getCategoryGuidance(category: string): CategoryGuidance | null {
  return CATEGORY_GUIDANCE[category] || null;
}

/**
 * Get analysis type guidance.
 */
export function getAnalysisTypeGuidance(analysisType: string): AnalysisTypeGuidance | null {
  return ANALYSIS_TYPE_GUIDANCE[analysisType] || null;
}

/**
 * Get land classification guidance.
 */
export function getLandClassificationGuidance(classification: string): LandClassificationGuidance | null {
  return LAND_CLASSIFICATION_GUIDANCE[classification] || null;
}
