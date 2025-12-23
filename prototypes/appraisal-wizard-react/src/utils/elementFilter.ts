// =================================================================
// ELEMENT FILTER UTILITY
// =================================================================
// Filters elements from the registry based on the current appraisal context:
// - Property Type (commercial, residential, land)
// - Property Subtype (office, industrial, multifamily, etc.)
// - Approach (sales_comparison, income, land_valuation, multi_family)
// - Section (transaction, cap_rate, adjustments, quantitative, qualitative, valuation)
// - Scenario (as_is, as_completed, as_stabilized)
// =================================================================

import { 
  ELEMENT_REGISTRY, 
  ElementDefinition, 
  PropertyType, 
  ApproachType, 
  SectionType,
  ScenarioType 
} from '../constants/elementRegistry';

export interface FilterContext {
  section: SectionType;
  propertyType: string | null;
  subtype: string | null;
  approach: ApproachType;
  scenario?: string;
  excludeKeys?: string[];  // Keys already in use (to exclude from "Add" dropdown)
}

/**
 * Normalizes scenario name to match registry format
 * e.g., "As Is" -> "as_is", "As Completed" -> "as_completed"
 */
function normalizeScenario(scenario: string | undefined): ScenarioType | undefined {
  if (!scenario) return undefined;
  
  const normalized = scenario.toLowerCase().replace(/\s+/g, '_');
  
  switch (normalized) {
    case 'as_is':
      return 'as_is';
    case 'as_completed':
      return 'as_completed';
    case 'as_stabilized':
      return 'as_stabilized';
    default:
      return undefined;
  }
}

/**
 * Checks if an element matches the given property type
 */
function matchesPropertyType(element: ElementDefinition, propertyType: string | null): boolean {
  // If no property type selected, show universal elements only
  if (!propertyType) {
    return element.propertyTypes.includes('all');
  }
  
  // Element applies to all property types
  if (element.propertyTypes.includes('all')) {
    return true;
  }
  
  // Check if element's property types include the current type
  return element.propertyTypes.includes(propertyType as PropertyType);
}

/**
 * Checks if an element matches the given subtype
 */
function matchesSubtype(element: ElementDefinition, subtype: string | null): boolean {
  // If element has no subtype restrictions, it applies to all subtypes
  if (!element.subtypes || element.subtypes.length === 0) {
    return true;
  }
  
  // If no subtype selected but element requires specific subtypes, don't show
  if (!subtype) {
    return false;
  }
  
  // Check if element's subtypes include the current subtype
  return element.subtypes.includes(subtype);
}

/**
 * Checks if an element matches the given approach
 */
function matchesApproach(element: ElementDefinition, approach: ApproachType): boolean {
  // Element applies to all approaches
  if (element.approaches.includes('all')) {
    return true;
  }
  
  // Check if element's approaches include the current approach
  return element.approaches.includes(approach);
}

/**
 * Checks if an element matches the given section
 */
function matchesSection(element: ElementDefinition, section: SectionType): boolean {
  return element.sections.includes(section);
}

/**
 * Checks if an element matches the given scenario
 */
function matchesScenario(element: ElementDefinition, scenario: string | undefined): boolean {
  // If element has no scenario restrictions, it applies to all
  if (!element.scenarios || element.scenarios.length === 0 || element.scenarios.includes('all')) {
    return true;
  }
  
  const normalizedScenario = normalizeScenario(scenario);
  
  // If no scenario specified, show elements that aren't scenario-specific
  if (!normalizedScenario) {
    return false;
  }
  
  return element.scenarios.includes(normalizedScenario);
}

/**
 * Main filter function - returns elements that match ALL criteria
 */
export function getAvailableElements(context: FilterContext): ElementDefinition[] {
  const { section, propertyType, subtype, approach, scenario, excludeKeys = [] } = context;
  
  return ELEMENT_REGISTRY.filter(element => {
    // Exclude elements already in use
    if (excludeKeys.includes(element.key)) {
      return false;
    }
    
    // Must match ALL criteria
    return (
      matchesPropertyType(element, propertyType) &&
      matchesSubtype(element, subtype) &&
      matchesApproach(element, approach) &&
      matchesSection(element, section) &&
      matchesScenario(element, scenario)
    );
  });
}

/**
 * Gets the input type for a cell based on section and element definition
 * Per appraisal standards:
 * - Transaction/Cap Rate: Use element's inputType
 * - Adjustments/Quantitative: Always quantitative popover
 * - Qualitative: Always SIM/SUP/INF chip
 * - Valuation: Calculated (read-only)
 */
export function getCellInputType(section: SectionType, element: ElementDefinition): string {
  switch (section) {
    case 'transaction':
    case 'cap_rate':
      return element.inputType || 'text';
    case 'adjustments':
    case 'quantitative':
      return 'quantitative';
    case 'qualitative':
      return 'qualitative';
    case 'valuation':
      return 'calculated';
    default:
      return 'text';
  }
}

/**
 * Groups available elements by category for organized dropdown display
 */
export function groupElementsByCategory(elements: ElementDefinition[]): Record<string, ElementDefinition[]> {
  const groups: Record<string, ElementDefinition[]> = {};
  
  elements.forEach(element => {
    // Determine category based on property types and subtypes
    let category = 'General';
    
    if (element.propertyTypes.includes('all')) {
      category = 'Universal';
    } else if (element.propertyTypes.includes('land')) {
      category = element.subtypes?.includes('agricultural') ? 'Agricultural' : 'Land';
    } else if (element.propertyTypes.includes('residential')) {
      if (element.subtypes?.length === 1) {
        const subtype = element.subtypes[0];
        category = subtype === '2-4unit' ? '2-4 Unit' : 
                   subtype.charAt(0).toUpperCase() + subtype.slice(1);
      } else {
        category = 'Residential';
      }
    } else if (element.propertyTypes.includes('commercial')) {
      if (element.subtypes?.length === 1) {
        const subtype = element.subtypes[0];
        category = subtype.charAt(0).toUpperCase() + subtype.slice(1);
      } else {
        category = 'Commercial';
      }
    }
    
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(element);
  });
  
  return groups;
}

/**
 * Finds an element definition by key
 */
export function getElementByKey(key: string): ElementDefinition | undefined {
  return ELEMENT_REGISTRY.find(el => el.key === key);
}

/**
 * Converts approach name to registry format
 * e.g., "Sales Comparison" -> "sales_comparison"
 */
export function normalizeApproach(approach: string): ApproachType {
  const normalized = approach.toLowerCase().replace(/\s+/g, '_');
  
  switch (normalized) {
    case 'sales_comparison':
      return 'sales_comparison';
    case 'income':
    case 'income_approach':
      return 'income';
    case 'land_valuation':
    case 'land':
      return 'land_valuation';
    case 'multi_family':
    case 'multi-family':
    case 'multifamily':
      return 'multi_family';
    default:
      return 'sales_comparison';
  }
}

/**
 * Converts section name to registry format
 * Handles various naming conventions used in the grids
 */
export function normalizeSection(section: string): SectionType {
  const normalized = section.toLowerCase().replace(/[\s-]+/g, '_');
  
  switch (normalized) {
    case 'transaction':
    case 'transaction_data':
      return 'transaction';
    case 'cap_rate':
    case 'cap_rate_extraction':
      return 'cap_rate';
    case 'adjustments':
    case 'transactional_adjustments':
      return 'adjustments';
    case 'quantitative':
    case 'quantitative_adjustments':
      return 'quantitative';
    case 'qualitative':
    case 'qualitative_characteristics':
      return 'qualitative';
    case 'valuation':
    case 'valuation_analysis':
      return 'valuation';
    default:
      return 'transaction';
  }
}

