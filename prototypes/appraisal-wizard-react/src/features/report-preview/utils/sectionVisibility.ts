import type { WizardState, AppraisalScenario } from '../../../types';

/**
 * Section visibility rules based on property type and scenario configuration
 */

interface SectionVisibility {
  id: string;
  visible: boolean;
  reason?: string;
}

interface VisibilityRules {
  propertyTypes: string[];      // Empty = all types
  excludePropertyTypes: string[]; // Types where section is hidden
  requiresScenario?: boolean;   // Needs at least one scenario
  requiresApproach?: string;    // Requires specific approach
  requiresData?: (state: WizardState) => boolean; // Custom data check
}

// Section visibility rules
const SECTION_RULES: Record<string, VisibilityRules> = {
  // Always visible sections
  'cover': { propertyTypes: [], excludePropertyTypes: [] },
  'letter': { propertyTypes: [], excludePropertyTypes: [] },
  'toc': { propertyTypes: [], excludePropertyTypes: [] },
  'executive-summary': { propertyTypes: [], excludePropertyTypes: [] },
  'purpose': { propertyTypes: [], excludePropertyTypes: [] },
  'area-analysis': { propertyTypes: [], excludePropertyTypes: [] },
  'neighborhood': { propertyTypes: [], excludePropertyTypes: [] },
  'site-analysis': { propertyTypes: [], excludePropertyTypes: [] },
  'taxes': { propertyTypes: [], excludePropertyTypes: [] },
  'ownership': { propertyTypes: [], excludePropertyTypes: [] },
  'highest-best-use': { propertyTypes: [], excludePropertyTypes: [] },
  'reconciliation': { propertyTypes: [], excludePropertyTypes: [], requiresScenario: true },
  'certification': { propertyTypes: [], excludePropertyTypes: [] },
  'qualifications': { propertyTypes: [], excludePropertyTypes: [] },
  'limiting-conditions': { propertyTypes: [], excludePropertyTypes: [] },
  'addenda': { propertyTypes: [], excludePropertyTypes: [] },

  // Conditional sections
  'improvement-analysis': {
    propertyTypes: [],
    excludePropertyTypes: ['land', 'Land'],
  },
  
  'extraordinary-assumptions': {
    propertyTypes: [],
    excludePropertyTypes: [],
    requiresData: (state) => hasExtraordinaryAssumptions(state),
  },

  // Approach sections
  'cost-approach': {
    propertyTypes: [],
    excludePropertyTypes: [],
    requiresApproach: 'Cost Approach',
  },
  'sales-comparison': {
    propertyTypes: [],
    excludePropertyTypes: [],
    requiresApproach: 'Sales Comparison',
  },
  'income-approach': {
    propertyTypes: [],
    excludePropertyTypes: [],
    requiresApproach: 'Income Approach',
  },

  // Photo sections
  'photos': {
    propertyTypes: [],
    excludePropertyTypes: [],
    requiresData: (state) => hasPhotos(state),
  },
  'maps': {
    propertyTypes: [],
    excludePropertyTypes: [],
  },
};

/**
 * Check if a specific section should be visible based on wizard state
 */
export function isSectionVisible(sectionId: string, state: WizardState): boolean {
  const rules = SECTION_RULES[sectionId];
  
  if (!rules) {
    // Default to visible if no rules defined
    return true;
  }

  // Check property type exclusions
  if (rules.excludePropertyTypes.length > 0 && state.propertyType) {
    if (rules.excludePropertyTypes.includes(state.propertyType)) {
      return false;
    }
  }

  // Check property type requirements
  if (rules.propertyTypes.length > 0 && state.propertyType) {
    if (!rules.propertyTypes.includes(state.propertyType)) {
      return false;
    }
  }

  // Check scenario requirement
  if (rules.requiresScenario && state.scenarios.length === 0) {
    return false;
  }

  // Check approach requirement
  if (rules.requiresApproach) {
    const hasApproach = state.scenarios.some(s => 
      s.approaches.includes(rules.requiresApproach!)
    );
    if (!hasApproach) {
      return false;
    }
  }

  // Check custom data requirement
  if (rules.requiresData && !rules.requiresData(state)) {
    return false;
  }

  return true;
}

/**
 * Get visibility status for all sections
 */
export function getAllSectionVisibility(state: WizardState): SectionVisibility[] {
  return Object.entries(SECTION_RULES).map(([id, rules]) => {
    const visible = isSectionVisible(id, state);
    let reason: string | undefined;

    if (!visible) {
      if (rules.excludePropertyTypes.includes(state.propertyType || '')) {
        reason = `Not applicable for ${state.propertyType} properties`;
      } else if (rules.requiresApproach && !state.scenarios.some(s => s.approaches.includes(rules.requiresApproach!))) {
        reason = `Requires ${rules.requiresApproach} to be selected`;
      } else if (rules.requiresScenario && state.scenarios.length === 0) {
        reason = 'Requires at least one scenario';
      } else if (rules.requiresData) {
        reason = 'Required data not available';
      }
    }

    return { id, visible, reason };
  });
}

/**
 * Get visible approach sections for a specific scenario
 */
export function getVisibleApproachesForScenario(
  scenario: AppraisalScenario,
  _state: WizardState
): string[] {
  const visibleApproaches: string[] = [];

  if (scenario.approaches.includes('Cost Approach')) {
    visibleApproaches.push('cost-approach');
  }
  if (scenario.approaches.includes('Sales Comparison')) {
    visibleApproaches.push('sales-comparison');
  }
  if (scenario.approaches.includes('Income Approach')) {
    visibleApproaches.push('income-approach');
  }

  return visibleApproaches;
}

/**
 * Get all visible sections in order for report generation
 */
export function getVisibleSectionsInOrder(state: WizardState): string[] {
  const sections: string[] = [];

  // Front matter
  const frontMatter = [
    'cover',
    'letter',
    'toc',
    'executive-summary',
    'purpose',
  ];
  sections.push(...frontMatter.filter(s => isSectionVisible(s, state)));

  // Extraordinary assumptions (if any)
  if (isSectionVisible('extraordinary-assumptions', state)) {
    sections.push('extraordinary-assumptions');
  }

  // Property analysis
  const propertyAnalysis = [
    'area-analysis',
    'neighborhood',
    'site-analysis',
    'improvement-analysis',
    'taxes',
    'ownership',
    'highest-best-use',
  ];
  sections.push(...propertyAnalysis.filter(s => isSectionVisible(s, state)));

  // Valuation approaches (per scenario)
  state.scenarios.forEach(scenario => {
    const approachSections = getVisibleApproachesForScenario(scenario, state);
    approachSections.forEach(approachSection => {
      sections.push(`${approachSection}-${scenario.id}`);
    });
  });

  // Reconciliation and closing
  const closing = [
    'reconciliation',
    'certification',
    'qualifications',
    'limiting-conditions',
    'addenda',
  ];
  sections.push(...closing.filter(s => isSectionVisible(s, state)));

  return sections;
}

/**
 * Get required approaches by property type
 */
export function getRequiredApproaches(propertyType: string | null): string[] {
  if (!propertyType) return [];

  const typeRules: Record<string, string[]> = {
    'land': ['Sales Comparison'],
    'Land': ['Sales Comparison'],
    'multi-family': ['Income Approach'],
    'Multi-Family': ['Income Approach'],
    'apartment': ['Income Approach'],
    'Apartment': ['Income Approach'],
  };

  return typeRules[propertyType] || [];
}

/**
 * Get optional approaches by property type
 */
export function getOptionalApproaches(propertyType: string | null): string[] {
  if (!propertyType) return ['Sales Comparison', 'Income Approach', 'Cost Approach'];

  const allApproaches = ['Sales Comparison', 'Income Approach', 'Cost Approach'];
  const required = getRequiredApproaches(propertyType);
  
  // Filter based on property type
  const typeExclusions: Record<string, string[]> = {
    'land': ['Income Approach', 'Cost Approach'], // Land typically uses Sales Comparison only
    'Land': ['Income Approach', 'Cost Approach'],
  };

  const excluded = typeExclusions[propertyType] || [];
  
  return allApproaches.filter(a => 
    !required.includes(a) && !excluded.includes(a)
  );
}

/**
 * Check if property type supports specific approach
 */
export function supportsApproach(propertyType: string | null, approach: string): boolean {
  if (!propertyType) return true;

  const unsupported: Record<string, string[]> = {
    'land': ['Income Approach'], // Land doesn't have income
    'Land': ['Income Approach'],
  };

  return !(unsupported[propertyType] || []).includes(approach);
}

// Helper functions
function hasExtraordinaryAssumptions(_state: WizardState): boolean {
  // Check for extraordinary assumptions in state
  // This could be a separate field in subjectData or a dedicated assumptions array
  return false; // Placeholder - would check actual data
}

function hasPhotos(_state: WizardState): boolean {
  // Check if photos exist in state
  // Would typically check reportConfig.photos or similar
  return true; // Placeholder - photos section usually included
}

export default {
  isSectionVisible,
  getAllSectionVisibility,
  getVisibleApproachesForScenario,
  getVisibleSectionsInOrder,
  getRequiredApproaches,
  getOptionalApproaches,
  supportsApproach,
};

