/**
 * useComponentHealthAnalysis Hook
 * 
 * Analyzes building components to detect aging issues and generate
 * suggestions for SWOT Analysis weaknesses and threats.
 * 
 * Features:
 * - Identifies components past 50% depreciation (warnings)
 * - Identifies components past 75% depreciation (critical)
 * - Generates plain-language suggestions for SWOT entries
 * - Aggregates issues across all buildings
 */

import { useMemo } from 'react';
import type { 
  ImprovementsInventory, 
  ComponentDetail,
  ImprovementBuilding,
} from '../types';
import { getBuildingComponentType } from '../constants/buildingComponents';

// =================================================================
// TYPES
// =================================================================

export type IssueSeverity = 'warning' | 'critical';

export interface ComponentHealthIssue {
  /**
   * Unique ID for this issue.
   */
  id: string;
  
  /**
   * The component type label (e.g., "TPO Membrane", "RTU").
   */
  componentType: string;
  
  /**
   * Component ID reference.
   */
  componentId: string;
  
  /**
   * Building name where this component is located.
   */
  buildingName: string;
  
  /**
   * Building ID reference.
   */
  buildingId: string;
  
  /**
   * Component category (e.g., "roofing", "heating").
   */
  category: string;
  
  /**
   * Depreciation percentage (0-100+).
   */
  depreciationPercent: number;
  
  /**
   * Remaining useful life in years.
   */
  remainingLife: number;
  
  /**
   * Year installed (if known).
   */
  yearInstalled?: number;
  
  /**
   * Total economic life.
   */
  economicLife: number;
  
  /**
   * Severity level.
   * - warning: 50-75% depreciation
   * - critical: >75% depreciation
   */
  severity: IssueSeverity;
  
  /**
   * Plain-language suggestion for SWOT entry.
   */
  suggestion: string;
  
  /**
   * Whether this should go in Weaknesses or Threats section.
   */
  swotCategory: 'weakness' | 'threat';
}

export interface ComponentHealthSummary {
  /**
   * Issues suitable for SWOT Weaknesses (50-75% depreciation).
   */
  weaknesses: ComponentHealthIssue[];
  
  /**
   * Issues suitable for SWOT Threats (>75% depreciation).
   */
  threats: ComponentHealthIssue[];
  
  /**
   * All issues combined.
   */
  allIssues: ComponentHealthIssue[];
  
  /**
   * Summary statistics.
   */
  stats: {
    totalComponents: number;
    warningCount: number;
    criticalCount: number;
    hasIssues: boolean;
  };
}

export interface UseComponentHealthAnalysisParams {
  /**
   * The improvements inventory to analyze.
   */
  improvementsInventory: ImprovementsInventory;
  
  /**
   * Threshold for warning level (default: 50).
   */
  warningThreshold?: number;
  
  /**
   * Threshold for critical level (default: 75).
   */
  criticalThreshold?: number;
}

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Calculate depreciation percentage for a component.
 */
function calculateDepreciation(component: ComponentDetail): number {
  const effectiveAge = component.effectiveAge || 0;
  const economicLife = component.economicLife || 30;
  
  if (economicLife <= 0) return 0;
  return Math.round((effectiveAge / economicLife) * 100);
}

/**
 * Generate a plain-language suggestion for a component issue.
 */
function generateSuggestion(
  componentType: string,
  depreciationPercent: number,
  remainingLife: number,
  yearInstalled?: number,
  severity: IssueSeverity = 'warning'
): string {
  const currentYear = new Date().getFullYear();
  const age = yearInstalled ? currentYear - yearInstalled : 'Unknown';
  
  if (severity === 'critical') {
    if (remainingLife <= 0) {
      return `${componentType} ${yearInstalled ? `(installed ${yearInstalled})` : ''} has exceeded its typical economic life and may require replacement`;
    }
    return `${componentType} showing ${depreciationPercent}% depreciation with approximately ${remainingLife} years remaining useful life`;
  }
  
  return `${componentType} approaching end of useful life (${depreciationPercent}% depreciated, ~${remainingLife} years remaining)`;
}

/**
 * Get category label for display.
 */
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'foundation': 'Foundation',
    'roofing': 'Roof',
    'walls': 'Exterior Walls',
    'windows': 'Windows',
    'electrical': 'Electrical',
    'heating': 'Heating',
    'cooling': 'Cooling',
    'fire-protection': 'Fire Protection',
    'elevators': 'Elevators',
    'ceilings': 'Ceilings',
    'flooring': 'Flooring',
  };
  return labels[category] || category;
}

/**
 * Analyze a single component for health issues.
 */
function analyzeComponent(
  component: ComponentDetail,
  building: ImprovementBuilding,
  category: string,
  warningThreshold: number,
  criticalThreshold: number
): ComponentHealthIssue | null {
  const depreciationPercent = calculateDepreciation(component);
  
  // Skip if below warning threshold
  if (depreciationPercent < warningThreshold) {
    return null;
  }
  
  const economicLife = component.economicLife || 30;
  const effectiveAge = component.effectiveAge || 0;
  const remainingLife = Math.max(0, economicLife - effectiveAge);
  
  const severity: IssueSeverity = depreciationPercent >= criticalThreshold ? 'critical' : 'warning';
  const swotCategory: 'weakness' | 'threat' = severity === 'critical' ? 'threat' : 'weakness';
  
  return {
    id: `${building.id}-${component.id}`,
    componentType: component.type,
    componentId: component.id,
    buildingName: building.name,
    buildingId: building.id,
    category: getCategoryLabel(category),
    depreciationPercent,
    remainingLife,
    yearInstalled: component.yearInstalled,
    economicLife,
    severity,
    suggestion: generateSuggestion(
      component.type,
      depreciationPercent,
      remainingLife,
      component.yearInstalled,
      severity
    ),
    swotCategory,
  };
}

// =================================================================
// HOOK
// =================================================================

export function useComponentHealthAnalysis(
  params: UseComponentHealthAnalysisParams
): ComponentHealthSummary {
  const {
    improvementsInventory,
    warningThreshold = 50,
    criticalThreshold = 75,
  } = params;
  
  return useMemo(() => {
    const allIssues: ComponentHealthIssue[] = [];
    let totalComponents = 0;
    
    // Iterate through all parcels and buildings
    for (const parcel of improvementsInventory.parcels) {
      for (const building of parcel.buildings) {
        // Analyze exterior features
        const exteriorDetails = [
          ...(building.exteriorFeatures?.foundationDetails || []).map(c => ({ component: c, category: 'foundation' })),
          ...(building.exteriorFeatures?.roofDetails || []).map(c => ({ component: c, category: 'roofing' })),
          ...(building.exteriorFeatures?.wallDetails || []).map(c => ({ component: c, category: 'walls' })),
          ...(building.exteriorFeatures?.windowDetails || []).map(c => ({ component: c, category: 'windows' })),
        ];
        
        // Analyze mechanical systems
        const mechanicalDetails = [
          ...(building.mechanicalSystems?.electricalDetails || []).map(c => ({ component: c, category: 'electrical' })),
          ...(building.mechanicalSystems?.heatingDetails || []).map(c => ({ component: c, category: 'heating' })),
          ...(building.mechanicalSystems?.coolingDetails || []).map(c => ({ component: c, category: 'cooling' })),
          ...(building.mechanicalSystems?.sprinklerDetails || []).map(c => ({ component: c, category: 'fire-protection' })),
          ...(building.mechanicalSystems?.elevatorDetails || []).map(c => ({ component: c, category: 'elevators' })),
        ];
        
        // Analyze interior finishes from each area
        const interiorDetails: { component: ComponentDetail; category: string }[] = [];
        for (const area of building.areas) {
          if (area.interiorFeatures) {
            interiorDetails.push(
              ...(area.interiorFeatures.ceilingDetails || []).map(c => ({ component: c, category: 'ceilings' })),
              ...(area.interiorFeatures.flooringDetails || []).map(c => ({ component: c, category: 'flooring' })),
              ...(area.interiorFeatures.wallDetails || []).map(c => ({ component: c, category: 'walls' })),
              ...(area.interiorFeatures.plumbingDetails || []).map(c => ({ component: c, category: 'plumbing' })),
              ...(area.interiorFeatures.lightingDetails || []).map(c => ({ component: c, category: 'lighting' })),
            );
          }
        }
        
        // Combine all details
        const allDetails = [...exteriorDetails, ...mechanicalDetails, ...interiorDetails];
        totalComponents += allDetails.length;
        
        // Analyze each component
        for (const { component, category } of allDetails) {
          const issue = analyzeComponent(
            component,
            building,
            category,
            warningThreshold,
            criticalThreshold
          );
          
          if (issue) {
            allIssues.push(issue);
          }
        }
      }
    }
    
    // Separate weaknesses and threats
    const weaknesses = allIssues.filter(i => i.swotCategory === 'weakness');
    const threats = allIssues.filter(i => i.swotCategory === 'threat');
    
    return {
      weaknesses,
      threats,
      allIssues,
      stats: {
        totalComponents,
        warningCount: weaknesses.length,
        criticalCount: threats.length,
        hasIssues: allIssues.length > 0,
      },
    };
  }, [improvementsInventory, warningThreshold, criticalThreshold]);
}

export default useComponentHealthAnalysis;

